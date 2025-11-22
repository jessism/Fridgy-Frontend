import React, { useEffect } from 'react';
import { trackOnboardingStepViewed } from '../../../../utils/onboardingTracking';
import './ScreenStyles.css';

const DietaryRestrictionsScreen = ({ data, updateData, onNext, onBack, onSkip }) => {
  useEffect(() => {
    trackOnboardingStepViewed(5);
  }, []);
  const dietaryOptions = [
    { id: 'none', label: 'None' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'keto', label: 'Keto' },
    { id: 'paleo', label: 'Paleo' }
  ];

  const toggleDietaryRestriction = (id) => {
    const current = data.dietaryRestrictions || [];
    
    if (id === 'none') {
      // If "None" is selected, clear all other selections
      const updated = current.includes('none') ? [] : ['none'];
      updateData({ dietaryRestrictions: updated });
    } else {
      // If any other option is selected, remove "None" and toggle the option
      const withoutNone = current.filter(item => item !== 'none');
      const updated = withoutNone.includes(id)
        ? withoutNone.filter(item => item !== id)
        : [...withoutNone, id];
      updateData({ dietaryRestrictions: updated });
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          Any dietary restrictions?
        </h1>
        
        <p className="onboarding-screen__subtitle">
          We'll make sure your recipes are suitable for you
        </p>
        
        <div className="checkbox-group">
          {dietaryOptions.map((option) => (
            <div
              key={option.id}
              className={`checkbox-item checkbox-item--no-input ${data.dietaryRestrictions?.includes(option.id) ? 'checkbox-item--selected' : ''}`}
              onClick={() => toggleDietaryRestriction(option.id)}
            >
              <label className="checkbox-item__label">
                {option.label}
              </label>
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

export default DietaryRestrictionsScreen;