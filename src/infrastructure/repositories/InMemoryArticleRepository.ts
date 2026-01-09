import { injectable } from 'tsyringe';
import { Article } from '@domain/entities/Article';
import { ArticleId } from '@domain/value-objects/ArticleId';
import { FeedId } from '@domain/value-objects/FeedId';
import { IArticleRepository } from '@domain/repositories/IArticleRepository';

/**
 * InMemoryArticleRepository
 * インメモリでの記事リポジトリの実装
 * セッション中のみ記事を保持
 */
@injectable()
export class InMemoryArticleRepository implements IArticleRepository {
  private articles: Article[] = [];

  async save(article: Article): Promise<void> {
    const index = this.articles.findIndex(a => a.id.equals(article.id));

    if (index >= 0) {
      this.articles[index] = article;
    } else {
      this.articles.push(article);
    }
  }

  async saveMany(articles: Article[]): Promise<void> {
    for (const article of articles) {
      await this.save(article);
    }
  }

  async findById(id: ArticleId): Promise<Article | null> {
    return this.articles.find(a => a.id.equals(id)) || null;
  }

  async findAll(): Promise<Article[]> {
    return [...this.articles];
  }

  async findByFeedId(feedId: FeedId): Promise<Article[]> {
    return this.articles.filter(a => a.feedId.equals(feedId));
  }

  async findRecentArticles(limit: number = 50): Promise<Article[]> {
    const sorted = [...this.articles].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
    return sorted.slice(0, limit);
  }

  async deleteByFeedId(feedId: FeedId): Promise<void> {
    this.articles = this.articles.filter(a => !a.feedId.equals(feedId));
  }

  async clear(): Promise<void> {
    this.articles = [];
  }
}
