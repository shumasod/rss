import React from 'react';
import { Recipe } from '../../domain/entities/Recipe';
import { RecipeCard } from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

/**
 * レシピリストコンポーネント
 * レシピをグリッド形式で表示
 */
export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onSelectRecipe,
  onToggleFavorite,
}) => {
  if (recipes.length === 0) {
    return (
      <div className="recipe-list-empty">
        <p>レシピが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id.value}
          recipe={recipe}
          onSelect={onSelectRecipe}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
