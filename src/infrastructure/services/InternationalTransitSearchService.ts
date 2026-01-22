import {
  ITransitSearchService,
  TransitSearchOptions,
} from '@domain/services/ITransitSearchService';
import { TransitRoute } from '@domain/entities/TransitRoute';
import { TransitStation } from '@domain/value-objects/TransitStation';
import { TransitLeg } from '@domain/value-objects/TransitLeg';

/**
 * InternationalTransitSearchService
 * 国際的な公共交通機関の乗換案内を検索するサービス
 *
 * 注: 実際のAPI統合のためには、以下のAPIサービスの利用を検討してください：
 * - Google Maps Directions API (https://developers.google.com/maps/documentation/directions)
 * - HERE Maps Transit API (https://developer.here.com/)
 * - Citymapper API (https://citymapper.com/api)
 * - OpenTripPlanner (https://www.opentripplanner.org/)
 *
 * 現在はデモンストレーション用のモックデータを返します。
 */
export class InternationalTransitSearchService implements ITransitSearchService {
  // 実際のAPI統合時にはここで環境変数から取得します
  // private readonly API_ENDPOINT = import.meta.env.VITE_INTERNATIONAL_TRANSIT_API_ENDPOINT;
  // private readonly API_KEY = import.meta.env.VITE_INTERNATIONAL_TRANSIT_API_KEY;

  async searchRoutes(
    origin: string,
    destination: string,
    _options?: TransitSearchOptions,
  ): Promise<TransitRoute[]> {
    // 実際のAPI実装の場合、ここでAPIを呼び出します
    // 現在はモックデータを返します

    // API呼び出しのシミュレーション
    await this.simulateApiCall();

    return this.generateMockRoutes(origin, destination);
  }

  async isAvailable(): Promise<boolean> {
    // API実装の場合、APIの疎通確認を行います
    // 現在は常にtrueを返します
    return true;
  }

  private async simulateApiCall(): Promise<void> {
    // API呼び出しをシミュレート（700-1500ms）
    return new Promise((resolve) => {
      setTimeout(resolve, 700 + Math.random() * 800);
    });
  }

  private generateMockRoutes(
    origin: string,
    destination: string,
  ): TransitRoute[] {
    const routes: TransitRoute[] = [];

    // ルート1: 地下鉄メインルート
    const route1 = this.createSubwayRoute(origin, destination);
    routes.push(route1);

    // ルート2: バスと電車の組み合わせ
    const route2 = this.createMixedRoute(origin, destination);
    routes.push(route2);

    return routes;
  }

  private createSubwayRoute(origin: string, destination: string): TransitRoute {
    const originStation = TransitStation.create(origin, 51.5074, -0.1278);
    const transferStation = TransitStation.create('King\'s Cross St. Pancras', 51.5308, -0.1238);
    const destinationStation = TransitStation.create(destination, 51.5155, -0.1419);

    const legs = [
      // 徒歩で駅へ
      TransitLeg.create(
        originStation,
        TransitStation.create(`${origin} Station`),
        'walking',
        3,
        250,
        undefined,
        new Date(Date.now() + 0 * 60000),
        new Date(Date.now() + 3 * 60000),
        0,
      ),
      // 地下鉄（1本目）
      TransitLeg.create(
        TransitStation.create(`${origin} Station`),
        transferStation,
        'subway',
        12,
        8000,
        'Northern Line',
        new Date(Date.now() + 5 * 60000),
        new Date(Date.now() + 17 * 60000),
        280,
      ),
      // 乗換
      TransitLeg.create(
        transferStation,
        transferStation,
        'walking',
        2,
        100,
        undefined,
        new Date(Date.now() + 17 * 60000),
        new Date(Date.now() + 19 * 60000),
        0,
      ),
      // 地下鉄（2本目）
      TransitLeg.create(
        transferStation,
        TransitStation.create(`${destination} Station`),
        'subway',
        8,
        5000,
        'Circle Line',
        new Date(Date.now() + 22 * 60000),
        new Date(Date.now() + 30 * 60000),
        280,
      ),
      // 徒歩で目的地へ
      TransitLeg.create(
        TransitStation.create(`${destination} Station`),
        destinationStation,
        'walking',
        2,
        150,
        undefined,
        new Date(Date.now() + 30 * 60000),
        new Date(Date.now() + 32 * 60000),
        0,
      ),
    ];

    return TransitRoute.create(originStation, destinationStation, legs, 'international');
  }

  private createMixedRoute(origin: string, destination: string): TransitRoute {
    const originStation = TransitStation.create(origin);
    const destinationStation = TransitStation.create(destination);

    const legs = [
      // バス
      TransitLeg.create(
        originStation,
        TransitStation.create('Victoria Station'),
        'bus',
        18,
        6000,
        'Bus 24',
        new Date(Date.now() + 5 * 60000),
        new Date(Date.now() + 23 * 60000),
        180,
      ),
      // 徒歩で乗換
      TransitLeg.create(
        TransitStation.create('Victoria Station'),
        TransitStation.create('Victoria Underground'),
        'walking',
        3,
        200,
        undefined,
        new Date(Date.now() + 23 * 60000),
        new Date(Date.now() + 26 * 60000),
        0,
      ),
      // 地下鉄
      TransitLeg.create(
        TransitStation.create('Victoria Underground'),
        TransitStation.create(`${destination} Station`),
        'subway',
        15,
        10000,
        'Victoria Line',
        new Date(Date.now() + 30 * 60000),
        new Date(Date.now() + 45 * 60000),
        280,
      ),
      // 徒歩で目的地へ
      TransitLeg.create(
        TransitStation.create(`${destination} Station`),
        destinationStation,
        'walking',
        4,
        300,
        undefined,
        new Date(Date.now() + 45 * 60000),
        new Date(Date.now() + 49 * 60000),
        0,
      ),
    ];

    return TransitRoute.create(originStation, destinationStation, legs, 'international');
  }
}
