import React from 'react';
import './ScreenStyles.css';

const CookingTimePreferenceScreen = ({ data, updateData, onNext, onBack }) => {
  const cookingTimeOptions = [
    { id: 'under_15', label: 'Under 15 min', description: 'Quick & easy meals' },
    { id: '15_30', label: '15-30 min', description: 'Balanced cooking time' },
    { id: '30_60', label: '30-60 min', description: 'More elaborate dishes' },
    { id: 'over_60', label: '60+ min', description: 'Complex recipes' }
  ];

  const selectCookingTime = (id) => {
    updateData({ cookingTimePreference: id });
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          How much time do you like to spend cooking?
        </h1>
        
        <p className="onboarding-screen__subtitle">
          We'll suggest recipes that fit your schedule
        </p>
        
        <div style={{ textAlign: 'left', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            Preferred Cooking Time
          </h3>
          <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {cookingTimeOptions.map((option) => (
              <div
                key={option.id}
                className={`selection-card ${data.cookingTimePreference === option.id ? 'selection-card--selected' : ''}`}
                onClick={() => selectCookingTime(option.id)}
                style={{ padding: '16px' }}
              >
                <div className="selection-card__label" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{option.label}</div>
                <div className="selection-card__description" style={{ fontSize: '12px', color: '#666' }}>{option.description}</div>
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
        </div>
      </div>
    </div>
  );
};

export default CookingTimePreferenceScreen;