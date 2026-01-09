/**
 * ArticleTitle Value Object
 * 記事タイトルを表現し、バリデーションを行う
 */
export class ArticleTitle {
  private static readonly MAX_LENGTH = 500;

  constructor(private readonly _value: string) {
    this.validate(_value);
  }

  private validate(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Article title cannot be empty');
    }

    if (title.length > ArticleTitle.MAX_LENGTH) {
      throw new Error(`Article title cannot exceed ${ArticleTitle.MAX_LENGTH} characters`);
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: ArticleTitle): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
