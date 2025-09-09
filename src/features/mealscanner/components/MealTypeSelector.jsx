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
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="breakfast-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD93D" />
              <stop offset="100%" stopColor="#FF9F1C" />
            </linearGradient>
          </defs>
          {/* Sun rising icon with gradient */}
          <circle cx="12" cy="12" r="5" stroke="url(#breakfast-gradient)" strokeWidth="2"/>
          <line x1="12" y1="1" x2="12" y2="3" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="21" x2="12" y2="23" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="1" y1="12" x2="3" y2="12" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="21" y1="12" x2="23" y2="12" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="url(#breakfast-gradient)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: '#FFA500'
    },
    {
      type: 'lunch',
      label: 'Lunch',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="lunch-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6FE871" />
              <stop offset="100%" stopColor="#3FBA63" />
            </linearGradient>
          </defs>
          {/* Simple sun icon for midday with gradient */}
          <circle cx="12" cy="12" r="4" stroke="url(#lunch-gradient)" strokeWidth="2"/>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" 
                stroke="url(#lunch-gradient)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: '#4FCF61'
    },
    {
      type: 'dinner',
      label: 'Dinner',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="dinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9B72FF" />
              <stop offset="100%" stopColor="#6B46C1" />
            </linearGradient>
          </defs>
          {/* Moon icon for evening with gradient */}
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                stroke="url(#dinner-gradient)" strokeWidth="2" fill="none"/>
        </svg>
      ),
      color: '#6B46C1'
    },
    {
      type: 'snack',
      label: 'Snack',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="snack-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#EE5252" />
            </linearGradient>
          </defs>
          {/* Apple icon for snack with gradient */}
          <path d="M12 20.94c1.5 0 2.75-1.06 4-1.06 3 0 5-3.88 5-6.88 0-3.31-2.69-6-6-6-1.66 0-2.84.38-4 1.06C9.84 7.38 8.66 7 7 7c-3.31 0-6 2.69-6 6 0 3 2 6.88 5 6.88 1.25 0 2.5 1.06 4 1.06z" 
                stroke="url(#snack-gradient)" strokeWidth="2"/>
          <path d="M12 7c0-2-1-4-1-4s-1 2-1 4" 
                stroke="url(#snack-gradient)" strokeWidth="2" strokeLinecap="round"/>
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