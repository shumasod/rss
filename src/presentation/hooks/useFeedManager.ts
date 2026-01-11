import { useState, useEffect, useCallback, useRef } from 'react';
import { Feed } from '@domain/entities/Feed';
import { Article } from '@domain/entities/Article';
import { ArticleFilter } from '@application/use-cases/GetArticlesUseCase';
import { useUseCases } from '../contexts/UseCasesContext';

/**
 * useFeedManager Hook
 * フィード管理のためのカスタムフック
 * Context APIを使用した適切な依存性注入
 * 無限ループを防ぎ、パフォーマンスを最適化
 */
export const useFeedManager = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<ArticleFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // エラー自動クリア用のタイマー
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Context から Use Cases を取得（安定した参照）
  const {
    addFeedUseCase,
    removeFeedUseCase,
    getAllFeedsUseCase,
    getArticlesUseCase,
    refreshAllFeedsUseCase,
  } = useUseCases();

  // エラーを設定し、5秒後に自動クリア
  const setErrorWithTimeout = useCallback((errorMessage: string) => {
    setError(errorMessage);

    // 既存のタイマーをクリア
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // 5秒後にエラーをクリア
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 5000);
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // フィード一覧を読み込む（依存配列を修正）
  const loadFeeds = useCallback(async () => {
    const result = await getAllFeedsUseCase.execute();
    if (result.success) {
      setFeeds(result.feeds);
    } else if (result.error) {
      setErrorWithTimeout(result.error);
    }
  }, [getAllFeedsUseCase, setErrorWithTimeout]);

  // 記事を読み込む（依存配列を修正）
  const loadArticles = useCallback(async () => {
    const result = await getArticlesUseCase.execute(filter);
    if (result.success) {
      setArticles(result.articles);
    } else if (result.error) {
      setErrorWithTimeout(result.error);
    }
  }, [getArticlesUseCase, filter, setErrorWithTimeout]);

  // フィードを追加
  const addFeed = useCallback(
    async (url: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await addFeedUseCase.execute(url);

        if (result.success) {
          await Promise.all([loadFeeds(), loadArticles()]);
          return true;
        } else {
          setErrorWithTimeout(result.error || 'Failed to add feed');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setErrorWithTimeout(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [addFeedUseCase, loadFeeds, loadArticles, setErrorWithTimeout],
  );

  // フィードを削除
  const removeFeed = useCallback(
    async (feedId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await removeFeedUseCase.execute(feedId);

        if (result.success) {
          await Promise.all([loadFeeds(), loadArticles()]);
          return true;
        } else {
          setErrorWithTimeout(result.error || 'Failed to remove feed');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setErrorWithTimeout(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [removeFeedUseCase, loadFeeds, loadArticles, setErrorWithTimeout],
  );

  // すべてのフィードを更新
  const refreshAllFeeds = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await refreshAllFeedsUseCase.execute();

      if (result.success) {
        await Promise.all([loadFeeds(), loadArticles()]);
        return true;
      } else {
        setErrorWithTimeout(result.error || 'Failed to refresh feeds');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setErrorWithTimeout(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshAllFeedsUseCase, loadFeeds, loadArticles, setErrorWithTimeout]);

  // エラーを手動でクリア
  const clearError = useCallback(() => {
    setError(null);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  // 初期化（マウント時のみ実行）
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (mounted) {
        await Promise.all([loadFeeds(), loadArticles()]);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 意図的に空の依存配列（初回マウント時のみ）

  // フィルター変更時に記事を再読み込み
  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]); // filterのみに依存

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
    clearError,
  };
};
