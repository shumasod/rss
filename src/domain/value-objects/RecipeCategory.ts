/**
 * レシピカテゴリ値オブジェクト
 * カテゴリ情報を保持（例：Beef, Chicken, Dessert など）
 */
export class RecipeCategory {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Recipe category cannot be empty');
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: RecipeCategory): boolean {
    return this._value === other._value;
  }
}
