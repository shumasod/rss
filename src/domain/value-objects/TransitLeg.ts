import { TransitStation } from './TransitStation';

/**
 * TransitMode - 交通手段の種類
 */
export type TransitMode =
  | 'train' // 電車
  | 'subway' // 地下鉄
  | 'bus' // バス
  | 'ferry' // フェリー
  | 'walking' // 徒歩
  | 'shinkansen' // 新幹線
  | 'express' // 特急
  | 'local' // 普通電車
  | 'car' // 自動車
  | 'bicycle'; // 自転車

/**
 * TransitLeg Value Object
 * ルートの各区間（例: A駅からB駅まで電車で移動）
 */
export class TransitLeg {
  private constructor(
    private readonly _from: TransitStation,
    private readonly _to: TransitStation,
    private readonly _mode: TransitMode,
    private readonly _duration: number, // 分単位
    private readonly _distance?: number, // メートル単位
    private readonly _line?: string, // 路線名
    private readonly _departure?: Date,
    private readonly _arrival?: Date,
    private readonly _fare?: number, // 料金（円）
  ) {
    if (_duration < 0) {
      throw new Error('Duration cannot be negative');
    }
    if (_distance !== undefined && _distance < 0) {
      throw new Error('Distance cannot be negative');
    }
    if (_fare !== undefined && _fare < 0) {
      throw new Error('Fare cannot be negative');
    }
  }

  static create(
    from: TransitStation,
    to: TransitStation,
    mode: TransitMode,
    duration: number,
    distance?: number,
    line?: string,
    departure?: Date,
    arrival?: Date,
    fare?: number,
  ): TransitLeg {
    return new TransitLeg(
      from,
      to,
      mode,
      duration,
      distance,
      line,
      departure,
      arrival,
      fare,
    );
  }

  get from(): TransitStation {
    return this._from;
  }

  get to(): TransitStation {
    return this._to;
  }

  get mode(): TransitMode {
    return this._mode;
  }

  get duration(): number {
    return this._duration;
  }

  get distance(): number | undefined {
    return this._distance;
  }

  get line(): string | undefined {
    return this._line;
  }

  get departure(): Date | undefined {
    return this._departure;
  }

  get arrival(): Date | undefined {
    return this._arrival;
  }

  get fare(): number | undefined {
    return this._fare;
  }

  isWalking(): boolean {
    return this._mode === 'walking';
  }

  toJSON() {
    return {
      from: this._from.toJSON(),
      to: this._to.toJSON(),
      mode: this._mode,
      duration: this._duration,
      distance: this._distance,
      line: this._line,
      departure: this._departure?.toISOString(),
      arrival: this._arrival?.toISOString(),
      fare: this._fare,
    };
  }
}
