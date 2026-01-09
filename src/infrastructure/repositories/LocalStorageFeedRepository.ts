import { injectable } from 'tsyringe';
import { Feed } from '@domain/entities/Feed';
import { FeedId } from '@domain/value-objects/FeedId';
import { IFeedRepository } from '@domain/repositories/IFeedRepository';

/**
 * LocalStorageFeedRepository
 * LocalStorageを使用したフィードリポジトリの実装
 */
@injectable()
export class LocalStorageFeedRepository implements IFeedRepository {
  private readonly STORAGE_KEY = 'rss_feeds';

  async save(feed: Feed): Promise<void> {
    const feeds = await this.findAll();
    const index = feeds.findIndex(f => f.id.equals(feed.id));

    if (index >= 0) {
      feeds[index] = feed;
    } else {
      feeds.push(feed);
    }

    this.saveToStorage(feeds);
  }

  async findById(id: FeedId): Promise<Feed | null> {
    const feeds = await this.findAll();
    return feeds.find(f => f.id.equals(id)) || null;
  }

  async findAll(): Promise<Feed[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((item: any) =>
        Feed.reconstruct(
          item.id,
          item.url,
          item.name,
          item.isActive,
          new Date(item.createdAt),
        ),
      );
    } catch {
      return [];
    }
  }

  async findActiveFeeds(): Promise<Feed[]> {
    const feeds = await this.findAll();
    return feeds.filter(f => f.isActive);
  }

  async delete(id: FeedId): Promise<void> {
    const feeds = await this.findAll();
    const filtered = feeds.filter(f => !f.id.equals(id));
    this.saveToStorage(filtered);
  }

  async exists(id: FeedId): Promise<boolean> {
    const feed = await this.findById(id);
    return feed !== null;
  }

  private saveToStorage(feeds: Feed[]): void {
    const data = feeds.map(f => f.toJSON());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}
