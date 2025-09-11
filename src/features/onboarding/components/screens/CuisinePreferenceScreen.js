import React from 'react';
import './ScreenStyles.css';

const CuisinePreferenceScreen = ({ data, updateData, onNext, onBack }) => {
  const cuisineOptions = [
    { id: 'italian', label: 'Italian', icon: '🇮🇹' },
    { id: 'mexican', label: 'Mexican', icon: '🇲🇽' },
    { id: 'chinese', label: 'Chinese', icon: '🇨🇳' },
    { id: 'indian', label: 'Indian', icon: '🇮🇳' },
    { id: 'japanese', label: 'Japanese', icon: '🇯🇵' },
    { id: 'thai', label: 'Thai', icon: '🇹🇭' },
    { id: 'mediterranean', label: 'Mediterranean', icon: '🇬🇷' },
    { id: 'american', label: 'American', icon: '🇺🇸' },
    { id: 'french', label: 'French', icon: '🇫🇷' },
    { id: 'korean', label: 'Korean', icon: '🇰🇷' },
    { id: 'spanish', label: 'Spanish', icon: '🇪🇸' },
    { id: 'british', label: 'British', icon: '🇬🇧' }
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
        
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            Favorite Cuisines (Select multiple)
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              width: '100%',
              maxWidth: '400px'
            }}>
              {cuisineOptions.map((option) => (
                <div
                  key={option.id}
                  className={`cuisine-card ${data.preferredCuisines?.includes(option.id) ? 'cuisine-card--selected' : ''}`}
                  onClick={() => toggleCuisine(option.id)}
                  style={{ justifySelf: 'stretch' }}
                >
                  <div className="cuisine-card__icon">{option.icon}</div>
                  <div className="cuisine-card__label">{option.label}</div>
                </div>
              ))}
            </div>
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

export default CuisinePreferenceScreen;