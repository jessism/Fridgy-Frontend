import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserPreferences from '../hooks/useUserPreferences';
import './DietaryPreferencesPage.css';

const DietaryPreferencesPage = () => {
  const navigate = useNavigate();
  const {
    preferences,
    loading,
    saving,
    error,
    updatePreference,
    togglePreference,
    clearError
  } = useUserPreferences();

  const [expandedSections, setExpandedSections] = useState({
    dietary_restrictions: false,
    allergies: false,
    cuisines: false,
    cooking_time: false
  });

  const handleBack = () => {
    navigate('/profile');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Preference options (same as ProfilePage)
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'nut-free', label: 'Nut-Free' },
    { id: 'egg-free', label: 'Egg-Free' }
  ];

  const allergyOptions = [
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'soy', label: 'Soy' },
    { id: 'sesame', label: 'Sesame' },
    { id: 'wheat', label: 'Wheat' },
    { id: 'tree-nuts', label: 'Tree Nuts' }
  ];

  const cuisineOptions = [
    { id: 'italian', label: 'Italian' },
    { id: 'chinese', label: 'Chinese' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'mediterranean', label: 'Mediterranean' },
    { id: 'indian', label: 'Indian' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'thai', label: 'Thai' },
    { id: 'american', label: 'American' },
    { id: 'middle-eastern', label: 'Middle Eastern' }
  ];

  const cookingTimeOptions = [
    { id: 'under_15', label: 'Under 15 minutes' },
    { id: '15_30', label: '15–30 minutes' },
    { id: '30_60', label: '30–60 minutes' },
    { id: 'over_60', label: '1+ hour' }
  ];

  const handleCustomAllergyChange = (e) => {
    updatePreference('custom_allergies', e.target.value);
  };

  if (loading) {
    return (
      <div className="dietary-preferences">
        <div className="dietary-preferences__header">
          <button className="dietary-preferences__back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="dietary-preferences__title">Your dietary preferences</h1>
        </div>
        <div className="dietary-preferences__loading">
          <div className="dietary-preferences__spinner"></div>
          <p>Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dietary-preferences">
      {/* Header */}
      <div className="dietary-preferences__header">
        <button className="dietary-preferences__back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="dietary-preferences__title">Your dietary preferences</h1>
      </div>

      {/* Content */}
      <div className="dietary-preferences__content">
        {/* Saving Indicator */}
        {saving && (
          <div className="dietary-preferences__saving">
            💾 Saving preferences...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="dietary-preferences__error">
            <span>{error}</span>
            <button onClick={clearError} className="dietary-preferences__error-dismiss">×</button>
          </div>
        )}

        {/* Dietary Restrictions */}
        <div className="dietary-preferences__section">
          <div 
            className="dietary-preferences__section-header"
            onClick={() => toggleSection('dietary_restrictions')}
          >
            <h2 className="dietary-preferences__section-title">Dietary Restrictions</h2>
            <span className={`dietary-preferences__arrow ${expandedSections.dietary_restrictions ? 'expanded' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          {expandedSections.dietary_restrictions && (
            <div className="dietary-preferences__section-content">
              <p className="dietary-preferences__section-description">Select all that apply to you</p>
              <div className="dietary-preferences__options-list">
                {dietaryOptions.map(option => (
                  <label key={option.id} className="dietary-preferences__checkbox-item">
                    <input
                      type="checkbox"
                      checked={preferences.dietary_restrictions.includes(option.id)}
                      onChange={() => togglePreference('dietary_restrictions', option.id)}
                      className="dietary-preferences__checkbox"
                    />
                    <span className="dietary-preferences__checkbox-label">{option.label}</span>
                    <span className="dietary-preferences__checkmark"></span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="dietary-preferences__section">
          <div 
            className="dietary-preferences__section-header"
            onClick={() => toggleSection('allergies')}
          >
            <h2 className="dietary-preferences__section-title">Allergies</h2>
            <span className={`dietary-preferences__arrow ${expandedSections.allergies ? 'expanded' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          {expandedSections.allergies && (
            <div className="dietary-preferences__section-content">
              <p className="dietary-preferences__section-description">Select common allergies or add your own</p>
              <div className="dietary-preferences__options-list">
                {allergyOptions.map(option => (
                  <label key={option.id} className="dietary-preferences__checkbox-item">
                    <input
                      type="checkbox"
                      checked={preferences.allergies.includes(option.id)}
                      onChange={() => togglePreference('allergies', option.id)}
                      className="dietary-preferences__checkbox"
                    />
                    <span className="dietary-preferences__checkbox-label">{option.label}</span>
                    <span className="dietary-preferences__checkmark"></span>
                  </label>
                ))}
              </div>
              <div className="dietary-preferences__custom-input">
                <label htmlFor="custom-allergies" className="dietary-preferences__input-label">
                  Other allergies (optional)
                </label>
                <textarea
                  id="custom-allergies"
                  value={preferences.custom_allergies}
                  onChange={handleCustomAllergyChange}
                  placeholder="List any other allergies not mentioned above..."
                  className="dietary-preferences__textarea"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cuisine Preferences */}
        <div className="dietary-preferences__section">
          <div 
            className="dietary-preferences__section-header"
            onClick={() => toggleSection('cuisines')}
          >
            <h2 className="dietary-preferences__section-title">Favorite Cuisines</h2>
            <span className={`dietary-preferences__arrow ${expandedSections.cuisines ? 'expanded' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          {expandedSections.cuisines && (
            <div className="dietary-preferences__section-content">
              <p className="dietary-preferences__section-description">Choose your favorite types of cuisine</p>
              <div className="dietary-preferences__options-list">
                {cuisineOptions.map(option => (
                  <label key={option.id} className="dietary-preferences__checkbox-item">
                    <input
                      type="checkbox"
                      checked={preferences.preferred_cuisines.includes(option.id)}
                      onChange={() => togglePreference('preferred_cuisines', option.id)}
                      className="dietary-preferences__checkbox"
                    />
                    <span className="dietary-preferences__checkbox-label">{option.label}</span>
                    <span className="dietary-preferences__checkmark"></span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cooking Time */}
        <div className="dietary-preferences__section">
          <div 
            className="dietary-preferences__section-header"
            onClick={() => toggleSection('cooking_time')}
          >
            <h2 className="dietary-preferences__section-title">Cooking Time Preference</h2>
            <span className={`dietary-preferences__arrow ${expandedSections.cooking_time ? 'expanded' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          {expandedSections.cooking_time && (
            <div className="dietary-preferences__section-content">
              <p className="dietary-preferences__section-description">Choose your typical cooking time</p>
              <div className="dietary-preferences__options-list">
                {cookingTimeOptions.map(option => (
                  <label key={option.id} className="dietary-preferences__radio-item">
                    <input
                      type="radio"
                      name="cooking_time_preference"
                      value={option.id}
                      checked={preferences.cooking_time_preference === option.id}
                      onChange={() => updatePreference('cooking_time_preference', option.id)}
                      className="dietary-preferences__radio"
                    />
                    <span className="dietary-preferences__radio-label">{option.label}</span>
                    <span className="dietary-preferences__radio-mark"></span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietaryPreferencesPage;