import { injectable } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';

/**
 * LocalStorageを使用したレシピリポジトリ実装
 * お気に入りレシピをブラウザのLocalStorageに保存
 */
@injectable()
export class LocalStorageRecipeRepository implements IRecipeRepository {
  private readonly STORAGE_KEY = 'favorite_recipes';

  async save(recipe: Recipe): Promise<void> {
    const recipes = await this.findAll();
    const existingIndex = recipes.findIndex(
      (r) => r.id.value === recipe.id.value
    );

    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe;
    } else {
      recipes.push(recipe);
    }

    this.saveToStorage(recipes);
  }

  async delete(recipeId: string): Promise<void> {
    const recipes = await this.findAll();
    const filtered = recipes.filter((r) => r.id.value !== recipeId);
    this.saveToStorage(filtered);
  }

  async findAll(): Promise<Recipe[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return [];
    }

    try {
      const parsed = JSON.parse(data);
      return parsed.map((item: any) =>
        Recipe.reconstruct(
          item.id,
          item.title,
          item.category,
          item.area,
          item.instructions,
          item.thumbnailUrl,
          item.ingredients,
          item.youtubeUrl,
          item.sourceUrl,
          true
        )
      );
    } catch (error) {
      console.error('Failed to parse favorite recipes:', error);
      return [];
    }
  }

  async findById(recipeId: string): Promise<Recipe | null> {
    const recipes = await this.findAll();
    return recipes.find((r) => r.id.value === recipeId) || null;
  }

  async isFavorite(recipeId: string): Promise<boolean> {
    const recipe = await this.findById(recipeId);
    return recipe !== null;
  }

  private saveToStorage(recipes: Recipe[]): void {
    const data = recipes.map((r) => r.toJSON());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}
