/**
 * FeedId Value Object
 * フィードの一意な識別子
 */
export class FeedId {
  constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('FeedId cannot be empty');
    }
  }

  static generate(): FeedId {
    return new FeedId(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: FeedId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
