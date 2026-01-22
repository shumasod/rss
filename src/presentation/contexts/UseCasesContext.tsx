import React, { createContext, useContext, ReactNode } from 'react';
import { container } from 'tsyringe';
import { AddFeedUseCase } from '@application/use-cases/AddFeedUseCase';
import { RemoveFeedUseCase } from '@application/use-cases/RemoveFeedUseCase';
import { GetAllFeedsUseCase } from '@application/use-cases/GetAllFeedsUseCase';
import { GetArticlesUseCase } from '@application/use-cases/GetArticlesUseCase';
import { RefreshAllFeedsUseCase } from '@application/use-cases/RefreshAllFeedsUseCase';
import { GetNewsTimelineUseCase } from '@application/use-cases/GetNewsTimelineUseCase';
import { SearchTransitRouteUseCase } from '@application/use-cases/SearchTransitRouteUseCase';

/**
 * UseCasesContext
 * React Context API を使用した適切な依存性注入
 * テスタビリティとReactのベストプラクティスに準拠
 */
interface UseCases {
  addFeedUseCase: AddFeedUseCase;
  removeFeedUseCase: RemoveFeedUseCase;
  getAllFeedsUseCase: GetAllFeedsUseCase;
  getArticlesUseCase: GetArticlesUseCase;
  refreshAllFeedsUseCase: RefreshAllFeedsUseCase;
  getNewsTimelineUseCase: GetNewsTimelineUseCase;
  searchTransitRouteUseCase: SearchTransitRouteUseCase;
}

const UseCasesContext = createContext<UseCases | null>(null);

interface UseCasesProviderProps {
  children: ReactNode;
  useCases?: UseCases; // テスト用にモックを注入可能
}

export const UseCasesProvider: React.FC<UseCasesProviderProps> = ({
  children,
  useCases
}) => {
  // useCasesが提供されない場合は、DIコンテナから解決
  const value = useCases ?? {
    addFeedUseCase: container.resolve(AddFeedUseCase),
    removeFeedUseCase: container.resolve(RemoveFeedUseCase),
    getAllFeedsUseCase: container.resolve(GetAllFeedsUseCase),
    getArticlesUseCase: container.resolve(GetArticlesUseCase),
    refreshAllFeedsUseCase: container.resolve(RefreshAllFeedsUseCase),
    getNewsTimelineUseCase: container.resolve(GetNewsTimelineUseCase),
    searchTransitRouteUseCase: container.resolve(SearchTransitRouteUseCase),
  };

  return (
    <UseCasesContext.Provider value={value}>
      {children}
    </UseCasesContext.Provider>
  );
};

/**
 * useUseCases Hook
 * UseCasesを取得するカスタムフック
 */
export const useUseCases = (): UseCases => {
  const context = useContext(UseCasesContext);

  if (!context) {
    throw new Error('useUseCases must be used within UseCasesProvider');
  }

  return context;
};
