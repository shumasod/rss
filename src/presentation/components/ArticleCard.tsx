import React, { useMemo, useCallback } from 'react';
import { Article } from '@domain/entities/Article';

interface ArticleCardProps {
  article: Article;
}

/**
 * ArticleCard Component
 * 記事カードコンポーネント
 * React.memoとuseMemoでパフォーマンス最適化
 */
export const ArticleCard = React.memo<ArticleCardProps>(({ article }) => {
  // 日付フォーマット処理をメモ化
  const formattedDate = useMemo(() => {
    const now = new Date();
    const date = article.publishedAt;
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }, [article.publishedAt]);

  // ハンドラーをメモ化
  const handleClick = useCallback(() => {
    window.open(article.url.value, '_blank', 'noopener,noreferrer');
  }, [article.url.value]);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="article-card" onClick={handleClick}>
      <span className="article-source">{article.sourceName}</span>
      <h3 className="article-title">{article.title.value}</h3>
      <p className="article-description">{article.description}</p>
      <div className="article-meta">
        <span className="article-date">{formattedDate}</span>
        <a
          href={article.url.value}
          className="article-link"
          onClick={handleLinkClick}
          target="_blank"
          rel="noopener noreferrer"
        >
          記事を読む →
        </a>
      </div>
    </div>
  );
});

ArticleCard.displayName = 'ArticleCard';
