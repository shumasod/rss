/**
 * ArticleUrl Value Object
 * 記事のURLを表現し、バリデーションを行う
 */
export class ArticleUrl {
  constructor(private readonly _value: string) {
    this.validate(_value);
  }

  private validate(url: string): void {
    if (!url || url.trim().length === 0) {
      throw new Error('Article URL cannot be empty');
    }

    try {
      new URL(url);
    } catch {
      throw new Error('Invalid Article URL format');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: ArticleUrl): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
