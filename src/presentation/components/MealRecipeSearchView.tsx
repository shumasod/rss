import React, { useState, useCallback, useEffect } from 'react';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeList } from './RecipeList';
import { RecipeDetail } from './RecipeDetail';
import { useUseCases } from '../contexts/UseCasesContext';
import { ErrorMessage } from './ErrorMessage';

type ViewTab = 'search' | 'random' | 'favorites';

/**
 * レシピ検索メインビューコンポーネント
 * レシピの検索、ランダム表示、お気に入り管理を統合
 */
export const MealRecipeSearchView: React.FC = () => {
  const {
    searchMealRecipeUseCase,
    getRandomRecipesUseCase,
    getFavoriteRecipesUseCase,
    saveFavoriteRecipeUseCase,
    removeFavoriteRecipeUseCase,
    getRecipeCategoriesUseCase,
  } = useUseCases();

  const [activeTab, setActiveTab] = useState<ViewTab>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'category'>('name');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カテゴリ一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getRecipeCategoriesUseCase.execute();
      if (result.success && result.categories) {
        setCategories(result.categories);
      }
    };
    fetchCategories();
  }, [getRecipeCategoriesUseCase]);

  // タブ変更時の処理
  useEffect(() => {
    const loadContent = async () => {
      setError(null);
      setLoading(true);

      try {
        if (activeTab === 'random') {
          const result = await getRandomRecipesUseCase.execute(9);
          if (result.success && result.recipes) {
            setRecipes(result.recipes);
          } else {
            setError(result.error || 'ランダムレシピの取得に失敗しました');
            setRecipes([]);
          }
        } else if (activeTab === 'favorites') {
          const result = await getFavoriteRecipesUseCase.execute();
          if (result.success && result.recipes) {
            setRecipes(result.recipes);
            if (result.recipes.length === 0) {
              setError('お気に入りレシピがありません');
            }
          } else {
            setError(result.error || 'お気に入りの取得に失敗しました');
            setRecipes([]);
          }
        } else {
          setRecipes([]);
        }
      } catch (err) {
        setError('エラーが発生しました');
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [activeTab, getRandomRecipesUseCase, getFavoriteRecipesUseCase]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setError(null);
      setLoading(true);

      try {
        const result = await searchMealRecipeUseCase.execute(
          searchQuery,
          searchType
        );

        if (result.success && result.recipes) {
          setRecipes(result.recipes);
          if (result.recipes.length === 0) {
            setError('レシピが見つかりませんでした');
          }
        } else {
          setError(result.error || 'レシピの検索に失敗しました');
          setRecipes([]);
        }
      } catch (err) {
        setError('レシピの検索中にエラーが発生しました');
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, searchType, searchMealRecipeUseCase]
  );

  const handleToggleFavorite = useCallback(
    async (recipe: Recipe) => {
      try {
        if (recipe.isFavorite) {
          const result = await removeFavoriteRecipeUseCase.execute(
            recipe.id.value
          );
          if (result.success) {
            recipe.unmarkAsFavorite();
            setRecipes((prev) => [...prev]);
            if (selectedRecipe?.id.value === recipe.id.value) {
              setSelectedRecipe(recipe);
            }
            // お気に入りタブの場合はリストから削除
            if (activeTab === 'favorites') {
              setRecipes((prev) =>
                prev.filter((r) => r.id.value !== recipe.id.value)
              );
            }
          }
        } else {
          const result = await saveFavoriteRecipeUseCase.execute(recipe);
          if (result.success) {
            recipe.markAsFavorite();
            setRecipes((prev) => [...prev]);
            if (selectedRecipe?.id.value === recipe.id.value) {
              setSelectedRecipe(recipe);
            }
          }
        }
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
      }
    },
    [
      saveFavoriteRecipeUseCase,
      removeFavoriteRecipeUseCase,
      selectedRecipe,
      activeTab,
    ]
  );

  return (
    <div className="meal-recipe-search-view">
      <div className="recipe-tabs">
        <button
          className={`recipe-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 レシピ検索
        </button>
        <button
          className={`recipe-tab ${activeTab === 'random' ? 'active' : ''}`}
          onClick={() => setActiveTab('random')}
        >
          🎲 ランダム
        </button>
        <button
          className={`recipe-tab ${
            activeTab === 'favorites' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('favorites')}
        >
          ★ お気に入り
        </button>
      </div>

      {activeTab === 'search' && (
        <form className="recipe-search-form" onSubmit={handleSearch}>
          <div className="recipe-search-controls">
            <div className="recipe-search-type">
              <label>
                <input
                  type="radio"
                  value="name"
                  checked={searchType === 'name'}
                  onChange={(e) =>
                    setSearchType(e.target.value as 'name' | 'category')
                  }
                />
                レシピ名
              </label>
              <label>
                <input
                  type="radio"
                  value="category"
                  checked={searchType === 'category'}
                  onChange={(e) =>
                    setSearchType(e.target.value as 'name' | 'category')
                  }
                />
                カテゴリ
              </label>
            </div>

            {searchType === 'category' ? (
              <select
                className="recipe-search-select"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              >
                <option value="">カテゴリを選択</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="recipe-search-input"
                placeholder="レシピ名を入力（例: chicken, pasta）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}

            <button
              type="submit"
              className="recipe-search-button"
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>
        </form>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading && <div className="recipe-loading">読み込み中...</div>}

      {!loading && recipes.length > 0 && (
        <RecipeList
          recipes={recipes}
          onSelectRecipe={setSelectedRecipe}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};
