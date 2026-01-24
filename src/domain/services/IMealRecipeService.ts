import { Recipe } from '../entities/Recipe';

/**
 * レシピ検索サービスインターフェース
 * 外部APIからレシピを取得
 */
export interface IMealRecipeService {
  /**
   * レシピ名で検索
   */
  searchByName(name: string): Promise<Recipe[]>;

  /**
   * カテゴリで検索
   */
  searchByCategory(category: string): Promise<Recipe[]>;

  /**
   * ランダムにレシピを取得
   */
  getRandomRecipes(count?: number): Promise<Recipe[]>;

  /**
   * IDで特定のレシピを取得
   */
  getRecipeById(id: string): Promise<Recipe | null>;

  /**
   * 利用可能なカテゴリ一覧を取得
   */
  getCategories(): Promise<string[]>;
}
