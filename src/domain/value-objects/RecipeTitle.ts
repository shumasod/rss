/**
 * レシピタイトル値オブジェクト
 * レシピのタイトル情報を保持
 */
export class RecipeTitle {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Recipe title cannot be empty');
    }
    if (value.length > 200) {
      throw new Error('Recipe title cannot exceed 200 characters');
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: RecipeTitle): boolean {
    return this._value === other._value;
  }
}
