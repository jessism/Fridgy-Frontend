import React, { useState } from 'react';
import './AIRecipeCard.css';

const AIRecipeCard = ({ recipe, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Format cooking time
  const formatTime = (prep_time, cook_time, total_time) => {
    if (total_time) return total_time;
    if (prep_time && cook_time) {
      const prep = parseInt(prep_time);
      const cook = parseInt(cook_time);
      return `${prep + cook} minutes`;
    }
    return prep_time || cook_time || 'N/A';
  };

  // Get dietary badges
  const getDietaryBadges = () => {
    const badges = [];
    if (recipe.dietary_info?.vegetarian) badges.push({ label: 'Vegetarian', color: '#22c55e' });
    if (recipe.dietary_info?.vegan) badges.push({ label: 'Vegan', color: '#16a34a' });
    if (recipe.dietary_info?.gluten_free) badges.push({ label: 'Gluten-Free', color: '#f59e0b' });
    if (recipe.dietary_info?.dairy_free) badges.push({ label: 'Dairy-Free', color: '#8b5cf6' });
    return badges;
  };

  const dietaryBadges = getDietaryBadges();

  return (
    <div className="ai-recipe-card">
      {/* Recipe Image */}
      <div className="recipe-image-container">
        {!imageLoaded && (
          <div className="recipe-image-skeleton">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        
        <img
          src={imageError ? '/assets/placeholder-food.jpg' : recipe.imageUrl}
          alt={recipe.title}
          className={`recipe-image ${imageLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Recipe Number Badge */}
        <div className="recipe-number-badge">
          {index + 1}
        </div>

        {/* Difficulty Badge */}
        <div 
          className="difficulty-badge"
          style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
        >
          {recipe.difficulty || 'Medium'}
        </div>
      </div>

      {/* Recipe Content */}
      <div className="recipe-content">
        {/* Header */}
        <div className="recipe-header">
          <h3 className="recipe-title">{recipe.title}</h3>
          <p className="recipe-description">{recipe.description}</p>
        </div>

        {/* Recipe Meta */}
        <div className="recipe-meta">
          <div className="meta-item">
            <span className="meta-icon">⏱️</span>
            <span className="meta-text">
              {formatTime(recipe.prep_time, recipe.cook_time, recipe.total_time)}
            </span>
          </div>
          
          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <span className="meta-text">{recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span>
          </div>
          
          {recipe.cuisine_type && (
            <div className="meta-item">
              <span className="meta-icon">🍽️</span>
              <span className="meta-text">{recipe.cuisine_type}</span>
            </div>
          )}
        </div>

        {/* Dietary Badges */}
        {dietaryBadges.length > 0 && (
          <div className="dietary-badges">
            {dietaryBadges.map((badge, idx) => (
              <span 
                key={idx} 
                className="dietary-badge"
                style={{ backgroundColor: badge.color }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Key Ingredients */}
        {recipe.key_ingredients && recipe.key_ingredients.length > 0 && (
          <div className="key-ingredients">
            <h4>Key Ingredients:</h4>
            <div className="ingredient-tags">
              {recipe.key_ingredients.slice(0, 4).map((ingredient, idx) => (
                <span key={idx} className="ingredient-tag">
                  {ingredient}
                </span>
              ))}
              {recipe.key_ingredients.length > 4 && (
                <span className="ingredient-tag more">
                  +{recipe.key_ingredients.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cooking Tip */}
        {recipe.tips && (
          <div className="cooking-tip">
            <span className="tip-icon">💡</span>
            <p className="tip-text">{recipe.tips}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="recipe-actions">
          <button 
            className="btn-primary view-recipe-btn"
            onClick={() => {
              // TODO: Implement recipe detail modal
              console.log('View full recipe:', recipe);
            }}
          >
            View Full Recipe
          </button>
          
          <button 
            className="btn-secondary save-recipe-btn"
            onClick={() => {
              // TODO: Implement save to favorites
              console.log('Save recipe:', recipe);
            }}
          >
            <span className="save-icon">🔖</span>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRecipeCard;