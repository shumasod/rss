import { injectable, inject } from 'tsyringe';
import { IFeedRepository } from '@domain/repositories/IFeedRepository';
import { IArticleRepository } from '@domain/repositories/IArticleRepository';
import { IFeedFetchService } from '@domain/services/IFeedFetchService';

/**
 * RefreshAllFeedsUseCase
 * 全フィード更新のユースケース
 */
@injectable()
export class RefreshAllFeedsUseCase {
  constructor(
    @inject('IFeedRepository') private feedRepository: IFeedRepository,
    @inject('IArticleRepository') private articleRepository: IArticleRepository,
    @inject('IFeedFetchService') private feedFetchService: IFeedFetchService,
  ) {}

  async execute(): Promise<RefreshAllFeedsResult> {
    try {
      // 1. アクティブなフィードを取得
      const feeds = await this.feedRepository.findActiveFeeds();

      if (feeds.length === 0) {
        return {
          success: true,
          totalFeeds: 0,
          successCount: 0,
          failedCount: 0,
        };
      }

      // 2. 既存の記事をクリア
      await this.articleRepository.clear();

      // 3. 各フィードから記事を取得
      let successCount = 0;
      let failedCount = 0;

      for (const feed of feeds) {
        try {
          const result = await this.feedFetchService.fetchFeed(feed);

          if (result.success) {
            // フィード名を更新
            if (result.feedTitle) {
              feed.updateName(result.feedTitle);
              await this.feedRepository.save(feed);
            }

            // 記事を保存
            if (result.articles.length > 0) {
              await this.articleRepository.saveMany(result.articles);
            }

            successCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }

      return {
        success: true,
        totalFeeds: feeds.length,
        successCount,
        failedCount,
      };
    } catch (error) {
      return {
        success: false,
        totalFeeds: 0,
        successCount: 0,
        failedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export interface RefreshAllFeedsResult {
  success: boolean;
  totalFeeds: number;
  successCount: number;
  failedCount: number;
  error?: string;
}
