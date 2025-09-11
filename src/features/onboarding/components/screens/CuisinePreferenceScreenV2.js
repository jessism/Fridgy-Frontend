import React from 'react';
import './ScreenStyles.css';

const CuisinePreferenceScreenV2 = ({ data, updateData, onNext, onBack }) => {
  const cuisineOptions = [
    { id: 'italian', label: 'Italian' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'chinese', label: 'Chinese' },
    { id: 'indian', label: 'Indian' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'thai', label: 'Thai' },
    { id: 'mediterranean', label: 'Mediterranean' },
    { id: 'american', label: 'American' },
    { id: 'french', label: 'French' },
    { id: 'korean', label: 'Korean' },
    { id: 'spanish', label: 'Spanish' },
    { id: 'british', label: 'British' }
  ];

  const toggleCuisine = (id) => {
    const current = data.preferredCuisines || [];
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    updateData({ preferredCuisines: updated });
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          What cuisines do you enjoy?
        </h1>
        
        <p className="onboarding-screen__subtitle">
          Select your favorite cuisines to get personalized meal suggestions
        </p>
        
        <div className="pill-group">
          {cuisineOptions.map((option) => (
            <div
              key={option.id}
              className={`pill-item ${data.preferredCuisines?.includes(option.id) ? 'pill-item--selected' : ''}`}
              onClick={() => toggleCuisine(option.id)}
            >
              {option.label}
            </div>
          ))}
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

export default CuisinePreferenceScreenV2;