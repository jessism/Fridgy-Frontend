import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './MealDetailModal.css';

const MealDetailModal = ({ meal, isOpen, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Reset image state when meal changes
  useEffect(() => {
    if (meal) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [meal]);

  if (!isOpen || !meal) return null;

  // Extract meal name
  const getMealName = () => {
    if (meal.meal_name) {
      return meal.meal_name;
    }
    
    try {
      const ingredients = typeof meal.ingredients_logged === 'string' 
        ? JSON.parse(meal.ingredients_logged) 
        : meal.ingredients_logged;
      
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        const mainItems = ingredients.slice(0, 2).map(item => {
          const name = item.name || item.item_name || '';
          return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        });
        return mainItems.join(' & ');
      }
    } catch (error) {
      console.error('Error parsing ingredients:', error);
    }
    
    return 'Home-cooked Meal';
  };

  // Parse ingredients safely
  const getIngredients = () => {
    try {
      const ingredients = typeof meal.ingredients_logged === 'string' 
        ? JSON.parse(meal.ingredients_logged) 
        : meal.ingredients_logged;
      
      return Array.isArray(ingredients) ? ingredients : [];
    } catch (error) {
      console.error('Error parsing ingredients:', error);
      return [];
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get meal type icon
  const getMealTypeIcon = () => {
    switch(meal.meal_type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍿';
      default:
        return '🍴';
    }
  };

  // Calculate total calories
  const getTotalCalories = () => {
    const ingredients = getIngredients();

    // For dine-out meals, check if we have calorie information stored
    if (meal.is_dine_out && ingredients.length === 1 && ingredients[0].name === 'Total Calories') {
      return `~${ingredients[0].calories} calories`;
    }

    const total = ingredients.reduce((sum, item) => {
      return sum + (item.calories || 0);
    }, 0);
    return total > 0 ? `~${total} calories` : null;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const modalContent = (
    <div className="meal-modal-overlay" onClick={onClose}>
      <div className="meal-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="meal-modal__close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="meal-modal__image-container">
          {meal.meal_photo_url && !imageError ? (
            <>
              {imageLoading && (
                <div className="meal-modal__image-skeleton" />
              )}
              <img
                src={meal.meal_photo_url}
                alt={getMealName()}
                className={`meal-modal__image ${imageLoading ? 'meal-modal__image--loading' : ''}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </>
          ) : (
            <div className="meal-modal__no-photo">
              <div className="meal-modal__no-photo-icon">📷</div>
              <p className="meal-modal__no-photo-text">No photo available</p>
            </div>
          )}
        </div>
        
        <div className="meal-modal__content">
          <div className="meal-modal__header">
            <h2 className="meal-modal__title">
              {getMealName()}
            </h2>
            <div className="meal-modal__meta">
              <span className={`meal-modal__type meal-modal__type--${meal.meal_type}`}>
                {meal.meal_type}
              </span>
              {meal.is_dine_out && (
                <span className="meal-modal__dine-out-badge">Dine Out</span>
              )}
              {getTotalCalories() && (
                <span className="meal-modal__calories">{getTotalCalories()}</span>
              )}
            </div>
            <p className="meal-modal__date">{formatDateTime(meal.logged_at)}</p>
          </div>

          {!meal.is_dine_out && (
            <div className="meal-modal__ingredients-section">
              <h3 className="meal-modal__section-title">Ingredients</h3>
              {getIngredients().length > 0 ? (
                <ul className="meal-modal__ingredients-list">
                  {getIngredients().map((ingredient, index) => (
                    <li key={index} className="meal-modal__ingredient">
                      <span className="meal-modal__ingredient-name">
                        {ingredient.name || ingredient.item_name || 'Unknown'}
                      </span>
                      <span className="meal-modal__ingredient-quantity">
                        {ingredient.quantity} {ingredient.unit}
                        {ingredient.calories && (
                          <span className="meal-modal__ingredient-calories">
                            ({ingredient.calories} cal)
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="meal-modal__no-ingredients">No ingredients recorded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal using portal
  return ReactDOM.createPortal(modalContent, document.body);
};

export default MealDetailModal;