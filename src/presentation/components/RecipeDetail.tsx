import React from 'react';
import { Recipe } from '../../domain/entities/Recipe';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

/**
 * レシピ詳細モーダルコンポーネント
 * レシピの詳細情報を表示
 */
export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onClose,
  onToggleFavorite,
}) => {
  return (
    <div className="recipe-detail-overlay" onClick={onClose}>
      <div
        className="recipe-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="recipe-detail-header">
          <h2 className="recipe-detail-title">{recipe.title.value}</h2>
          <div className="recipe-detail-actions">
            <button
              className="recipe-favorite-button-large"
              onClick={() => onToggleFavorite(recipe)}
              aria-label={
                recipe.isFavorite
                  ? 'お気に入りから削除'
                  : 'お気に入りに追加'
              }
            >
              {recipe.isFavorite ? '★ お気に入り' : '☆ お気に入りに追加'}
            </button>
            <button className="recipe-detail-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="recipe-detail-content">
          <div className="recipe-detail-image-container">
            <img
              src={recipe.thumbnailUrl}
              alt={recipe.title.value}
              className="recipe-detail-image"
            />
          </div>

          <div className="recipe-detail-info">
            <div className="recipe-detail-meta">
              <span className="recipe-detail-category">
                カテゴリ: {recipe.category.value}
              </span>
              <span className="recipe-detail-area">地域: {recipe.area}</span>
            </div>

            <div className="recipe-detail-section">
              <h3 className="recipe-detail-section-title">材料</h3>
              <ul className="recipe-ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="recipe-ingredient-item">
                    <span className="ingredient-name">
                      {ingredient.name}
                    </span>
                    {ingredient.measure && (
                      <span className="ingredient-measure">
                        : {ingredient.measure}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="recipe-detail-section">
              <h3 className="recipe-detail-section-title">作り方</h3>
              <p className="recipe-instructions">
                {recipe.instructions}
              </p>
            </div>

            {(recipe.youtubeUrl || recipe.sourceUrl) && (
              <div className="recipe-detail-links">
                {recipe.youtubeUrl && (
                  <a
                    href={recipe.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recipe-link recipe-youtube-link"
                  >
                    📺 YouTube で見る
                  </a>
                )}
                {recipe.sourceUrl && (
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recipe-link recipe-source-link"
                  >
                    🔗 レシピ元を見る
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
