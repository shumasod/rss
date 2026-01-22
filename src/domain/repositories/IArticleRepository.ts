import { Article } from '../entities/Article';
import { ArticleId } from '../value-objects/ArticleId';
import { FeedId } from '../value-objects/FeedId';

/**
 * 日付でグループ化された記事
 */
export interface GroupedArticles {
  date: string; // YYYY-MM-DD形式
  articles: Article[];
}

/**
 * IArticleRepository Interface
 * 記事の永続化を抽象化するリポジトリインターフェース
 */
export interface IArticleRepository {
  save(article: Article): Promise<void>;
  saveMany(articles: Article[]): Promise<void>;
  findById(id: ArticleId): Promise<Article | null>;
  findAll(): Promise<Article[]>;
  findByFeedId(feedId: FeedId): Promise<Article[]>;
  findRecentArticles(limit?: number): Promise<Article[]>;
  findArticlesGroupedByDate(limit?: number): Promise<GroupedArticles[]>;
  deleteByFeedId(feedId: FeedId): Promise<void>;
  clear(): Promise<void>;
}
