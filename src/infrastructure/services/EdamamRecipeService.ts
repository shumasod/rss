import { injectable } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IMealRecipeService } from '../../domain/services/IMealRecipeService';

/**
 * Edamam Recipe APIを使用したレシピサービス実装
 * https://developer.edamam.com/edamam-recipe-api
 *
 * 無料プラン: 10リクエスト/分（クレジットカード不要）
 * APIキー取得: https://developer.edamam.com/
 *
 * 注意: 利用にはattribution（Edamamへのリンク表示）が必要
 */
@injectable()
export class EdamamRecipeService implements IMealRecipeService {
  private readonly BASE_URL = 'https://api.edamam.com/api/recipes/v2';
  private readonly APP_ID = import.meta.env.VITE_EDAMAM_APP_ID || '';
  private readonly APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY || '';

  async searchByName(name: string): Promise<Recipe[]> {
    if (!this.APP_ID || !this.APP_KEY) {
      console.warn('Edamam APIキーが設定されていません');
      return [];
    }

    try {
      const params = new URLSearchParams({
        app_id: this.APP_ID,
        app_key: this.APP_KEY,
        type: 'public',
        q: name,
      });

      const response = await fetch(`${this.BASE_URL}?${params}`);

      if (!response.ok) {
        console.error('Edamam APIエラー:', response.status);
        return [];
      }

      const data = await response.json();

      if (!data.hits) return [];

      return data.hits
        .slice(0, 12)
        .map((hit: any) => this.mapToRecipe(hit.recipe, hit._links?.self?.href));
    } catch (error) {
      console.error('Edamam 検索エラー:', error);
      return [];
    }
  }

  async searchByCategory(category: string): Promise<Recipe[]> {
    if (!this.APP_ID || !this.APP_KEY) return [];

    try {
      const params = new URLSearchParams({
        app_id: this.APP_ID,
        app_key: this.APP_KEY,
        type: 'public',
        q: category,
        cuisineType: category.toLowerCase(),
      });

      const response = await fetch(`${this.BASE_URL}?${params}`);

      if (!response.ok) return [];

      const data = await response.json();
      if (!data.hits) return [];

      return data.hits
        .slice(0, 12)
        .map((hit: any) => this.mapToRecipe(hit.recipe, hit._links?.self?.href));
    } catch (error) {
      console.error('Edamam カテゴリ検索エラー:', error);
      return [];
    }
  }

  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    // Edamamはランダム取得APIがないため、人気キーワードで検索
    const keywords = ['chicken', 'pasta', 'salad', 'soup', 'rice', 'beef', 'fish'];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const results = await this.searchByName(randomKeyword);
    return results.slice(0, count);
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    if (!this.APP_ID || !this.APP_KEY) return null;

    try {
      // Edamamのレシピ詳細はIDからURIを再構築
      const encodedId = encodeURIComponent(id);
      const params = new URLSearchParams({
        app_id: this.APP_ID,
        app_key: this.APP_KEY,
        type: 'public',
      });

      const response = await fetch(
        `${this.BASE_URL}/${encodedId}?${params}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.recipe) return null;

      return this.mapToRecipe(data.recipe, undefined);
    } catch (error) {
      console.error('Edamam レシピ詳細取得エラー:', error);
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    return [
      'American', 'Asian', 'British', 'Caribbean', 'Central Europe',
      'Chinese', 'Eastern Europe', 'French', 'Greek', 'Indian',
      'Italian', 'Japanese', 'Korean', 'Kosher', 'Mediterranean',
      'Mexican', 'Middle Eastern', 'Nordic', 'South American',
      'South East Asian', 'World',
    ];
  }

  private mapToRecipe(recipe: any, selfUrl?: string): Recipe {
    const ingredients: { name: string; measure: string }[] = (
      recipe.ingredientLines || []
    ).slice(0, 20).map((line: string) => {
      // "1 cup flour" -> name: "flour", measure: "1 cup"
      const parts = line.split(' ');
      const measureParts = parts.slice(0, 2).join(' ');
      const nameParts = parts.slice(2).join(' ');
      return {
        name: nameParts || line,
        measure: measureParts || '',
      };
    });

    // レシピIDをURIの末尾部分から抽出
    const uriId = recipe.uri?.split('#recipe_')[1] || selfUrl || recipe.uri || '';

    return Recipe.reconstruct(
      uriId,
      recipe.label || '',
      recipe.cuisineType?.join(', ') || recipe.mealType?.[0] || 'Other',
      recipe.cuisineType?.[0] || 'International',
      recipe.ingredientLines?.join('\n') || '',
      recipe.image || '',
      ingredients,
      undefined,
      recipe.url || recipe.shareAs || undefined,
      false
    );
  }
}
