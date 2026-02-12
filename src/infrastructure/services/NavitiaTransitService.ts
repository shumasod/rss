import { injectable } from 'tsyringe';
import type {
  ITransitSearchService,
  TransitSearchOptions,
} from '@domain/services/ITransitSearchService';
import { TransitRoute } from '@domain/entities/TransitRoute';
import { TransitStation } from '@domain/value-objects/TransitStation';
import { TransitLeg, TransitMode } from '@domain/value-objects/TransitLeg';

/**
 * Navitia APIを使用した公共交通機関乗換案内サービス
 * https://navitia.io / https://doc.navitia.io/
 *
 * 無料プラン:
 * - メールアドレス登録のみ（クレジットカード不要）
 * - 月間 約90,000リクエスト
 * - 世界中の公共交通機関に対応（GTFS対応都市）
 *
 * APIキー取得: https://navitia.io/register/
 * サンドボックストークン（パリのモックデータ）: 3b036afe-0110-4202-b9ed-99718476c2e0
 */
@injectable()
export class NavitiaTransitService implements ITransitSearchService {
  private readonly BASE_URL = 'https://api.navitia.io/v1';
  private readonly TOKEN = import.meta.env.VITE_NAVITIA_TOKEN
    || '3b036afe-0110-4202-b9ed-99718476c2e0'; // サンドボックストークン

  // Nominatim（住所→座標変換）
  private readonly NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

  async searchRoutes(
    origin: string,
    destination: string,
    options?: TransitSearchOptions
  ): Promise<TransitRoute[]> {
    try {
      // 住所を座標に変換
      const [originCoords, destCoords] = await Promise.all([
        this.geocode(origin),
        this.geocode(destination),
      ]);

      if (!originCoords || !destCoords) {
        console.warn('Navitia: 住所の座標変換に失敗しました');
        return this.getDemoRoutes(origin, destination);
      }

      // Navitia形式: "lon;lat"
      const fromParam = `${originCoords.lng};${originCoords.lat}`;
      const toParam = `${destCoords.lng};${destCoords.lat}`;

      const params = new URLSearchParams({
        from: fromParam,
        to: toParam,
        count: '3',          // 最大3ルート
        min_nb_transfers: '0',
      });

      if (options?.departureTime) {
        // Navitia形式: YYYYMMDDTHHmm
        const dt = new Date(options.departureTime);
        const dtStr = dt.toISOString().replace(/[-:]/g, '').slice(0, 13);
        params.set('datetime', dtStr);
      }

      const response = await fetch(
        `${this.BASE_URL}/journeys?${params}`,
        {
          headers: {
            Authorization: this.TOKEN,
          },
        }
      );

      if (!response.ok) {
        console.error('Navitia APIエラー:', response.status, response.statusText);
        return this.getDemoRoutes(origin, destination);
      }

      const data = await response.json();

      if (!data.journeys || data.journeys.length === 0) {
        console.warn('Navitia: ルートが見つかりませんでした（カバレッジ外の可能性）');
        return this.getDemoRoutes(origin, destination);
      }

      return this.parseJourneys(
        data.journeys,
        origin,
        destination,
        originCoords,
        destCoords
      );
    } catch (error) {
      console.error('Navitia 経路検索エラー:', error);
      return this.getDemoRoutes(origin, destination);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/coverage`, {
        headers: { Authorization: this.TOKEN },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Navitia のジャーニー応答をパース
   */
  private parseJourneys(
    journeys: any[],
    originName: string,
    destinationName: string,
    originCoords: { lat: number; lng: number },
    destCoords: { lat: number; lng: number }
  ): TransitRoute[] {
    const routes: TransitRoute[] = [];

    for (const journey of journeys.slice(0, 3)) {
      const legs: TransitLeg[] = [];

      for (const section of journey.sections || []) {
        const leg = this.sectionToLeg(section);
        if (leg) legs.push(leg);
      }

      if (legs.length === 0) continue;

      const originStation = TransitStation.create(originName, originCoords.lat, originCoords.lng);
      const destStation = TransitStation.create(destinationName, destCoords.lat, destCoords.lng);
      routes.push(TransitRoute.create(originStation, destStation, legs, 'domestic'));
    }

    return routes;
  }

  /**
   * Navitia section を TransitLeg に変換
   */
  private sectionToLeg(section: any): TransitLeg | null {
    if (!section.from || !section.to) return null;

    const fromCoord = section.from?.stop_point?.coord
      || section.from?.address?.coord
      || section.from?.poi?.coord;
    const toCoord = section.to?.stop_point?.coord
      || section.to?.address?.coord
      || section.to?.poi?.coord;

    const fromName =
      section.from?.stop_point?.name
      || section.from?.address?.label
      || section.from?.poi?.name
      || '出発地';

    const toName =
      section.to?.stop_point?.name
      || section.to?.address?.label
      || section.to?.poi?.name
      || '目的地';

    const fromStation = TransitStation.create(
      fromName,
      fromCoord ? parseFloat(fromCoord.lat) : undefined,
      fromCoord ? parseFloat(fromCoord.lon) : undefined
    );
    const toStation = TransitStation.create(
      toName,
      toCoord ? parseFloat(toCoord.lat) : undefined,
      toCoord ? parseFloat(toCoord.lon) : undefined
    );

    const mode = this.navitiaTypeToMode(section.type, section.display_informations?.commercial_mode);
    const durationMin = Math.round((section.duration || 0) / 60) || 1;
    const distanceM = section.geojson?.properties?.length || 0;

    const departure = section.departure_date_time
      ? this.parseNavitiaDate(section.departure_date_time)
      : new Date();
    const arrival = section.arrival_date_time
      ? this.parseNavitiaDate(section.arrival_date_time)
      : new Date(departure.getTime() + durationMin * 60000);

    const lineName = section.display_informations
      ? `${section.display_informations.network || ''} ${section.display_informations.headsign || section.display_informations.label || ''}`.trim()
      : undefined;

    return TransitLeg.create(
      fromStation,
      toStation,
      mode,
      durationMin,
      distanceM,
      lineName || undefined,
      departure,
      arrival,
      0 // Navitia無料版は運賃情報なし
    );
  }

  /**
   * Navitia の section type → TransitMode 変換
   */
  private navitiaTypeToMode(type: string, commercialMode?: string): TransitMode {
    const typeMap: Record<string, TransitMode> = {
      'street_network': 'walking',
      'walking': 'walking',
      'transfer': 'walking',
      'waiting': 'walking',
      'crow_fly': 'walking',
      'public_transport': 'train',
      'on_demand_transport': 'bus',
    };

    if (type === 'public_transport' && commercialMode) {
      const modeStr = commercialMode.toLowerCase();
      if (modeStr.includes('bus')) return 'bus';
      if (modeStr.includes('metro') || modeStr.includes('subway') || modeStr.includes('地下鉄')) return 'subway';
      if (modeStr.includes('shinkansen') || modeStr.includes('新幹線')) return 'shinkansen';
      if (modeStr.includes('ferry') || modeStr.includes('フェリー')) return 'ferry';
      return 'train';
    }

    return typeMap[type] || 'train';
  }

  /**
   * NavitiaのYYYYMMDDTHHmmss形式をDateに変換
   */
  private parseNavitiaDate(dateStr: string): Date {
    // 20260212T093000 → 2026-02-12T09:30:00
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(9, 11);
    const min = dateStr.substring(11, 13);
    const sec = dateStr.substring(13, 15) || '00';
    return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`);
  }

  /**
   * 住所を緯度経度に変換（Nominatim）
   */
  private async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `${this.NOMINATIM_BASE}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'RSS-FeedReader-App/1.0 (Educational Project)',
            'Accept-Language': 'ja',
          },
        }
      );

      const data = await response.json();
      if (!data || data.length === 0) return null;

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } catch {
      return null;
    }
  }

  /**
   * カバレッジ外・エラー時のデモデータ
   * NaviTime風の表示を再現
   */
  private getDemoRoutes(origin: string, destination: string): TransitRoute[] {
    const now = new Date();

    const originStation = TransitStation.create(origin, 35.6812, 139.7671);
    const destStation = TransitStation.create(destination, 35.6284, 139.7387);

    // ルート1: 電車ルート
    const route1Legs = [
      TransitLeg.create(
        originStation,
        TransitStation.create(`${origin}駅`, 35.6815, 139.7671),
        'walking', 5, 350, undefined,
        new Date(now.getTime()),
        new Date(now.getTime() + 5 * 60000), 0
      ),
      TransitLeg.create(
        TransitStation.create(`${origin}駅`, 35.6815, 139.7671),
        TransitStation.create('乗換駅', 35.6600, 139.7500),
        'train', 12, 9000, 'JR山手線（内回り）',
        new Date(now.getTime() + 7 * 60000),
        new Date(now.getTime() + 19 * 60000), 200
      ),
      TransitLeg.create(
        TransitStation.create('乗換駅', 35.6600, 139.7500),
        TransitStation.create(`${destination}駅`, 35.6284, 139.7387),
        'subway', 8, 5000, '東京メトロ',
        new Date(now.getTime() + 22 * 60000),
        new Date(now.getTime() + 30 * 60000), 180
      ),
      TransitLeg.create(
        TransitStation.create(`${destination}駅`, 35.6284, 139.7387),
        destStation,
        'walking', 3, 200, undefined,
        new Date(now.getTime() + 30 * 60000),
        new Date(now.getTime() + 33 * 60000), 0
      ),
    ];

    return [TransitRoute.create(originStation, destStation, route1Legs, 'domestic')];
  }
}
