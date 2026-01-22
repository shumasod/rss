import { inject, injectable } from 'tsyringe';
import type {
  ITransitSearchService,
  TransitSearchOptions,
} from '@domain/services/ITransitSearchService';
import { TransitRoute } from '@domain/entities/TransitRoute';

/**
 * SearchTransitRouteUseCase
 * 公共交通機関の乗換案内を検索するユースケース
 */
@injectable()
export class SearchTransitRouteUseCase {
  constructor(
    @inject('IJapanTransitSearchService')
    private readonly japanTransitService: ITransitSearchService,
    @inject('IInternationalTransitSearchService')
    private readonly internationalTransitService: ITransitSearchService,
  ) {}

  /**
   * 国内の乗換案内を検索
   */
  async searchDomesticRoutes(
    origin: string,
    destination: string,
    options?: TransitSearchOptions,
  ): Promise<TransitRoute[]> {
    try {
      const isAvailable = await this.japanTransitService.isAvailable();
      if (!isAvailable) {
        throw new Error('国内乗換案内サービスが利用できません');
      }

      const routes = await this.japanTransitService.searchRoutes(
        origin,
        destination,
        options,
      );

      if (routes.length === 0) {
        throw new Error('指定された条件でルートが見つかりませんでした');
      }

      return routes;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`国内乗換案内の検索に失敗しました: ${error.message}`);
      }
      throw new Error('国内乗換案内の検索中に予期しないエラーが発生しました');
    }
  }

  /**
   * 国外の乗換案内を検索
   */
  async searchInternationalRoutes(
    origin: string,
    destination: string,
    options?: TransitSearchOptions,
  ): Promise<TransitRoute[]> {
    try {
      const isAvailable = await this.internationalTransitService.isAvailable();
      if (!isAvailable) {
        throw new Error('国外乗換案内サービスが利用できません');
      }

      const routes = await this.internationalTransitService.searchRoutes(
        origin,
        destination,
        options,
      );

      if (routes.length === 0) {
        throw new Error('指定された条件でルートが見つかりませんでした');
      }

      return routes;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`国外乗換案内の検索に失敗しました: ${error.message}`);
      }
      throw new Error('国外乗換案内の検索中に予期しないエラーが発生しました');
    }
  }

  /**
   * 自動判定で乗換案内を検索
   * 地域に応じて適切なサービスを使用
   */
  async searchRoutes(
    origin: string,
    destination: string,
    region: 'domestic' | 'international',
    options?: TransitSearchOptions,
  ): Promise<TransitRoute[]> {
    if (region === 'domestic') {
      return this.searchDomesticRoutes(origin, destination, options);
    } else {
      return this.searchInternationalRoutes(origin, destination, options);
    }
  }
}
