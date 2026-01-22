import { injectable, inject } from 'tsyringe';
import { Feed } from '@domain/entities/Feed';
import type { IFeedRepository } from '@domain/repositories/IFeedRepository';
import type { IFeedFetchService } from '@domain/services/IFeedFetchService';
import type { IArticleRepository } from '@domain/repositories/IArticleRepository';

/**
 * AddFeedUseCase
 * フィード追加のユースケース
 * マイクロサービスとして独立した責務を持つ
 */
@injectable()
export class AddFeedUseCase {
  constructor(
    @inject('IFeedRepository') private feedRepository: IFeedRepository,
    @inject('IArticleRepository') private articleRepository: IArticleRepository,
    @inject('IFeedFetchService') private feedFetchService: IFeedFetchService,
  ) {}

  async execute(url: string): Promise<AddFeedResult> {
    try {
      // 1. フィードエンティティを作成
      const feed = Feed.create(url);

      // 2. フィードを取得して記事を取得
      const fetchResult = await this.feedFetchService.fetchFeed(feed);

      if (!fetchResult.success) {
        return {
          success: false,
          error: fetchResult.error || 'Failed to fetch feed',
        };
      }

      // 3. フィード名を更新（取得したタイトルがあれば）
      if (fetchResult.feedTitle) {
        feed.updateName(fetchResult.feedTitle);
      }

      // 4. フィードを保存
      await this.feedRepository.save(feed);

      // 5. 記事を保存
      if (fetchResult.articles.length > 0) {
        await this.articleRepository.saveMany(fetchResult.articles);
      }

      return {
        success: true,
        feed: feed,
        articlesCount: fetchResult.articles.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export interface AddFeedResult {
  success: boolean;
  feed?: Feed;
  articlesCount?: number;
  error?: string;
}
