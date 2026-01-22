import React, { useState } from 'react';
import { useFeedManager } from './hooks/useFeedManager';
import { UseCasesProvider } from './contexts/UseCasesContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { FeedManager } from './components/FeedManager';
import { FeedList } from './components/FeedList';
import { ArticleFilter } from './components/ArticleFilter';
import { ArticleList } from './components/ArticleList';
import { NewsTimeline } from './components/NewsTimeline';
import { TransitSearchView } from './components/TransitSearchView';
import { ErrorMessage } from './components/ErrorMessage';
import './App.css';

type ViewMode = 'list' | 'timeline' | 'transit';

/**
 * AppContent Component
 * メインアプリケーションのコンテンツ
 */
const AppContent: React.FC = () => {
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
    clearError,
  } = useFeedManager();

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  return (
    <div className="container">
      <Header onRefresh={refreshAllFeeds} loading={loading} />

      <ErrorMessage message={error} onDismiss={clearError} />

      <FeedManager onAddFeed={addFeed} loading={loading} />

      <FeedList feeds={feeds} onRemoveFeed={removeFeed} loading={loading} />

      {/* ビューモード切り替えタブ */}
      <div className="view-mode-tabs">
        <button
          className={`tab-button ${viewMode === 'timeline' ? 'active' : ''}`}
          onClick={() => setViewMode('timeline')}
        >
          タイムライン表示
        </button>
        <button
          className={`tab-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          リスト表示
        </button>
        <button
          className={`tab-button ${viewMode === 'transit' ? 'active' : ''}`}
          onClick={() => setViewMode('transit')}
        >
          🚉 乗換案内
        </button>
      </div>

      <div className="content">
        {viewMode === 'timeline' ? (
          <NewsTimeline />
        ) : viewMode === 'transit' ? (
          <TransitSearchView />
        ) : (
          <>
            <ArticleFilter currentFilter={filter} onFilterChange={setFilter} />
            <ArticleList articles={articles} loading={loading} />
          </>
        )}
      </div>

      <footer className="footer">
        <p>© 2026 RSS Feed Reader - Built with DDD & Microservices Architecture</p>
      </footer>
    </div>
  );
};

/**
 * App Component
 * UseCasesProviderとErrorBoundaryでラップしたメインアプリケーション
 * 依存性注入と予期しないエラーのハンドリングを提供
 */
export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UseCasesProvider>
        <AppContent />
      </UseCasesProvider>
    </ErrorBoundary>
  );
};
