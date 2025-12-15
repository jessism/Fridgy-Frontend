import React from 'react';
import './RecipeCarousel.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecipeCarousel = ({ recipes, onRecipeClick }) => {
  if (!recipes || recipes.length === 0) return null;

  // Helper to check if URL needs proxying (Instagram images)
  const needsProxy = (url) => {
    return url &&
           (url.includes('cdninstagram.com') ||
            url.includes('instagram.com') ||
            url.includes('fbcdn.net'));
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return needsProxy(imageUrl)
      ? `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl;
  };

  return (
    <div className="recipe-carousel">
      <h4 className="recipe-carousel__title">Recipes in this list</h4>
      <div className="recipe-carousel__track">
        {recipes.map((recipe, index) => (
          <div
            key={`${recipe.id}-${index}`}
            className="recipe-carousel__card"
            onClick={() => onRecipeClick(recipe)}
          >
            <div className="recipe-carousel__image">
              {getImageUrl(recipe.image) ? (
                <img
                  src={getImageUrl(recipe.image)}
                  alt={recipe.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('recipe-carousel__image--fallback');
                  }}
                />
              ) : (
                <div className="recipe-carousel__placeholder">
                  <span>No Image</span>
                </div>
              )}
            </div>
            <div className="recipe-carousel__info">
              <span className="recipe-carousel__name">{recipe.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeCarousel;
