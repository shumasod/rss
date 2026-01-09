import React from 'react';
import { Article } from '@domain/entities/Article';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const formatDate = (date: Date): string => {
    const now = new Date();
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
  };

  const handleClick = () => {
    window.open(article.url.value, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="article-card" onClick={handleClick}>
      <span className="article-source">{article.sourceName}</span>
      <h3 className="article-title">{article.title.value}</h3>
      <p className="article-description">{article.description}</p>
      <div className="article-meta">
        <span className="article-date">{formatDate(article.publishedAt)}</span>
        <a
          href={article.url.value}
          className="article-link"
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noopener noreferrer"
        >
          記事を読む →
        </a>
      </div>
    </div>
  );
};
