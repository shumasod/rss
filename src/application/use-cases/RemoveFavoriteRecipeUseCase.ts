import { injectable, inject } from 'tsyringe';
import type { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';

export interface RemoveFavoriteRecipeResult {
  success: boolean;
  error?: string;
}

/**
 * お気に入りレシピ削除ユースケース
 * レシピをお気に入りから削除する
 */
@injectable()
export class RemoveFavoriteRecipeUseCase {
  constructor(
    @inject('IRecipeRepository')
    private readonly recipeRepository: IRecipeRepository
  ) {}

  async execute(recipeId: string): Promise<RemoveFavoriteRecipeResult> {
    try {
      await this.recipeRepository.delete(recipeId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove favorite recipe',
      };
    }
  }
}
