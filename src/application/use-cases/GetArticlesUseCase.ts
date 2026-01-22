import { injectable, inject } from 'tsyringe';
import { Article } from '@domain/entities/Article';
import type { IArticleRepository } from '@domain/repositories/IArticleRepository';

/**
 * GetArticlesUseCase
 * 記事取得のユースケース
 * フィルタリング機能を含む
 */
@injectable()
export class GetArticlesUseCase {
  constructor(
    @inject('IArticleRepository') private articleRepository: IArticleRepository,
  ) {}

  async execute(filter?: ArticleFilter): Promise<GetArticlesResult> {
    try {
      let articles = await this.articleRepository.findAll();

      // フィルタリング適用
      if (filter) {
        articles = this.applyFilter(articles, filter);
      }

      // 日付でソート（新しい順）
      articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

      return {
        success: true,
        articles: articles,
      };
    } catch (error) {
      return {
        success: false,
        articles: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private applyFilter(articles: Article[], filter: ArticleFilter): Article[] {
    switch (filter) {
      case 'today':
        return articles.filter(article => article.isPublishedToday());
      case 'week':
        return articles.filter(article => article.isPublishedWithinDays(7));
      case 'all':
      default:
        return articles;
    }
  }
}

export type ArticleFilter = 'all' | 'today' | 'week';

export interface GetArticlesResult {
  success: boolean;
  articles: Article[];
  error?: string;
}
