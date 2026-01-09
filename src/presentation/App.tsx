import React from 'react';
import { useFeedManager } from './hooks/useFeedManager';
import { Header } from './components/Header';
import { FeedManager } from './components/FeedManager';
import { FeedList } from './components/FeedList';
import { ArticleFilter } from './components/ArticleFilter';
import { ArticleList } from './components/ArticleList';
import { ErrorMessage } from './components/ErrorMessage';
import './App.css';

/**
 * App Component
 * メインアプリケーションコンポーネント
 * プレゼンテーション層の最上位
 */
export const App: React.FC = () => {
  const {
    feeds,
    articles,
    filter,
    loading,
    error,
    setFilter,
    addFeed,
    removeFeed,
    refreshAllFeeds,
  } = useFeedManager();

  return (
    <div className="container">
      <Header onRefresh={refreshAllFeeds} loading={loading} />

      <ErrorMessage message={error} onDismiss={() => {}} />

      <FeedManager onAddFeed={addFeed} loading={loading} />

      <FeedList feeds={feeds} onRemoveFeed={removeFeed} loading={loading} />

      <div className="content">
        <ArticleFilter currentFilter={filter} onFilterChange={setFilter} />
        <ArticleList articles={articles} loading={loading} />
      </div>

      <footer className="footer">
        <p>© 2026 RSS Feed Reader - Built with DDD & Microservices Architecture</p>
      </footer>
    </div>
  );
};
