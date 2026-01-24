import { injectable, inject } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IMealRecipeService } from '../../domain/services/IMealRecipeService';
import type { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';

export interface GetRandomRecipesResult {
  success: boolean;
  recipes?: Recipe[];
  error?: string;
}

/**
 * ランダムレシピ取得ユースケース
 * ランダムに選ばれたレシピを取得する
 */
@injectable()
export class GetRandomRecipesUseCase {
  constructor(
    @inject('IMealRecipeService')
    private readonly recipeService: IMealRecipeService,
    @inject('IRecipeRepository')
    private readonly recipeRepository: IRecipeRepository
  ) {}

  async execute(count: number = 5): Promise<GetRandomRecipesResult> {
    try {
      const recipes = await this.recipeService.getRandomRecipes(count);

      // お気に入り状態を反映
      const favoriteRecipes = await this.recipeRepository.findAll();
      const favoriteIds = new Set(
        favoriteRecipes.map((r) => r.id.value)
      );

      recipes.forEach((recipe) => {
        if (favoriteIds.has(recipe.id.value)) {
          recipe.markAsFavorite();
        }
      });

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
            : 'Failed to get random recipes',
      };
    }
  }
}
