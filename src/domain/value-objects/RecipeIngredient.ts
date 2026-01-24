/**
 * レシピ材料値オブジェクト
 * 材料名と分量を保持
 */
export class RecipeIngredient {
  private readonly _name: string;
  private readonly _measure: string;

  constructor(name: string, measure: string) {
    if (!name || name.trim() === '') {
      throw new Error('Ingredient name cannot be empty');
    }
    this._name = name.trim();
    this._measure = measure.trim();
  }

  get name(): string {
    return this._name;
  }

  get measure(): string {
    return this._measure;
  }

  equals(other: RecipeIngredient): boolean {
    return this._name === other._name && this._measure === other._measure;
  }

  toJSON() {
    return {
      name: this._name,
      measure: this._measure,
    };
  }
}
