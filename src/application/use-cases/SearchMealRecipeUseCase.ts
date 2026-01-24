import { injectable, inject } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import type { IMealRecipeService } from '../../domain/services/IMealRecipeService';
import type { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';

export interface SearchMealRecipeResult {
  success: boolean;
  recipes?: Recipe[];
  error?: string;
}

/**
 * レシピ検索ユースケース
 * レシピ名またはカテゴリでレシピを検索する
 */
@injectable()
export class SearchMealRecipeUseCase {
  constructor(
    @inject('IMealRecipeService')
    private readonly recipeService: IMealRecipeService,
    @inject('IRecipeRepository')
    private readonly recipeRepository: IRecipeRepository
  ) {}

  async execute(
    query: string,
    searchType: 'name' | 'category' = 'name'
  ): Promise<SearchMealRecipeResult> {
    try {
      let recipes: Recipe[];

      if (searchType === 'category') {
        recipes = await this.recipeService.searchByCategory(query);
      } else {
        recipes = await this.recipeService.searchByName(query);
      }

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
            : 'Failed to search recipes',
      };
    }
  }
}
