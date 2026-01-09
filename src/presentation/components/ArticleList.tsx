import React from 'react';
import { Article } from '@domain/entities/Article';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, loading }) => {
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="empty-state">
        <h3>📭 記事がありません</h3>
        <p>RSSフィードを追加して最新情報をチェックしましょう</p>
      </div>
    );
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <ArticleCard key={article.id.value} article={article} />
      ))}
    </div>
  );
};
