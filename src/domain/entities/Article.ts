import { ArticleId } from '../value-objects/ArticleId';
import { FeedId } from '../value-objects/FeedId';
import { ArticleTitle } from '../value-objects/ArticleTitle';
import { ArticleUrl } from '../value-objects/ArticleUrl';

/**
 * Article Entity - 記事エンティティ
 * RSSフィードから取得した個別の記事を表現する
 */
export class Article {
  private constructor(
    private readonly _id: ArticleId,
    private readonly _feedId: FeedId,
    private readonly _title: ArticleTitle,
    private readonly _url: ArticleUrl,
    private readonly _description: string,
    private readonly _publishedAt: Date,
    private readonly _sourceName: string,
  ) {}

  static create(
    feedId: string,
    title: string,
    url: string,
    description: string,
    publishedAt: Date,
    sourceName: string,
  ): Article {
    return new Article(
      ArticleId.generate(),
      new FeedId(feedId),
      new ArticleTitle(title),
      new ArticleUrl(url),
      description,
      publishedAt,
      sourceName,
    );
  }

  static reconstruct(
    id: string,
    feedId: string,
    title: string,
    url: string,
    description: string,
    publishedAt: Date,
    sourceName: string,
  ): Article {
    return new Article(
      new ArticleId(id),
      new FeedId(feedId),
      new ArticleTitle(title),
      new ArticleUrl(url),
      description,
      publishedAt,
      sourceName,
    );
  }

  get id(): ArticleId {
    return this._id;
  }

  get feedId(): FeedId {
    return this._feedId;
  }

  get title(): ArticleTitle {
    return this._title;
  }

  get url(): ArticleUrl {
    return this._url;
  }

  get description(): string {
    return this._description;
  }

  get publishedAt(): Date {
    return this._publishedAt;
  }

  get sourceName(): string {
    return this._sourceName;
  }

  isPublishedToday(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this._publishedAt >= today;
  }

  isPublishedWithinDays(days: number): boolean {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    return this._publishedAt >= threshold;
  }

  equals(other: Article): boolean {
    return this._id.equals(other._id);
  }

  toJSON() {
    return {
      id: this._id.value,
      feedId: this._feedId.value,
      title: this._title.value,
      url: this._url.value,
      description: this._description,
      publishedAt: this._publishedAt.toISOString(),
      sourceName: this._sourceName,
    };
  }
}
