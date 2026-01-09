import { FeedId } from '../value-objects/FeedId';
import { FeedUrl } from '../value-objects/FeedUrl';
import { FeedName } from '../value-objects/FeedName';

/**
 * Feed Entity - ドメインの中心的なエンティティ
 * RSSフィードを表現する
 */
export class Feed {
  private constructor(
    private readonly _id: FeedId,
    private _name: FeedName,
    private readonly _url: FeedUrl,
    private _isActive: boolean = true,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(url: string, name?: string): Feed {
    const feedId = FeedId.generate();
    const feedUrl = new FeedUrl(url);
    const feedName = name ? new FeedName(name) : new FeedName(url);
    return new Feed(feedId, feedName, feedUrl);
  }

  static reconstruct(
    id: string,
    url: string,
    name: string,
    isActive: boolean,
    createdAt: Date,
  ): Feed {
    return new Feed(
      new FeedId(id),
      new FeedName(name),
      new FeedUrl(url),
      isActive,
      createdAt,
    );
  }

  get id(): FeedId {
    return this._id;
  }

  get name(): FeedName {
    return this._name;
  }

  get url(): FeedUrl {
    return this._url;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  updateName(name: string): void {
    this._name = new FeedName(name);
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  equals(other: Feed): boolean {
    return this._id.equals(other._id);
  }

  toJSON() {
    return {
      id: this._id.value,
      name: this._name.value,
      url: this._url.value,
      isActive: this._isActive,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
