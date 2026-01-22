import { TransitRoute } from '../entities/TransitRoute';

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
