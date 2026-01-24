/**
 * レシピID値オブジェクト
 * レシピを一意に識別するためのID
 */
export class RecipeId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Recipe ID cannot be empty');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 新しいRecipeIdを生成する
   */
  static generate(): RecipeId {
    return new RecipeId(crypto.randomUUID());
  }

  equals(other: RecipeId): boolean {
    return this._value === other._value;
  }
}
