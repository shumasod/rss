import { inject, injectable } from 'tsyringe';
import type { IArticleRepository, GroupedArticles } from '@domain/repositories/IArticleRepository';

/**
 * GetNewsTimelineUseCase
 * ニュースタイムラインを取得するユースケース
 * 日付ごとにグループ化された記事を返す
 */
@injectable()
export class GetNewsTimelineUseCase {
  constructor(
    @inject('IArticleRepository')
    private articleRepository: IArticleRepository,
  ) {}

  /**
   * タイムラインを取得
   * @param limit 取得する記事の最大数（デフォルト: 100）
   * @returns 日付でグループ化された記事のリスト
   */
  async execute(limit: number = 100): Promise<GroupedArticles[]> {
    try {
      const groupedArticles = await this.articleRepository.findArticlesGroupedByDate(limit);
      return groupedArticles;
    } catch (error) {
      console.error('Error fetching news timeline:', error);
      throw new Error('ニュースタイムラインの取得に失敗しました');
    }
  }
}
