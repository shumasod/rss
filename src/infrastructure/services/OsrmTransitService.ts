import { injectable } from 'tsyringe';
import type {
  ITransitSearchService,
  TransitSearchOptions,
} from '@domain/services/ITransitSearchService';
import { TransitRoute } from '@domain/entities/TransitRoute';
import { TransitStation } from '@domain/value-objects/TransitStation';
import { TransitLeg, TransitMode } from '@domain/value-objects/TransitLeg';

/**
 * OSRM (Open Source Routing Machine) を使用した経路検索サービス
 * https://project-osrm.org/
 *
 * 完全無料・APIキー不要（公共デモサーバー使用）
 * 制限: 1リクエスト/秒（個人開発・デモ用途）
 * 商用利用は自己ホスティング推奨
 *
 * 住所→座標変換には Nominatim（OpenStreetMap）を使用
 * https://nominatim.org/
 */
@injectable()
export class OsrmTransitService implements ITransitSearchService {
  // OSRMパブリックデモサーバー
  private readonly OSRM_BASE = 'https://router.project-osrm.org/route/v1';
  // OpenStreetMap Nominatim（ジオコーディング）
  private readonly NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

  async searchRoutes(
    origin: string,
    destination: string,
    _options?: TransitSearchOptions
  ): Promise<TransitRoute[]> {
    try {
      // 住所を座標に変換
      const [originCoords, destCoords] = await Promise.all([
        this.geocode(origin),
        this.geocode(destination),
      ]);

      if (!originCoords || !destCoords) {
        console.warn('OSRM: 住所の座標変換に失敗しました');
        return this.getDemoRoutes(origin, destination);
      }

      // OSRM から複数のルートを取得（徒歩・自転車・自動車）
      const [walkRoute, bikeRoute, carRoute] = await Promise.allSettled([
        this.fetchOsrmRoute('foot', originCoords, destCoords, origin, destination),
        this.fetchOsrmRoute('bike', originCoords, destCoords, origin, destination),
        this.fetchOsrmRoute('car', originCoords, destCoords, origin, destination),
      ]);

      const routes: TransitRoute[] = [];

      if (walkRoute.status === 'fulfilled' && walkRoute.value) {
        routes.push(walkRoute.value);
      }
      if (bikeRoute.status === 'fulfilled' && bikeRoute.value) {
        routes.push(bikeRoute.value);
      }
      if (carRoute.status === 'fulfilled' && carRoute.value) {
        routes.push(carRoute.value);
      }

      return routes.length > 0 ? routes : this.getDemoRoutes(origin, destination);
    } catch (error) {
      console.error('OSRM 経路検索エラー:', error);
      return this.getDemoRoutes(origin, destination);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // ヘルスチェック（東京駅→品川駅）
      const response = await fetch(
        `${this.OSRM_BASE}/foot/139.7671,35.6812;139.7387,35.6284?overview=false`,
        { signal: AbortSignal.timeout(5000) }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 住所を緯度経度に変換（Nominatim）
   */
  private async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Nominatim利用規約: User-Agentヘッダー必須
      const response = await fetch(
        `${this.NOMINATIM_BASE}/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=jp`,
        {
          headers: {
            'User-Agent': 'RSS-FeedReader-App/1.0 (Educational Project)',
            'Accept-Language': 'ja',
          },
        }
      );

      const data = await response.json();

      if (!data || data.length === 0) {
        // 日本以外も検索
        const globalResponse = await fetch(
          `${this.NOMINATIM_BASE}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
          {
            headers: {
              'User-Agent': 'RSS-FeedReader-App/1.0 (Educational Project)',
              'Accept-Language': 'ja',
            },
          }
        );
        const globalData = await globalResponse.json();
        if (!globalData || globalData.length === 0) return null;

        return {
          lat: parseFloat(globalData[0].lat),
          lng: parseFloat(globalData[0].lon),
        };
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } catch (error) {
      console.error('Nominatim ジオコーディングエラー:', error);
      return null;
    }
  }

  /**
   * OSRMルート取得
   */
  private async fetchOsrmRoute(
    mode: 'foot' | 'bike' | 'car',
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    originName: string,
    destinationName: string
  ): Promise<TransitRoute | null> {
    // OSRM profile名
    const profileMap = { foot: 'foot', bike: 'bike', car: 'car' };
    const profile = profileMap[mode];

    const url = `${this.OSRM_BASE}/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?steps=true&annotations=false&geometries=geojson&overview=full`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const originStation = TransitStation.create(originName, origin.lat, origin.lng);
    const destStation = TransitStation.create(destinationName, destination.lat, destination.lng);

    const now = new Date();
    const travelMode = this.modeToTransitMode(mode);

    // ステップを TransitLeg に変換
    const legs = this.buildLegs(
      leg.steps || [],
      originName,
      destinationName,
      travelMode,
      now
    );

    return TransitRoute.create(originStation, destStation, legs, 'domestic');
  }

  private buildLegs(
    steps: any[],
    originName: string,
    destinationName: string,
    mode: TransitMode,
    startTime: Date
  ): TransitLeg[] {
    if (steps.length === 0) return [];

    const legs: TransitLeg[] = [];
    let currentTime = new Date(startTime);

    for (let i = 0; i < steps.length - 1; i++) {
      const step = steps[i];
      const nextStep = steps[i + 1];
      const durationMin = Math.round(step.duration / 60) || 1;
      const arrivalTime = new Date(currentTime.getTime() + durationMin * 60000);

      const fromName =
        i === 0
          ? originName
          : step.name || `経由地${i}`;
      const toName =
        i === steps.length - 2
          ? destinationName
          : nextStep.name || `経由地${i + 1}`;

      const fromCoord = step.maneuver?.location;
      const toCoord = nextStep.maneuver?.location;

      legs.push(
        TransitLeg.create(
          TransitStation.create(
            fromName,
            fromCoord ? fromCoord[1] : undefined,
            fromCoord ? fromCoord[0] : undefined
          ),
          TransitStation.create(
            toName,
            toCoord ? toCoord[1] : undefined,
            toCoord ? toCoord[0] : undefined
          ),
          mode,
          durationMin,
          Math.round(step.distance),
          step.name || this.getModeLabel(mode),
          currentTime,
          arrivalTime,
          0 // OSRM は料金情報を持たない
        )
      );

      currentTime = arrivalTime;
    }

    return legs;
  }

  private modeToTransitMode(mode: 'foot' | 'bike' | 'car'): TransitMode {
    const map: Record<string, TransitMode> = {
      foot: 'walking',
      bike: 'bicycle',
      car: 'car',
    };
    return map[mode] || 'walking';
  }

  private getModeLabel(mode: TransitMode): string {
    const labels: Record<string, string> = {
      walking: '徒歩',
      bicycle: '自転車',
      car: '自動車',
    };
    return labels[mode] || mode;
  }

  /**
   * ジオコーディング失敗時のフォールバックデモデータ
   */
  private getDemoRoutes(origin: string, destination: string): TransitRoute[] {
    const now = new Date();
    const originStation = TransitStation.create(origin, 35.6812, 139.7671);
    const destinationStation = TransitStation.create(destination, 35.6284, 139.7387);

    const legs = [
      TransitLeg.create(
        originStation,
        destinationStation,
        'walking',
        15,
        1200,
        '徒歩ルート',
        now,
        new Date(now.getTime() + 15 * 60000),
        0
      ),
    ];

    return [TransitRoute.create(originStation, destinationStation, legs, 'domestic')];
  }
}
