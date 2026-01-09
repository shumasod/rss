import { useState, useEffect, useCallback } from 'react';
import { container } from 'tsyringe';
import { Feed } from '@domain/entities/Feed';
import { Article } from '@domain/entities/Article';
import { AddFeedUseCase } from '@application/use-cases/AddFeedUseCase';
import { RemoveFeedUseCase } from '@application/use-cases/RemoveFeedUseCase';
import { GetAllFeedsUseCase } from '@application/use-cases/GetAllFeedsUseCase';
import { GetArticlesUseCase, ArticleFilter } from '@application/use-cases/GetArticlesUseCase';
import { RefreshAllFeedsUseCase } from '@application/use-cases/RefreshAllFeedsUseCase';

/**
 * useFeedManager Hook
 * フィード管理のためのカスタムフック
 * ビジネスロジックとUIを分離
 */
export const useFeedManager = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<ArticleFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use Cases
  const addFeedUseCase = container.resolve(AddFeedUseCase);
  const removeFeedUseCase = container.resolve(RemoveFeedUseCase);
  const getAllFeedsUseCase = container.resolve(GetAllFeedsUseCase);
  const getArticlesUseCase = container.resolve(GetArticlesUseCase);
  const refreshAllFeedsUseCase = container.resolve(RefreshAllFeedsUseCase);

  // フィード一覧を読み込む
  const loadFeeds = useCallback(async () => {
    const result = await getAllFeedsUseCase.execute();
    if (result.success) {
      setFeeds(result.feeds);
    }
  }, [getAllFeedsUseCase]);

  // 記事を読み込む
  const loadArticles = useCallback(async () => {
    const result = await getArticlesUseCase.execute(filter);
    if (result.success) {
      setArticles(result.articles);
    }
  }, [getArticlesUseCase, filter]);

  // フィードを追加
  const addFeed = useCallback(
    async (url: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await addFeedUseCase.execute(url);

        if (result.success) {
          await loadFeeds();
          await loadArticles();
          return true;
        } else {
          setError(result.error || 'Failed to add feed');
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [addFeedUseCase, loadFeeds, loadArticles],
  );

  // フィードを削除
  const removeFeed = useCallback(
    async (feedId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await removeFeedUseCase.execute(feedId);

        if (result.success) {
          await loadFeeds();
          await loadArticles();
          return true;
        } else {
          setError(result.error || 'Failed to remove feed');
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [removeFeedUseCase, loadFeeds, loadArticles],
  );

  // すべてのフィードを更新
  const refreshAllFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await refreshAllFeedsUseCase.execute();

      if (result.success) {
        await loadFeeds();
        await loadArticles();
        return true;
      } else {
        setError(result.error || 'Failed to refresh feeds');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshAllFeedsUseCase, loadFeeds, loadArticles]);

  // 初期化
  useEffect(() => {
    loadFeeds();
    loadArticles();
  }, [loadFeeds, loadArticles]);

  // フィルター変更時に記事を再読み込み
  useEffect(() => {
    loadArticles();
  }, [filter, loadArticles]);

  return {
    feeds,
    articles,
    filter,
    loading,
    error,
    setFilter,
    addFeed,
    removeFeed,
    refreshAllFeeds,
  };
};
