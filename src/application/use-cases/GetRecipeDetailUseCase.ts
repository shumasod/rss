import { injectable, inject } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IMealRecipeService } from '../../domain/services/IMealRecipeService';
import type { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';

export interface GetRecipeDetailResult {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}

/**
 * レシピ詳細取得ユースケース
 * 特定のレシピの詳細情報を取得する
 */
@injectable()
export class GetRecipeDetailUseCase {
  constructor(
    @inject('IMealRecipeService')
    private readonly recipeService: IMealRecipeService,
    @inject('IRecipeRepository')
    private readonly recipeRepository: IRecipeRepository
  ) {}

  async execute(recipeId: string): Promise<GetRecipeDetailResult> {
    try {
      const recipe = await this.recipeService.getRecipeById(recipeId);

      if (!recipe) {
        return {
          success: false,
          error: 'Recipe not found',
        };
      }

      // お気に入り状態を確認
      const isFavorite = await this.recipeRepository.isFavorite(recipeId);
      if (isFavorite) {
        recipe.markAsFavorite();
      }

      return {
        success: true,
        recipe,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get recipe details',
      };
    }
  }
}
