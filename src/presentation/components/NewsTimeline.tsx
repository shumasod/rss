import React, { useEffect, useState, useCallback } from 'react';
import { GroupedArticles } from '@domain/repositories/IArticleRepository';
import { ArticleCard } from './ArticleCard';
import { useUseCases } from '../contexts/UseCasesContext';

/**
 * NewsTimeline Component
 * Yahooニュース風のタイムライン表示コンポーネント
 * 日付ごとにグループ化された記事を表示
 */
export const NewsTimeline: React.FC = () => {
  const { getNewsTimelineUseCase } = useUseCases();
  const [timeline, setTimeline] = useState<GroupedArticles[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // タイムラインを読み込み
  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getNewsTimelineUseCase.execute(100);
      setTimeline(result);
    } catch (err) {
      console.error('Failed to load timeline:', err);
      setError('タイムラインの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [getNewsTimelineUseCase]);

  // 初期化時にタイムラインを読み込み
  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // 日付を日本語形式でフォーマット
  const formatDateHeader = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 今日の日付と比較
    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    }
  };

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="loading-spinner"></div>
        <p>タイムラインを読み込んでいます...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-error">
        <p>{error}</p>
        <button onClick={loadTimeline} className="retry-button">
          再試行
        </button>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="timeline-empty">
        <p>記事がありません</p>
        <p className="timeline-empty-hint">
          RSSフィードを追加して、ニュースを取得してください
        </p>
      </div>
    );
  }

  return (
    <div className="news-timeline">
      <div className="timeline-header">
        <h2>ニュースタイムライン</h2>
        <button onClick={loadTimeline} className="refresh-button" disabled={loading}>
          更新
        </button>
      </div>

      <div className="timeline-content">
        {timeline.map((group) => (
          <div key={group.date} className="timeline-group">
            <div className="timeline-date-header">
              <span className="date-label">{formatDateHeader(group.date)}</span>
              <span className="article-count">{group.articles.length}件</span>
            </div>
            <div className="timeline-articles">
              {group.articles.map((article) => (
                <ArticleCard key={article.id.value} article={article} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
