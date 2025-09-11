import React from 'react';
import './ScreenStyles.css';

const FoodPreferencesScreen = ({ data, updateData, onNext, onBack, onSkip }) => {
  const cuisineOptions = [
    { id: 'italian', label: 'Italian', icon: '🇮🇹' },
    { id: 'mexican', label: 'Mexican', icon: '🇲🇽' },
    { id: 'chinese', label: 'Chinese', icon: '🇨🇳' },
    { id: 'indian', label: 'Indian', icon: '🇮🇳' },
    { id: 'japanese', label: 'Japanese', icon: '🇯🇵' },
    { id: 'thai', label: 'Thai', icon: '🇹🇭' },
    { id: 'mediterranean', label: 'Mediterranean', icon: '🇬🇷' },
    { id: 'american', label: 'American', icon: '🇺🇸' },
    { id: 'french', label: 'French', icon: '🇫🇷' }
  ];

  const cookingTimeOptions = [
    { id: 'under_15', label: 'Under 15 min', icon: '⚡' },
    { id: '15_30', label: '15-30 min', icon: '⏱️' },
    { id: '30_60', label: '30-60 min', icon: '⏰' },
    { id: 'over_60', label: '60+ min', icon: '🍳' }
  ];

  const toggleCuisine = (id) => {
    const current = data.preferredCuisines || [];
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    updateData({ preferredCuisines: updated });
  };

  const selectCookingTime = (id) => {
    updateData({ cookingTimePreference: id });
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          What are your food preferences?
        </h1>
        
        <p className="onboarding-screen__subtitle">
          Let's personalize your meal suggestions
        </p>
        
        <div style={{ textAlign: 'left', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            Favorite Cuisines (Select multiple)
          </h3>
          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {cuisineOptions.map((option) => (
              <div
                key={option.id}
                className={`selection-card ${data.preferredCuisines?.includes(option.id) ? 'selection-card--selected' : ''}`}
                onClick={() => toggleCuisine(option.id)}
                style={{ padding: '12px' }}
              >
                <div className="selection-card__icon" style={{ fontSize: '24px' }}>{option.icon}</div>
                <div className="selection-card__label" style={{ fontSize: '13px' }}>{option.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ textAlign: 'left', marginTop: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            Preferred Cooking Time
          </h3>
          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {cookingTimeOptions.map((option) => (
              <div
                key={option.id}
                className={`selection-card ${data.cookingTimePreference === option.id ? 'selection-card--selected' : ''}`}
                onClick={() => selectCookingTime(option.id)}
              >
                <div className="selection-card__icon" style={{ fontSize: '24px' }}>{option.icon}</div>
                <div className="selection-card__label" style={{ fontSize: '14px' }}>{option.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="onboarding-screen__actions">
          <button 
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            onClick={onNext}
          >
            Continue
          </button>
          <button 
            className="onboarding-btn onboarding-btn--ghost"
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodPreferencesScreen;