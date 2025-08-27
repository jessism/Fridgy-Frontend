import React, { useState } from 'react';
import { EditIcon, DeleteIcon } from '../icons';
import './MealCard.css';

const MealCard = ({ meal, onClick, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Extract meal name from data
  const getMealName = () => {
    // Priority 1: Use meal_name if available
    if (meal.meal_name) {
      return meal.meal_name;
    }
    
    // Priority 2: Try to extract from ingredients
    try {
      const ingredients = typeof meal.ingredients_logged === 'string' 
        ? JSON.parse(meal.ingredients_logged) 
        : meal.ingredients_logged;
      
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        // Take first two main ingredients
        const mainItems = ingredients.slice(0, 2).map(item => {
          const name = item.name || item.item_name || '';
          // Capitalize first letter of each word
          return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        });
        return mainItems.join(' & ');
      }
    } catch (error) {
      console.error('Error parsing ingredients:', error);
    }
    
    // Fallback
    return 'Home-cooked Meal';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate total calories
  const getTotalCalories = () => {
    try {
      const ingredients = typeof meal.ingredients_logged === 'string' 
        ? JSON.parse(meal.ingredients_logged) 
        : meal.ingredients_logged;
      
      if (Array.isArray(ingredients)) {
        const total = ingredients.reduce((sum, item) => {
          return sum + (item.calories || 0);
        }, 0);
        return total > 0 ? `~${total} calories` : null;
      }
    } catch (error) {
      console.error('Error calculating calories:', error);
    }
    return null;
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Handle menu dots click
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Handle edit click
  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    onEdit(meal);
  };

  // Handle delete click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    onDelete(meal);
  };

  // Close dropdown when clicking outside
  const handleOverlayClick = () => {
    setShowDropdown(false);
  };

  return (
    <div className="meal-card" onClick={() => onClick(meal)}>
      <div className="meal-card__image-container">
        {imageLoading && (
          <div className="meal-card__image-skeleton" />
        )}
        <img
          src={imageError ? '/assets/images/default-meal.svg' : (meal.meal_photo_url || '/assets/images/default-meal.svg')}
          alt={getMealName()}
          className={`meal-card__image ${imageLoading ? 'meal-card__image--loading' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      </div>
      
      <div className="meal-card__info">
        <h4 className="meal-card__name">{getMealName()}</h4>
        <div className="meal-card__bottom">
          {getTotalCalories() && (
            <span className="meal-card__calories">{getTotalCalories()}</span>
          )}
          <div className="meal-card__menu">
            <button 
              className="meal-card__menu-dots" 
              onClick={handleMenuClick}
              aria-label="Meal options"
            >
              •••
            </button>
            
            {/* Dropdown menu */}
            {showDropdown && (
              <>
                <div className="meal-card__dropdown-overlay" onClick={handleOverlayClick}></div>
                <div className="meal-card__dropdown-menu">
                  <button 
                    className="meal-card__dropdown-option"
                    onClick={handleEditClick}
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                  <button 
                    className="meal-card__dropdown-option"
                    onClick={handleDeleteClick}
                  >
                    <DeleteIcon />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;