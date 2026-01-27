import { TransitRoute } from '../entities/TransitRoute';

/**
 * TransportMode - 交通手段の種類
 */
export type TransportMode =
  | 'all' // すべて
  | 'train' // 電車・私鉄
  | 'shinkansen' // 新幹線
  | 'bus' // 高速バス
  | 'ship' // 船・フェリー
  | 'airplane'; // 飛行機

/**
 * OriginType - 出発地の種類
 */
export type OriginType = 'station' | 'shop' | 'address';

/**
 * RoutePriority - ルート検索の優先条件
 */
export type RoutePriority =
  | 'time' // 最短時間優先
  | 'transfer' // 乗換回数少ない優先
  | 'fare' // 料金安い優先
  | 'walk' // 歩く距離少ない優先
  | 'comfort'; // 快適さ優先（座れる確率が高い）

/**
 * TransitSearchOptions
 * 乗換案内検索のオプション
 */
export interface TransitSearchOptions {
  departureTime?: Date; // 出発時刻
  arrivalTime?: Date; // 到着時刻
  maxTransfers?: number; // 最大乗換回数
  preferredModes?: string[]; // 優先する交通手段
  language?: string; // 言語設定
  transportMode?: TransportMode; // 交通手段の種類
  originType?: OriginType; // 出発地の種類
  priority?: RoutePriority; // 優先条件
}

/**
 * ITransitSearchService
 * 公共交通機関の乗換案内を検索するサービスのインターフェース
 */
export interface ITransitSearchService {
  /**
   * 出発地から目的地までのルートを検索
   * @param origin 出発地の名前または座標
   * @param destination 目的地の名前または座標
   * @param options 検索オプション
   * @returns 検索されたルートの配列
   */
  searchRoutes(
    origin: string,
    destination: string,
    options?: TransitSearchOptions,
  ): Promise<TransitRoute[]>;

  /**
   * サービスが利用可能かどうかを確認
   * @returns サービスが利用可能な場合はtrue
   */
  isAvailable(): Promise<boolean>;
}
