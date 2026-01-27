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
import { MealRecipeSearchView } from './components/MealRecipeSearchView';
import { ErrorMessage } from './components/ErrorMessage';
import { BannerAd } from './components/BannerAd';
import { StockChart } from './components/StockChart';
import { AirlineInfo } from './components/AirlineInfo';
import { LowPriceStockLP } from './components/LowPriceStockLP';
import './App.css';

type ViewMode = 'list' | 'timeline' | 'transit' | 'recipe' | 'stock' | 'airline' | 'lowprice-lp';

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

  // 低位株LPページの場合は特別なレイアウト
  if (viewMode === 'lowprice-lp') {
    return <LowPriceStockLP onBack={() => setViewMode('stock')} />;
  }

  return (
    <div className="container">
      <Header onRefresh={refreshAllFeeds} loading={loading} />

      {/* ヘッダーバナー広告 */}
      <BannerAd position="header" size="large" />

      <ErrorMessage message={error} onDismiss={clearError} />

      <FeedManager onAddFeed={addFeed} loading={loading} />

      <FeedList feeds={feeds} onRemoveFeed={removeFeed} loading={loading} />

      {/* ビューモード切り替えタブ */}
      <div className="view-mode-tabs">
        <button
          className={`tab-button ${viewMode === 'timeline' ? 'active' : ''}`}
          onClick={() => setViewMode('timeline')}
        >
          📰 タイムライン
        </button>
        <button
          className={`tab-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 リスト
        </button>
        <button
          className={`tab-button ${viewMode === 'transit' ? 'active' : ''}`}
          onClick={() => setViewMode('transit')}
        >
          🚉 乗換案内
        </button>
        <button
          className={`tab-button ${viewMode === 'airline' ? 'active' : ''}`}
          onClick={() => setViewMode('airline')}
        >
          ✈️ 航空会社
        </button>
        <button
          className={`tab-button ${viewMode === 'stock' ? 'active' : ''}`}
          onClick={() => setViewMode('stock')}
        >
          📈 株式
        </button>
        <button
          className={`tab-button ${viewMode === 'recipe' ? 'active' : ''}`}
          onClick={() => setViewMode('recipe')}
        >
          🍽️ レシピ
        </button>
      </div>

      <div className="content">
        {viewMode === 'timeline' ? (
          <NewsTimeline />
        ) : viewMode === 'transit' ? (
          <TransitSearchView />
        ) : viewMode === 'recipe' ? (
          <MealRecipeSearchView />
        ) : viewMode === 'stock' ? (
          <StockChart onNavigateToLP={() => setViewMode('lowprice-lp')} />
        ) : viewMode === 'airline' ? (
          <AirlineInfo />
        ) : (
          <>
            <ArticleFilter currentFilter={filter} onFilterChange={setFilter} />
            <ArticleList articles={articles} loading={loading} />
          </>
        )}
      </div>

      {/* フッターバナー広告 */}
      <BannerAd position="footer" size="medium" />

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
