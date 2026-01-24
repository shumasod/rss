import React from 'react';
import { Recipe } from '../../domain/entities/Recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

/**
 * レシピカードコンポーネント
 * 個別のレシピをカード形式で表示
 */
export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <div className="recipe-card-image-container">
        <img
          src={recipe.thumbnailUrl}
          alt={recipe.title.value}
          className="recipe-card-image"
        />
        <button
          className="recipe-favorite-button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe);
          }}
          aria-label={
            recipe.isFavorite
              ? 'お気に入りから削除'
              : 'お気に入りに追加'
          }
        >
          {recipe.isFavorite ? '★' : '☆'}
        </button>
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title.value}</h3>
        <div className="recipe-card-meta">
          <span className="recipe-card-category">
            {recipe.category.value}
          </span>
          <span className="recipe-card-area">{recipe.area}</span>
        </div>
        <div className="recipe-card-ingredients">
          {recipe.ingredients.length} 種類の材料
        </div>
      </div>
    </div>
  );
};
