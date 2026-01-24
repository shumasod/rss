import { injectable, inject } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';

export interface GetFavoriteRecipesResult {
  success: boolean;
  recipes?: Recipe[];
  error?: string;
}

/**
 * お気に入りレシピ一覧取得ユースケース
 * 保存された全てのお気に入りレシピを取得する
 */
@injectable()
export class GetFavoriteRecipesUseCase {
  constructor(
    @inject('IRecipeRepository')
    private readonly recipeRepository: IRecipeRepository
  ) {}

  async execute(): Promise<GetFavoriteRecipesResult> {
    try {
      const recipes = await this.recipeRepository.findAll();

      return {
        success: true,
        recipes,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get favorite recipes',
      };
    }
  }
}
