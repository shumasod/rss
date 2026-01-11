import { injectable } from 'tsyringe';
import { Feed } from '@domain/entities/Feed';
import { Article } from '@domain/entities/Article';
import { IFeedFetchService, FeedFetchResult } from '@domain/services/IFeedFetchService';

/**
 * RSS2JSON API Response Types
 * 外部APIのレスポンス型を明示的に定義
 */
interface Rss2JsonResponse {
  status: string;
  feed?: {
    title?: string;
    url?: string;
    description?: string;
  };
  items?: Array<{
    title?: string;
    pubDate?: string;
    link?: string;
    guid?: string;
    author?: string;
    thumbnail?: string;
    description?: string;
    content?: string;
    enclosure?: Record<string, unknown>;
    categories?: string[];
  }>;
  message?: string;
}

/**
 * Rss2JsonFeedFetchService
 * RSS2JSON APIを使用したフィード取得サービス
 * 型安全性を重視した実装
 */
@injectable()
export class Rss2JsonFeedFetchService implements IFeedFetchService {
  private readonly API_URL = 'https://api.rss2json.com/v1/api.json';

  async fetchFeed(feed: Feed): Promise<FeedFetchResult> {
    try {
      const url = `${this.API_URL}?rss_url=${encodeURIComponent(feed.url.value)}`;
      const response = await fetch(url);

      if (!response.ok) {
        return {
          articles: [],
          success: false,
          error: `HTTP error: ${response.status}`,
        };
      }

      const data: Rss2JsonResponse = await response.json();

      if (data.status !== 'ok') {
        return {
          articles: [],
          success: false,
          error: data.message || 'Failed to fetch feed',
        };
      }

      const articles = this.parseArticles(data, feed);

      return {
        feedTitle: data.feed?.title,
        articles,
        success: true,
      };
    } catch (error) {
      return {
        articles: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private parseArticles(data: Rss2JsonResponse, feed: Feed): Article[] {
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items
      .filter((item) => item.title && item.link && item.pubDate)
      .map((item) => {
        try {
          // 型ガードで安全性を確保
          if (!item.title || !item.link || !item.pubDate) {
            return null;
          }

          return Article.create(
            feed.id.value,
            item.title,
            item.link,
            this.cleanDescription(item.description || ''),
            new Date(item.pubDate),
            data.feed?.title || feed.name.value,
          );
        } catch {
          // エンティティ作成に失敗した場合はnullを返す
          return null;
        }
      })
      .filter((article): article is Article => article !== null);
  }

  private cleanDescription(html: string): string {
    // HTMLタグを除去
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';

    // 最大200文字に制限
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  }
}
