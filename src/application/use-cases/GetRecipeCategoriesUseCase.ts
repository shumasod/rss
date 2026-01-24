import { injectable, inject } from 'tsyringe';
import type { IMealRecipeService } from '../../domain/services/IMealRecipeService';

export interface GetRecipeCategoriesResult {
  success: boolean;
  categories?: string[];
  error?: string;
}

/**
 * レシピカテゴリ一覧取得ユースケース
 * 利用可能なレシピカテゴリの一覧を取得する
 */
@injectable()
export class GetRecipeCategoriesUseCase {
  constructor(
    @inject('IMealRecipeService')
    private readonly recipeService: IMealRecipeService
  ) {}

  async execute(): Promise<GetRecipeCategoriesResult> {
    try {
      const categories = await this.recipeService.getCategories();

      return {
        success: true,
        categories,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get recipe categories',
      };
    }
  }
}
