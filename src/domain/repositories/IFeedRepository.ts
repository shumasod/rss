import { Feed } from '../entities/Feed';
import { FeedId } from '../value-objects/FeedId';

/**
 * IFeedRepository Interface
 * フィードの永続化を抽象化するリポジトリインターフェース
 */
export interface IFeedRepository {
  save(feed: Feed): Promise<void>;
  findById(id: FeedId): Promise<Feed | null>;
  findAll(): Promise<Feed[]>;
  findActiveFeeds(): Promise<Feed[]>;
  delete(id: FeedId): Promise<void>;
  exists(id: FeedId): Promise<boolean>;
}
