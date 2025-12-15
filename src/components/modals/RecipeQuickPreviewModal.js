import React from 'react';
import { Clock, Users } from 'lucide-react';
import './RecipeQuickPreviewModal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecipeQuickPreviewModal = ({ isOpen, onClose, recipe }) => {
  if (!isOpen || !recipe) return null;

  // Image proxy helper for Instagram images
  const needsProxy = (url) => {
    return url &&
           (url.includes('cdninstagram.com') ||
            url.includes('instagram.com') ||
            url.includes('fbcdn.net'));
  };

  const getImageUrl = () => {
    if (!recipe.image) return null;
    return needsProxy(recipe.image)
      ? `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(recipe.image)}`
      : recipe.image;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="recipe-quick-preview__overlay" onClick={handleBackdropClick}>
      <div className="recipe-quick-preview__modal">
        <button className="recipe-quick-preview__close" onClick={onClose}>
          &times;
        </button>

        <div className="recipe-quick-preview__image">
          {getImageUrl() ? (
            <img
              src={getImageUrl()}
              alt={recipe.title}
              onError={(e) => {
                e.target.parentElement.classList.add('recipe-quick-preview__image--fallback');
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="recipe-quick-preview__image-placeholder">
              <span>No Image</span>
            </div>
          )}
        </div>

        <div className="recipe-quick-preview__content">
          <h3 className="recipe-quick-preview__title">{recipe.title}</h3>

          <div className="recipe-quick-preview__meta">
            {recipe.readyInMinutes && (
              <div className="recipe-quick-preview__meta-item">
                <Clock size={16} />
                <span>{recipe.readyInMinutes} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="recipe-quick-preview__meta-item">
                <Users size={16} />
                <span>{recipe.servings} servings</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeQuickPreviewModal;
