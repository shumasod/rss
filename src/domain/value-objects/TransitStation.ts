/**
 * TransitStation Value Object
 * 駅または停留所を表現する値オブジェクト
 */
export class TransitStation {
  private constructor(
    private readonly _name: string,
    private readonly _latitude?: number,
    private readonly _longitude?: number,
    private readonly _code?: string,
  ) {
    if (!_name || _name.trim().length === 0) {
      throw new Error('Station name cannot be empty');
    }
  }

  static create(
    name: string,
    latitude?: number,
    longitude?: number,
    code?: string,
  ): TransitStation {
    return new TransitStation(name, latitude, longitude, code);
  }

  get name(): string {
    return this._name;
  }

  get latitude(): number | undefined {
    return this._latitude;
  }

  get longitude(): number | undefined {
    return this._longitude;
  }

  get code(): string | undefined {
    return this._code;
  }

  hasCoordinates(): boolean {
    return this._latitude !== undefined && this._longitude !== undefined;
  }

  equals(other: TransitStation): boolean {
    return (
      this._name === other._name &&
      this._latitude === other._latitude &&
      this._longitude === other._longitude &&
      this._code === other._code
    );
  }

  toJSON() {
    return {
      name: this._name,
      latitude: this._latitude,
      longitude: this._longitude,
      code: this._code,
    };
  }
}
