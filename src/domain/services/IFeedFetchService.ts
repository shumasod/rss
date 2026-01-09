import { Article } from '../entities/Article';
import { Feed } from '../entities/Feed';

/**
 * IFeedFetchService Interface
 * RSSフィード取得を抽象化するドメインサービス
 * インフラ層で実装される
 */
export interface IFeedFetchService {
  fetchFeed(feed: Feed): Promise<FeedFetchResult>;
}

export interface FeedFetchResult {
  feedTitle?: string;
  articles: Article[];
  success: boolean;
  error?: string;
}
