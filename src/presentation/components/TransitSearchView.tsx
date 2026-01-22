import React, { useState } from 'react';
import { TransitSearch } from './TransitSearch';
import { TransitRouteCard } from './TransitRouteCard';
import { TransitRoute } from '@domain/entities/TransitRoute';
import { useUseCases } from '../contexts/UseCasesContext';

/**
 * TransitSearchView Component
 * 乗換案内検索のメインビュー
 */
export const TransitSearchView: React.FC = () => {
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { searchTransitRouteUseCase } = useUseCases();

  const handleSearchComplete = (searchResults: TransitRoute[]) => {
    setRoutes(searchResults);
    setHasSearched(true);
  };

  return (
    <div className="transit-search-view">
      <TransitSearch
        searchTransitUseCase={searchTransitRouteUseCase}
        onSearchComplete={handleSearchComplete}
      />

      <div className="transit-results">
        {hasSearched && routes.length === 0 && (
          <div className="no-results">
            <p>検索結果が見つかりませんでした</p>
          </div>
        )}

        {routes.length > 0 && (
          <>
            <h3 className="results-header">検索結果: {routes.length}件のルート</h3>
            <div className="routes-list">
              {routes.map((route, index) => (
                <TransitRouteCard key={route.id || index} route={route} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
