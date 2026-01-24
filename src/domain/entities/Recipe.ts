import { RecipeId } from '../value-objects/RecipeId';
import { RecipeTitle } from '../value-objects/RecipeTitle';
import { RecipeIngredient } from '../value-objects/RecipeIngredient';
import { RecipeCategory } from '../value-objects/RecipeCategory';

/**
 * レシピエンティティ
 * 料理レシピの情報を表現するドメインエンティティ
 */
export class Recipe {
  private constructor(
    private readonly _id: RecipeId,
    private readonly _title: RecipeTitle,
    private readonly _category: RecipeCategory,
    private readonly _area: string,
    private readonly _instructions: string,
    private readonly _thumbnailUrl: string,
    private readonly _ingredients: RecipeIngredient[],
    private readonly _youtubeUrl?: string,
    private readonly _sourceUrl?: string,
    private _isFavorite: boolean = false
  ) {}

  /**
   * 新しいレシピを作成
   */
  static create(
    title: string,
    category: string,
    area: string,
    instructions: string,
    thumbnailUrl: string,
    ingredients: { name: string; measure: string }[],
    youtubeUrl?: string,
    sourceUrl?: string
  ): Recipe {
    const recipeIngredients = ingredients.map(
      (ing) => new RecipeIngredient(ing.name, ing.measure)
    );

    return new Recipe(
      RecipeId.generate(),
      new RecipeTitle(title),
      new RecipeCategory(category),
      area,
      instructions,
      thumbnailUrl,
      recipeIngredients,
      youtubeUrl,
      sourceUrl,
      false
    );
  }

  /**
   * 既存のレシピを再構築
   */
  static reconstruct(
    id: string,
    title: string,
    category: string,
    area: string,
    instructions: string,
    thumbnailUrl: string,
    ingredients: { name: string; measure: string }[],
    youtubeUrl?: string,
    sourceUrl?: string,
    isFavorite: boolean = false
  ): Recipe {
    const recipeIngredients = ingredients.map(
      (ing) => new RecipeIngredient(ing.name, ing.measure)
    );

    return new Recipe(
      new RecipeId(id),
      new RecipeTitle(title),
      new RecipeCategory(category),
      area,
      instructions,
      thumbnailUrl,
      recipeIngredients,
      youtubeUrl,
      sourceUrl,
      isFavorite
    );
  }

  get id(): RecipeId {
    return this._id;
  }

  get title(): RecipeTitle {
    return this._title;
  }

  get category(): RecipeCategory {
    return this._category;
  }

  get area(): string {
    return this._area;
  }

  get instructions(): string {
    return this._instructions;
  }

  get thumbnailUrl(): string {
    return this._thumbnailUrl;
  }

  get ingredients(): RecipeIngredient[] {
    return [...this._ingredients];
  }

  get youtubeUrl(): string | undefined {
    return this._youtubeUrl;
  }

  get sourceUrl(): string | undefined {
    return this._sourceUrl;
  }

  get isFavorite(): boolean {
    return this._isFavorite;
  }

  /**
   * お気に入りに追加
   */
  markAsFavorite(): void {
    this._isFavorite = true;
  }

  /**
   * お気に入りから削除
   */
  unmarkAsFavorite(): void {
    this._isFavorite = false;
  }

  /**
   * JSON形式に変換
   */
  toJSON() {
    return {
      id: this._id.value,
      title: this._title.value,
      category: this._category.value,
      area: this._area,
      instructions: this._instructions,
      thumbnailUrl: this._thumbnailUrl,
      ingredients: this._ingredients.map((ing) => ing.toJSON()),
      youtubeUrl: this._youtubeUrl,
      sourceUrl: this._sourceUrl,
      isFavorite: this._isFavorite,
    };
  }
}
