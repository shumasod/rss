/**
 * FeedUrl Value Object
 * フィードのURLを表現し、バリデーションを行う
 */
export class FeedUrl {
  constructor(private readonly _value: string) {
    this.validate(_value);
  }

  private validate(url: string): void {
    if (!url || url.trim().length === 0) {
      throw new Error('Feed URL cannot be empty');
    }

    try {
      new URL(url);
    } catch {
      throw new Error('Invalid Feed URL format');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: FeedUrl): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
