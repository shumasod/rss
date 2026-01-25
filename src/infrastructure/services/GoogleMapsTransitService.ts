import { injectable } from 'tsyringe';
import type {
  ITransitSearchService,
  TransitSearchOptions,
} from '@domain/services/ITransitSearchService';
import { TransitRoute } from '@domain/entities/TransitRoute';
import { TransitStation } from '@domain/value-objects/TransitStation';
import { TransitLeg, TransitMode } from "@domain/value-objects/TransitLeg";

/**
 * Google Maps Directions APIを使用した乗換案内サービス
 * https://developers.google.com/maps/documentation/directions/overview
 *
 * 注意: Google Maps APIキーが必要です
 * https://console.cloud.google.com/ でAPIキーを取得してください
 *
 * 無料枠: 月間 $200 相当（約40,000リクエスト）
 */
@injectable()
export class GoogleMapsTransitService implements ITransitSearchService {
  private readonly API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  private readonly BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json';

  async searchRoutes(
    origin: string,
    destination: string,
    options?: TransitSearchOptions,
  ): Promise<TransitRoute[]> {
    if (!this.API_KEY || this.API_KEY === 'demo') {
      console.warn(
        'Google Maps APIキーが設定されていません。デモデータを返します。'
      );
      return this.getDemoRoutes(origin, destination);
    }

    try {
      // Google Maps Directions APIを呼び出し
      const params = new URLSearchParams({
        origin,
        destination,
        mode: 'transit',
        language: 'ja',
        region: 'JP',
        alternatives: 'true', // 複数ルートを取得
        departure_time: options?.departureTime
          ? Math.floor(new Date(options.departureTime).getTime() / 1000).toString()
          : 'now',
        key: this.API_KEY,
      });

      const response = await fetch(`${this.BASE_URL}?${params}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Google Maps API エラー:', data.status, data.error_message);
        return this.getDemoRoutes(origin, destination);
      }

      return this.parseGoogleMapsResponse(data, origin, destination);
    } catch (error) {
      console.error('乗換検索エラー:', error);
      return this.getDemoRoutes(origin, destination);
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.API_KEY && this.API_KEY !== 'demo';
  }

  /**
   * Google Maps APIのレスポンスをパース
   */
  private parseGoogleMapsResponse(
    data: any,
    originName: string,
    destinationName: string
  ): TransitRoute[] {
    const routes: TransitRoute[] = [];

    for (const route of data.routes.slice(0, 3)) {
      // 最大3ルート
      const legs: TransitLeg[] = [];
      const firstLeg = route.legs[0];

      const originStation = TransitStation.create(
        originName,
        firstLeg.start_location.lat,
        firstLeg.start_location.lng
      );

      const destinationStation = TransitStation.create(
        destinationName,
        firstLeg.end_location.lat,
        firstLeg.end_location.lng
      );

      // 各ステップをTransitLegに変換
      for (const step of firstLeg.steps) {
        const leg = this.convertStepToLeg(step);
        if (leg) {
          legs.push(leg);
        }
      }

      const transitRoute = TransitRoute.create(
        originStation,
        destinationStation,
        legs,
        'domestic'
      );

      routes.push(transitRoute);
    }

    return routes;
  }

  /**
   * Google MapsのstepをTransitLegに変換
   */
  private convertStepToLeg(step: any): TransitLeg | null {
    const startStation = TransitStation.create(
      step.html_instructions?.replace(/<[^>]*>/g, '') || '出発地',
      step.start_location.lat,
      step.start_location.lng
    );

    const endStation = TransitStation.create(
      step.html_instructions?.replace(/<[^>]*>/g, '') || '目的地',
      step.end_location.lat,
      step.end_location.lng
    );

    const travelMode = this.convertTravelMode(step.travel_mode);
    const duration = Math.round(step.duration.value / 60); // 秒から分に変換
    const distance = step.distance.value; // メートル

    let lineName: string | undefined;
    let fare = 0;

    if (step.transit_details) {
      lineName = step.transit_details.line.name;
      fare = step.transit_details.line.agencies?.[0]?.fare || 0;
    }

    const departureTime = step.transit_details?.departure_time?.value
      ? new Date(step.transit_details.departure_time.value * 1000)
      : new Date();

    const arrivalTime = step.transit_details?.arrival_time?.value
      ? new Date(step.transit_details.arrival_time.value * 1000)
      : new Date(departureTime.getTime() + duration * 60000);

    return TransitLeg.create(
      startStation,
      endStation,
      travelMode,
      duration,
      distance,
      lineName,
      departureTime,
      arrivalTime,
      fare
    );
  }

  /**
   * Google MapsのトラベルモードをTransitLegの形式に変換
   */
  private convertTravelMode(mode: string): TransitMode {
    const modeMap: Record<string, TransitMode> = {
      TRANSIT: 'train',
      WALKING: 'walking',
      DRIVING: 'car',
      BICYCLING: 'bicycle',
    };

    return modeMap[mode] || 'train';
  }

  /**
   * デモデータ（APIキーが設定されていない場合）
   * NaviTime風の詳細なルート情報
   */
  private getDemoRoutes(origin: string, destination: string): TransitRoute[] {
    const now = new Date();

    // ルート1: 最速ルート
    const route1Legs = [
      TransitLeg.create(
        TransitStation.create(origin, 35.6812, 139.7671),
        TransitStation.create(`${origin}駅`, 35.6815, 139.7671),
        'walking',
        3,
        240,
        undefined,
        new Date(now.getTime() + 0),
        new Date(now.getTime() + 3 * 60000),
        0
      ),
      TransitLeg.create(
        TransitStation.create(`${origin}駅`, 35.6815, 139.7671),
        TransitStation.create('品川', 35.6284, 139.7387),
        'train',
        8,
        6600,
        'JR山手線（内回り）',
        new Date(now.getTime() + 5 * 60000),
        new Date(now.getTime() + 13 * 60000),
        200
      ),
      TransitLeg.create(
        TransitStation.create('品川', 35.6284, 139.7387),
        TransitStation.create('新横浜', 35.5081, 139.6173),
        'shinkansen',
        11,
        22000,
        '東海道新幹線こだま（新大阪行）',
        new Date(now.getTime() + 18 * 60000),
        new Date(now.getTime() + 29 * 60000),
        3220
      ),
      TransitLeg.create(
        TransitStation.create('新横浜', 35.5081, 139.6173),
        TransitStation.create(destination, 35.1815, 136.9066),
        'shinkansen',
        78,
        326000,
        '東海道新幹線のぞみ（博多行）',
        new Date(now.getTime() + 35 * 60000),
        new Date(now.getTime() + 113 * 60000),
        10560
      ),
      TransitLeg.create(
        TransitStation.create(`${destination}駅`, 35.1815, 136.9066),
        TransitStation.create(destination, 35.1815, 136.9064),
        'walking',
        2,
        150,
        undefined,
        new Date(now.getTime() + 113 * 60000),
        new Date(now.getTime() + 115 * 60000),
        0
      ),
    ];

    // ルート2: 最安ルート（在来線のみ）
    const route2Legs = [
      TransitLeg.create(
        TransitStation.create(origin, 35.6812, 139.7671),
        TransitStation.create('品川', 35.6284, 139.7387),
        'train',
        15,
        12000,
        'JR山手線',
        new Date(now.getTime() + 0),
        new Date(now.getTime() + 15 * 60000),
        200
      ),
      TransitLeg.create(
        TransitStation.create('品川', 35.6284, 139.7387),
        TransitStation.create('横浜', 35.4437, 139.6380),
        'train',
        20,
        18000,
        'JR東海道線',
        new Date(now.getTime() + 20 * 60000),
        new Date(now.getTime() + 40 * 60000),
        480
      ),
      TransitLeg.create(
        TransitStation.create('横浜', 35.4437, 139.6380),
        TransitStation.create('静岡', 34.9768, 138.3830),
        'train',
        120,
        132000,
        'JR東海道線（普通）',
        new Date(now.getTime() + 50 * 60000),
        new Date(now.getTime() + 170 * 60000),
        2640
      ),
      TransitLeg.create(
        TransitStation.create('静岡', 34.9768, 138.3830),
        TransitStation.create('浜松', 34.7038, 137.7346),
        'train',
        90,
        88000,
        'JR東海道線（普通）',
        new Date(now.getTime() + 180 * 60000),
        new Date(now.getTime() + 270 * 60000),
        1980
      ),
      TransitLeg.create(
        TransitStation.create('浜松', 34.7038, 137.7346),
        TransitStation.create(destination, 35.1815, 136.9066),
        'train',
        100,
        106000,
        'JR東海道線（普通）',
        new Date(now.getTime() + 280 * 60000),
        new Date(now.getTime() + 380 * 60000),
        2310
      ),
    ];

    // ルート3: 乗換最小ルート
    const route3Legs = [
      TransitLeg.create(
        TransitStation.create(origin, 35.6812, 139.7671),
        TransitStation.create('東京', 35.6812, 139.7671),
        'walking',
        5,
        400,
        undefined,
        new Date(now.getTime() + 0),
        new Date(now.getTime() + 5 * 60000),
        0
      ),
      TransitLeg.create(
        TransitStation.create('東京', 35.6812, 139.7671),
        TransitStation.create(destination, 35.1815, 136.9066),
        'shinkansen',
        95,
        360000,
        '東海道新幹線のぞみ（新大阪行）',
        new Date(now.getTime() + 10 * 60000),
        new Date(now.getTime() + 105 * 60000),
        10780
      ),
    ];

    const originStation = TransitStation.create(origin, 35.6812, 139.7671);
    const destinationStation = TransitStation.create(destination, 35.1815, 136.9066);

    return [
      TransitRoute.create(originStation, destinationStation, route1Legs, 'domestic'),
      TransitRoute.create(originStation, destinationStation, route2Legs, 'domestic'),
      TransitRoute.create(originStation, destinationStation, route3Legs, 'domestic'),
    ];
  }
}
