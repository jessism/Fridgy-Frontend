import React from 'react';
import '../styles/MealTypeSelector.css';

const MealTypeSelector = ({ isOpen, onClose, onSelectMealType }) => {
  console.log('🍽️ MealTypeSelector rendered with isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('🍽️ MealTypeSelector not rendering - isOpen is false');
    return null;
  }
  
  console.log('🍽️ MealTypeSelector is rendering the modal!');

  const mealTypes = [
    {
      type: 'breakfast',
      label: 'Breakfast',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
      ),
      color: '#FFA500'
    },
    {
      type: 'lunch',
      label: 'Lunch',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 3v9l6 3"/>
        </svg>
      ),
      color: '#4FCF61'
    },
    {
      type: 'dinner',
      label: 'Dinner',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v12"/>
          <path d="M8 18l4-6 4 6"/>
        </svg>
      ),
      color: '#6B46C1'
    },
    {
      type: 'snack',
      label: 'Snack',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M9 9h6v6H9z"/>
        </svg>
      ),
      color: '#EF4444'
    }
  ];

  const handleSelectMealType = (mealType) => {
    console.log('🍽️ MealTypeSelector: Selected meal type:', mealType);
    onSelectMealType(mealType);
    onClose();
  };

  return (
    <>
      <div className="meal-type-overlay" onClick={onClose}>
        <div className="meal-type-content" onClick={(e) => e.stopPropagation()}>
          <div className="meal-type-header">
            <div className="meal-type-handle"></div>
          </div>
          
          <h2 className="meal-type-title">Log meal to:</h2>
          
          <div className="meal-type-options">
            {mealTypes.map((meal) => (
              <button
                key={meal.type}
                className="meal-type-option"
                onClick={() => handleSelectMealType(meal.type)}
                style={{ '--meal-color': meal.color }}
              >
                <div className="meal-type-icon" style={{ color: meal.color }}>
                  {meal.icon}
                </div>
                <span className="meal-type-label">{meal.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MealTypeSelector;