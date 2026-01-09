/**
 * FeedName Value Object
 * フィード名を表現し、バリデーションを行う
 */
export class FeedName {
  private static readonly MAX_LENGTH = 200;

  constructor(private readonly _value: string) {
    this.validate(_value);
  }

  private validate(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Feed name cannot be empty');
    }

    if (name.length > FeedName.MAX_LENGTH) {
      throw new Error(`Feed name cannot exceed ${FeedName.MAX_LENGTH} characters`);
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: FeedName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
