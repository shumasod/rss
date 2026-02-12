import { injectable } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IMealRecipeService } from '../../domain/services/IMealRecipeService';

/**
 * Spoonacular APIを使用したレシピサービス実装
 * https://spoonacular.com/food-api
 *
 * 無料プラン: 1日150リクエスト（クレジットカード不要）
 * APIキー取得: https://spoonacular.com/food-api/console#Dashboard
 */
@injectable()
export class SpoonacularRecipeService implements IMealRecipeService {
  private readonly BASE_URL = 'https://api.spoonacular.com';
  private readonly API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || '';

  async searchByName(name: string): Promise<Recipe[]> {
    if (!this.API_KEY) {
      console.warn('Spoonacular APIキーが設定されていません');
      return [];
    }

    try {
      // 複雑な検索（詳細情報付き）
      const response = await fetch(
        `${this.BASE_URL}/recipes/complexSearch?apiKey=${this.API_KEY}&query=${encodeURIComponent(name)}&number=12&addRecipeInformation=true&fillIngredients=true`
      );

      if (response.status === 402) {
        console.warn('Spoonacular: 1日の使用制限に達しました（150リクエスト/日）');
        return [];
      }

      const data = await response.json();

      if (!data.results) return [];

      return data.results.map((item: any) => this.mapToRecipe(item));
    } catch (error) {
      console.error('Spoonacular 検索エラー:', error);
      return [];
    }
  }

  async searchByCategory(category: string): Promise<Recipe[]> {
    if (!this.API_KEY) return [];

    try {
      // カテゴリ（料理の種類）で検索
      const response = await fetch(
        `${this.BASE_URL}/recipes/complexSearch?apiKey=${this.API_KEY}&cuisine=${encodeURIComponent(category)}&number=12&addRecipeInformation=true&fillIngredients=true`
      );

      if (response.status === 402) {
        console.warn('Spoonacular: 1日の使用制限に達しました');
        return [];
      }

      const data = await response.json();
      if (!data.results) return [];

      return data.results.map((item: any) => this.mapToRecipe(item));
    } catch (error) {
      console.error('Spoonacular カテゴリ検索エラー:', error);
      return [];
    }
  }

  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    if (!this.API_KEY) return [];

    try {
      const response = await fetch(
        `${this.BASE_URL}/recipes/random?apiKey=${this.API_KEY}&number=${count}`
      );

      if (response.status === 402) {
        console.warn('Spoonacular: 1日の使用制限に達しました');
        return [];
      }

      const data = await response.json();
      if (!data.recipes) return [];

      return data.recipes.map((item: any) => this.mapToRecipe(item));
    } catch (error) {
      console.error('Spoonacular ランダムレシピエラー:', error);
      return [];
    }
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    if (!this.API_KEY) return null;

    try {
      const response = await fetch(
        `${this.BASE_URL}/recipes/${id}/information?apiKey=${this.API_KEY}&includeNutrition=false`
      );

      if (!response.ok) return null;

      const item = await response.json();
      return this.mapToRecipe(item);
    } catch (error) {
      console.error('Spoonacular レシピ詳細取得エラー:', error);
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    // Spoonacularのcuisine（料理の種類）
    return [
      'African', 'Asian', 'American', 'British', 'Cajun',
      'Caribbean', 'Chinese', 'Eastern European', 'European',
      'French', 'German', 'Greek', 'Indian', 'Irish',
      'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American',
      'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic',
      'Southern', 'Spanish', 'Thai', 'Vietnamese',
    ];
  }

  private mapToRecipe(item: any): Recipe {
    const ingredients: { name: string; measure: string }[] = [];

    // extendedIngredients があれば使用
    if (item.extendedIngredients) {
      for (const ing of item.extendedIngredients.slice(0, 20)) {
        ingredients.push({
          name: ing.name || ing.nameClean || '',
          measure: ing.measures?.us
            ? `${ing.measures.us.amount} ${ing.measures.us.unitShort}`
            : ing.original || '',
        });
      }
    }

    return Recipe.reconstruct(
      item.id?.toString() || '',
      item.title || '',
      item.cuisines?.join(', ') || item.dishTypes?.[0] || 'Other',
      item.cuisines?.[0] || 'International',
      // summaryからHTMLタグを除去
      (item.instructions || item.summary || '').replace(/<[^>]*>/g, ''),
      item.image || '',
      ingredients,
      undefined,
      item.sourceUrl || undefined,
      false
    );
  }
}
