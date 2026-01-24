import { injectable } from 'tsyringe';
import { Recipe } from '../../domain/entities/Recipe';
import { IMealRecipeService } from '../../domain/services/IMealRecipeService';

/**
 * TheMealDB APIを使用したレシピサービス実装
 * https://www.themealdb.com/api.php
 */
@injectable()
export class MealDbRecipeService implements IMealRecipeService {
  private readonly BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

  async searchByName(name: string): Promise<Recipe[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/search.php?s=${encodeURIComponent(name)}`
      );
      const data = await response.json();

      if (!data.meals) {
        return [];
      }

      return data.meals.map((meal: any) => this.mapToRecipe(meal));
    } catch (error) {
      console.error('Failed to search recipes by name:', error);
      throw new Error('Failed to search recipes by name');
    }
  }

  async searchByCategory(category: string): Promise<Recipe[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
      );
      const data = await response.json();

      if (!data.meals) {
        return [];
      }

      // filter APIは詳細情報を返さないので、各レシピの詳細を個別に取得
      const detailPromises = data.meals
        .slice(0, 12)
        .map((meal: any) => this.getRecipeById(meal.idMeal));

      const recipes = await Promise.all(detailPromises);
      return recipes.filter((r): r is Recipe => r !== null);
    } catch (error) {
      console.error('Failed to search recipes by category:', error);
      throw new Error('Failed to search recipes by category');
    }
  }

  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    try {
      const promises = Array.from({ length: count }, () =>
        fetch(`${this.BASE_URL}/random.php`)
          .then((res) => res.json())
          .then((data) => (data.meals ? this.mapToRecipe(data.meals[0]) : null))
      );

      const recipes = await Promise.all(promises);
      return recipes.filter((r): r is Recipe => r !== null);
    } catch (error) {
      console.error('Failed to get random recipes:', error);
      throw new Error('Failed to get random recipes');
    }
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();

      if (!data.meals || data.meals.length === 0) {
        return null;
      }

      return this.mapToRecipe(data.meals[0]);
    } catch (error) {
      console.error('Failed to get recipe by ID:', error);
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/categories.php`);
      const data = await response.json();

      if (!data.categories) {
        return [];
      }

      return data.categories.map((cat: any) => cat.strCategory);
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  /**
   * TheMealDB APIのレスポンスをRecipeエンティティにマッピング
   */
  private mapToRecipe(meal: any): Recipe {
    const ingredients: { name: string; measure: string }[] = [];

    // TheMealDB APIは最大20の材料を持つ
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure ? measure.trim() : '',
        });
      }
    }

    return Recipe.reconstruct(
      meal.idMeal,
      meal.strMeal,
      meal.strCategory || 'Unknown',
      meal.strArea || 'Unknown',
      meal.strInstructions || '',
      meal.strMealThumb || '',
      ingredients,
      meal.strYoutube || undefined,
      meal.strSource || undefined,
      false
    );
  }
}
