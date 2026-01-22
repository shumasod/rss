import { TransitLeg } from '../value-objects/TransitLeg';
import { TransitStation } from '../value-objects/TransitStation';

/**
 * TransitRoute Entity
 * 出発地から目的地までの乗換ルート全体を表現するエンティティ
 */
export class TransitRoute {
  private constructor(
    private readonly _id: string,
    private readonly _origin: TransitStation,
    private readonly _destination: TransitStation,
    private readonly _legs: TransitLeg[],
    private readonly _totalDuration: number, // 分単位
    private readonly _totalFare: number, // 円単位
    private readonly _transfers: number, // 乗換回数
    private readonly _searchedAt: Date,
    private readonly _region: 'domestic' | 'international',
  ) {
    if (_legs.length === 0) {
      throw new Error('Route must have at least one leg');
    }
    if (_totalDuration < 0) {
      throw new Error('Total duration cannot be negative');
    }
    if (_totalFare < 0) {
      throw new Error('Total fare cannot be negative');
    }
    if (_transfers < 0) {
      throw new Error('Transfers cannot be negative');
    }
  }

  static create(
    origin: TransitStation,
    destination: TransitStation,
    legs: TransitLeg[],
    region: 'domestic' | 'international',
  ): TransitRoute {
    // 合計所要時間を計算
    const totalDuration = legs.reduce((sum, leg) => sum + leg.duration, 0);

    // 合計料金を計算
    const totalFare = legs.reduce((sum, leg) => sum + (leg.fare || 0), 0);

    // 乗換回数を計算（徒歩以外の交通手段の変更回数）
    const transfers = legs.filter((leg, index) => {
      if (index === 0) return false;
      return !leg.isWalking() && !legs[index - 1].isWalking();
    }).length;

    // ユニークなIDを生成
    const id = `${origin.name}-${destination.name}-${Date.now()}`;

    return new TransitRoute(
      id,
      origin,
      destination,
      legs,
      totalDuration,
      totalFare,
      transfers,
      new Date(),
      region,
    );
  }

  get id(): string {
    return this._id;
  }

  get origin(): TransitStation {
    return this._origin;
  }

  get destination(): TransitStation {
    return this._destination;
  }

  get legs(): TransitLeg[] {
    return [...this._legs];
  }

  get totalDuration(): number {
    return this._totalDuration;
  }

  get totalFare(): number {
    return this._totalFare;
  }

  get transfers(): number {
    return this._transfers;
  }

  get searchedAt(): Date {
    return this._searchedAt;
  }

  get region(): 'domestic' | 'international' {
    return this._region;
  }

  isDomestic(): boolean {
    return this._region === 'domestic';
  }

  isInternational(): boolean {
    return this._region === 'international';
  }

  getTotalDurationFormatted(): string {
    const hours = Math.floor(this._totalDuration / 60);
    const minutes = this._totalDuration % 60;
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  }

  toJSON() {
    return {
      id: this._id,
      origin: this._origin.toJSON(),
      destination: this._destination.toJSON(),
      legs: this._legs.map((leg) => leg.toJSON()),
      totalDuration: this._totalDuration,
      totalFare: this._totalFare,
      transfers: this._transfers,
      searchedAt: this._searchedAt.toISOString(),
      region: this._region,
    };
  }
}
