import { injectable, inject } from 'tsyringe';
import { FeedId } from '@domain/value-objects/FeedId';
import type { IFeedRepository } from '@domain/repositories/IFeedRepository';
import type { IArticleRepository } from '@domain/repositories/IArticleRepository';

/**
 * RemoveFeedUseCase
 * フィード削除のユースケース
 */
@injectable()
export class RemoveFeedUseCase {
  constructor(
    @inject('IFeedRepository') private feedRepository: IFeedRepository,
    @inject('IArticleRepository') private articleRepository: IArticleRepository,
  ) {}

  async execute(feedId: string): Promise<RemoveFeedResult> {
    try {
      const id = new FeedId(feedId);

      // 1. フィードの存在確認
      const exists = await this.feedRepository.exists(id);
      if (!exists) {
        return {
          success: false,
          error: 'Feed not found',
        };
      }

      // 2. 関連する記事を削除
      await this.articleRepository.deleteByFeedId(id);

      // 3. フィードを削除
      await this.feedRepository.delete(id);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export interface RemoveFeedResult {
  success: boolean;
  error?: string;
}
