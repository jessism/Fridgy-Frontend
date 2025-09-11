import React from 'react';
import './ScreenStyles.css';

const AllergiesScreen = ({ data, updateData, onNext, onBack, onSkip }) => {
  const allergyOptions = [
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'tree-nuts', label: 'Tree Nuts' },
    { id: 'milk', label: 'Milk' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'wheat', label: 'Wheat' },
    { id: 'soy', label: 'Soy' },
    { id: 'fish', label: 'Fish' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'sesame', label: 'Sesame' }
  ];

  const toggleAllergy = (id) => {
    const current = data.allergies || [];
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    updateData({ allergies: updated });
  };

  const handleCustomAllergiesChange = (e) => {
    updateData({ customAllergies: e.target.value });
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          Any allergies we should know about?
        </h1>
        
        <p className="onboarding-screen__subtitle">
          We'll keep your recipes safe and allergen-free
        </p>
        
        <div className="pill-group">
          {allergyOptions.map((option) => (
            <div
              key={option.id}
              className={`pill-item ${data.allergies?.includes(option.id) ? 'pill-item--selected' : ''}`}
              onClick={() => toggleAllergy(option.id)}
            >
              {option.label}
            </div>
          ))}
        </div>
        
        <div className="input-group">
          <input
            type="text"
            className="input-group__input"
            placeholder="Other allergies (comma-separated)"
            value={data.customAllergies || ''}
            onChange={handleCustomAllergiesChange}
          />
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

export default AllergiesScreen;