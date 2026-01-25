import { injectable } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IMealRecipeService } from '../../domain/services/IMealRecipeService';

/**
 * 楽天レシピAPIを使用したレシピサービス実装
 * https://webservice.rakuten.co.jp/documentation/recipe
 *
 * 注意: 楽天APIを使用するには、楽天デベロッパーIDが必要です
 * https://webservice.rakuten.co.jp/ でアカウント登録してください
 */
@injectable()
export class RakutenRecipeService implements IMealRecipeService {
  private readonly BASE_URL = 'https://app.rakuten.co.jp/services/api/Recipe';
  private readonly APP_ID = import.meta.env.VITE_RAKUTEN_APP_ID || 'demo'; // 環境変数から取得

  async searchByName(name: string): Promise<Recipe[]> {
    if (this.APP_ID === 'demo') {
      console.warn('楽天APIキーが設定されていません。デモデータを返します。');
      return this.getDemoRecipes(name);
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/CategoryRanking/20170426?format=json&applicationId=${this.APP_ID}&categoryId=${name}`
      );
      const data = await response.json();

      if (!data.result) {
        return [];
      }

      return data.result.slice(0, 12).map((item: any) => this.mapToRecipe(item));
    } catch (error) {
      console.error('楽天レシピAPIエラー:', error);
      return this.getDemoRecipes(name);
    }
  }

  async searchByCategory(category: string): Promise<Recipe[]> {
    return this.searchByName(category);
  }

  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    // カテゴリIDの例: 30（人気メニュー）、31（定番メニュー）
    const categoryIds = ['30', '31', '32', '33', '34'];
    const randomCategory = categoryIds[Math.floor(Math.random() * categoryIds.length)];

    const recipes = await this.searchByName(randomCategory);
    return recipes.slice(0, count);
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    if (this.APP_ID === 'demo') {
      const demos = this.getDemoRecipes('demo');
      return demos.find(r => r.id.value === id) || null;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/CategoryRanking/20170426?format=json&applicationId=${this.APP_ID}&recipeId=${id}`
      );
      const data = await response.json();

      if (!data.result || data.result.length === 0) {
        return null;
      }

      return this.mapToRecipe(data.result[0]);
    } catch (error) {
      console.error('楽天レシピ取得エラー:', error);
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    return [
      '人気メニュー',
      '定番の和食',
      '定番の洋食',
      '定番の中華',
      'お菓子',
      'パン',
      'お弁当',
      '簡単料理',
      '節約料理',
      '今日の献立'
    ];
  }

  private mapToRecipe(item: any): Recipe {
    const ingredients = this.extractIngredients(item.recipeMaterial || []);

    return Recipe.reconstruct(
      item.recipeId?.toString() || Math.random().toString(),
      item.recipeTitle || 'レシピ',
      item.categoryId || 'その他',
      '日本',
      item.recipeDescription || item.recipeTitle || '',
      item.foodImageUrl || item.recipeUrl || '',
      ingredients,
      undefined, // YouTube URL
      item.recipeUrl, // 楽天レシピのURL
      false
    );
  }

  private extractIngredients(materials: string[]): { name: string; measure: string }[] {
    // 楽天レシピの材料形式: "材料名：分量"
    return materials.slice(0, 20).map((material) => {
      const parts = material.split('：');
      return {
        name: parts[0] || material,
        measure: parts[1] || ''
      };
    });
  }

  /**
   * デモデータ（APIキーが設定されていない場合）
   */
  private getDemoRecipes(_query: string): Recipe[] {
    const demos = [
      {
        id: 'demo-1',
        title: '親子丼',
        category: '和食',
        description: '鶏肉と卵で作る定番の丼物。ふわふわの卵がご飯にからんで絶品です。',
        image: 'https://placehold.co/400x300/667eea/white?text=%E8%A6%AA%E5%AD%90%E4%B8%BC',
        ingredients: [
          { name: '鶏もも肉', measure: '200g' },
          { name: '玉ねぎ', measure: '1/2個' },
          { name: '卵', measure: '3個' },
          { name: 'だし汁', measure: '200ml' },
          { name: '醤油', measure: '大さじ2' },
          { name: 'みりん', measure: '大さじ2' },
          { name: '砂糖', measure: '大さじ1' }
        ]
      },
      {
        id: 'demo-2',
        title: 'カレーライス',
        category: '洋食',
        description: '家庭の定番カレー。野菜たっぷりで栄養満点です。',
        image: 'https://placehold.co/400x300/764ba2/white?text=%E3%82%AB%E3%83%AC%E3%83%BC',
        ingredients: [
          { name: '豚肉', measure: '300g' },
          { name: 'じゃがいも', measure: '3個' },
          { name: '玉ねぎ', measure: '2個' },
          { name: 'にんじん', measure: '1本' },
          { name: 'カレールー', measure: '1箱' },
          { name: '水', measure: '800ml' }
        ]
      },
      {
        id: 'demo-3',
        title: '麻婆豆腐',
        category: '中華',
        description: 'ピリ辛で食欲をそそる中華の定番。ご飯が進みます。',
        image: 'https://placehold.co/400x300/f39c12/white?text=%E9%BA%BB%E5%A9%86%E8%B1%86%E8%85%90',
        ingredients: [
          { name: '豆腐', measure: '1丁' },
          { name: '豚ひき肉', measure: '150g' },
          { name: '長ネギ', measure: '1本' },
          { name: '豆板醤', measure: '小さじ2' },
          { name: '醤油', measure: '大さじ2' },
          { name: '鶏がらスープ', measure: '200ml' },
          { name: '片栗粉', measure: '大さじ1' }
        ]
      },
      {
        id: 'demo-4',
        title: 'ハンバーグ',
        category: '洋食',
        description: 'ジューシーな肉汁があふれる手作りハンバーグ。',
        image: 'https://placehold.co/400x300/e74c3c/white?text=%E3%83%8F%E3%83%B3%E3%83%90%E3%83%BC%E3%82%B0',
        ingredients: [
          { name: '合いびき肉', measure: '400g' },
          { name: '玉ねぎ', measure: '1個' },
          { name: 'パン粉', measure: '1/2カップ' },
          { name: '卵', measure: '1個' },
          { name: '牛乳', measure: '大さじ3' },
          { name: '塩コショウ', measure: '適量' },
          { name: 'ナツメグ', measure: '少々' }
        ]
      },
      {
        id: 'demo-5',
        title: 'チャーハン',
        category: '中華',
        description: 'パラパラの本格的なチャーハン。冷蔵庫の残り物でも作れます。',
        image: 'https://placehold.co/400x300/27ae60/white?text=%E3%83%81%E3%83%A3%E3%83%BC%E3%83%8F%E3%83%B3',
        ingredients: [
          { name: 'ご飯', measure: '茶碗2杯' },
          { name: '卵', measure: '2個' },
          { name: 'ハム', measure: '4枚' },
          { name: '長ネギ', measure: '1/2本' },
          { name: '醤油', measure: '大さじ1' },
          { name: '塩コショウ', measure: '適量' },
          { name: 'ごま油', measure: '小さじ1' }
        ]
      }
    ];

    return demos.map(demo =>
      Recipe.reconstruct(
        demo.id,
        demo.title,
        demo.category,
        '日本',
        demo.description,
        demo.image,
        demo.ingredients,
        undefined,
        `https://recipe.rakuten.co.jp/recipe/${demo.id}/`,
        false
      )
    );
  }
}
