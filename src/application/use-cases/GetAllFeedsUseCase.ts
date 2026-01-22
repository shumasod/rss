import { injectable, inject } from 'tsyringe';
import { Feed } from '@domain/entities/Feed';
import type { IFeedRepository } from '@domain/repositories/IFeedRepository';

/**
 * GetAllFeedsUseCase
 * 全フィード取得のユースケース
 */
@injectable()
export class GetAllFeedsUseCase {
  constructor(
    @inject('IFeedRepository') private feedRepository: IFeedRepository,
  ) {}

  async execute(): Promise<GetAllFeedsResult> {
    try {
      const feeds = await this.feedRepository.findAll();

      return {
        success: true,
        feeds: feeds,
      };
    } catch (error) {
      return {
        success: false,
        feeds: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export interface GetAllFeedsResult {
  success: boolean;
  feeds: Feed[];
  error?: string;
}
