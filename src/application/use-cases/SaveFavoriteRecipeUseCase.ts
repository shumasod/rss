import { injectable, inject } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';

export interface SaveFavoriteRecipeResult {
  success: boolean;
  error?: string;
}

/**
 * お気に入りレシピ保存ユースケース
 * レシピをお気に入りとして保存する
 */
@injectable()
export class SaveFavoriteRecipeUseCase {
  constructor(
    @inject('IRecipeRepository')
    private readonly recipeRepository: IRecipeRepository
  ) {}

  async execute(recipe: Recipe): Promise<SaveFavoriteRecipeResult> {
    try {
      recipe.markAsFavorite();
      await this.recipeRepository.save(recipe);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save favorite recipe',
      };
    }
  }
}
