import {
  ITransitSearchService,
  TransitSearchOptions,
} from '@domain/services/ITransitSearchService';
import { TransitRoute } from '@domain/entities/TransitRoute';
import { TransitStation } from '@domain/value-objects/TransitStation';
import { TransitLeg } from '@domain/value-objects/TransitLeg';

/**
 * JapanTransitSearchService
 * 日本国内の公共交通機関の乗換案内を検索するサービス
 *
 * 注: 実際のAPI統合のためには、以下のAPIサービスの利用を検討してください：
 * - Yahoo!乗換案内API (https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/routesearch.html)
 * - 駅すぱあとWebサービス (https://ekiworld.net/)
 * - ジョルダン乗換案内API (https://api.jorudan.co.jp/)
 *
 * 現在はデモンストレーション用のモックデータを返します。
 */
export class JapanTransitSearchService implements ITransitSearchService {
  // 実際のAPI統合時にはここで環境変数から取得します
  // private readonly API_ENDPOINT = import.meta.env.VITE_JAPAN_TRANSIT_API_ENDPOINT;
  // private readonly API_KEY = import.meta.env.VITE_JAPAN_TRANSIT_API_KEY;

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
    // API呼び出しをシミュレート（500-1000ms）
    return new Promise((resolve) => {
      setTimeout(resolve, 500 + Math.random() * 500);
    });
  }

  private generateMockRoutes(
    origin: string,
    destination: string,
  ): TransitRoute[] {
    const routes: TransitRoute[] = [];

    // ルート1: 最速ルート（特急利用）
    const route1 = this.createExpressRoute(origin, destination);
    routes.push(route1);

    // ルート2: 最安ルート（普通電車のみ）
    const route2 = this.createCheapestRoute(origin, destination);
    routes.push(route2);

    // ルート3: 乗換が少ないルート
    const route3 = this.createFewestTransfersRoute(origin, destination);
    routes.push(route3);

    return routes;
  }

  private createExpressRoute(origin: string, destination: string): TransitRoute {
    const originStation = TransitStation.create(origin, 35.6812, 139.7671);
    const transferStation = TransitStation.create('新横浜', 35.5081, 139.6173);
    const destinationStation = TransitStation.create(destination, 35.1815, 136.9066);

    const legs = [
      // 徒歩で最寄り駅へ
      TransitLeg.create(
        originStation,
        TransitStation.create(`${origin}駅`),
        'walking',
        5,
        400,
        undefined,
        new Date(Date.now() + 0 * 60000),
        new Date(Date.now() + 5 * 60000),
        0,
      ),
      // 新幹線
      TransitLeg.create(
        TransitStation.create(`${origin}駅`),
        transferStation,
        'shinkansen',
        95,
        350000,
        '東海道新幹線のぞみ',
        new Date(Date.now() + 10 * 60000),
        new Date(Date.now() + 105 * 60000),
        10500,
      ),
      // 在来線へ乗換
      TransitLeg.create(
        transferStation,
        TransitStation.create(`${destination}駅`),
        'train',
        30,
        25000,
        'JR東海道線',
        new Date(Date.now() + 115 * 60000),
        new Date(Date.now() + 145 * 60000),
        570,
      ),
      // 徒歩で目的地へ
      TransitLeg.create(
        TransitStation.create(`${destination}駅`),
        destinationStation,
        'walking',
        3,
        200,
        undefined,
        new Date(Date.now() + 145 * 60000),
        new Date(Date.now() + 148 * 60000),
        0,
      ),
    ];

    return TransitRoute.create(originStation, destinationStation, legs, 'domestic');
  }

  private createCheapestRoute(origin: string, destination: string): TransitRoute {
    const originStation = TransitStation.create(origin);
    const destinationStation = TransitStation.create(destination);

    const legs = [
      TransitLeg.create(
        originStation,
        TransitStation.create('品川'),
        'train',
        15,
        12000,
        'JR山手線',
        new Date(Date.now() + 5 * 60000),
        new Date(Date.now() + 20 * 60000),
        200,
      ),
      TransitLeg.create(
        TransitStation.create('品川'),
        TransitStation.create('横浜'),
        'train',
        25,
        20000,
        'JR東海道線',
        new Date(Date.now() + 25 * 60000),
        new Date(Date.now() + 50 * 60000),
        480,
      ),
      TransitLeg.create(
        TransitStation.create('横浜'),
        TransitStation.create('名古屋'),
        'train',
        210,
        350000,
        'JR東海道線（普通）',
        new Date(Date.now() + 55 * 60000),
        new Date(Date.now() + 265 * 60000),
        6380,
      ),
      TransitLeg.create(
        TransitStation.create('名古屋'),
        destinationStation,
        'subway',
        10,
        5000,
        '名古屋市営地下鉄',
        new Date(Date.now() + 270 * 60000),
        new Date(Date.now() + 280 * 60000),
        210,
      ),
    ];

    return TransitRoute.create(originStation, destinationStation, legs, 'domestic');
  }

  private createFewestTransfersRoute(
    origin: string,
    destination: string,
  ): TransitRoute {
    const originStation = TransitStation.create(origin);
    const destinationStation = TransitStation.create(destination);

    const legs = [
      TransitLeg.create(
        originStation,
        TransitStation.create('東京'),
        'walking',
        8,
        600,
        undefined,
        new Date(Date.now() + 0 * 60000),
        new Date(Date.now() + 8 * 60000),
        0,
      ),
      TransitLeg.create(
        TransitStation.create('東京'),
        destinationStation,
        'shinkansen',
        100,
        360000,
        '東海道新幹線ひかり',
        new Date(Date.now() + 15 * 60000),
        new Date(Date.now() + 115 * 60000),
        10780,
      ),
    ];

    return TransitRoute.create(originStation, destinationStation, legs, 'domestic');
  }
}
