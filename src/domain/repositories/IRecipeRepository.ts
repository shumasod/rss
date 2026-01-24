import { Recipe } from '../entities/Recipe';

/**
 * レシピリポジトリインターフェース
 * レシピデータの永続化を担当
 */
export interface IRecipeRepository {
  /**
   * お気に入りレシピを保存
   */
  save(recipe: Recipe): Promise<void>;

  /**
   * お気に入りレシピを削除
   */
  delete(recipeId: string): Promise<void>;

  /**
   * 全てのお気に入りレシピを取得
   */
  findAll(): Promise<Recipe[]>;

  /**
   * IDでお気に入りレシピを検索
   */
  findById(recipeId: string): Promise<Recipe | null>;

  /**
   * お気に入りレシピかどうか確認
   */
  isFavorite(recipeId: string): Promise<boolean>;
}
