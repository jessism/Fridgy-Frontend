import React, { useState, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import TrackabideLogo from '../../../assets/images/Trackabite-logo.png';
import './AIRecipeQuestionnaire.css';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const AIRecipeQuestionnaire = ({ onSubmit, onBackToMeals, loading = false }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7; // Reduced from 8 after removing cuisine preference

  const [formData, setFormData] = useState({
    meal_type: '',
    serving_size: 1,
    cooking_time: '',
    vibe: '',
    cuisine_preference: '',
    dietary_considerations: [],
    additional_notes: ''
  });

  const [errors, setErrors] = useState({});
  
  // Serving size validation state
  const [servingWarning, setServingWarning] = useState(null);
  const [checkingServings, setCheckingServings] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Get token for API requests
  const getToken = () => {
    return localStorage.getItem('fridgy_token');
  };

  // Check serving size support against inventory
  const checkServingSizeSupport = async (servings) => {
    if (!user) return { realistic: true, maxRealisticServings: servings };

    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/inventory/validate-servings?servings=${servings}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.error('Serving validation error:', data.error);
        return { realistic: true, maxRealisticServings: servings }; // Fail gracefully
      }
    } catch (error) {
      console.error('Error validating serving size:', error);
      return { realistic: true, maxRealisticServings: servings }; // Fail gracefully
    }
  };

  // Debounced validation function
  const validateServingSize = useCallback(
    debounce(async (servings) => {
      setCheckingServings(true);
      
      try {
        const validation = await checkServingSizeSupport(servings);
        
        if (validation.realistic) {
          setServingWarning(null);
        } else {
          setServingWarning({
            maxServings: validation.maxRealisticServings,
            message: `Your fridge may only support ${validation.maxRealisticServings} serving${validation.maxRealisticServings === 1 ? '' : 's'}`
          });
        }
      } catch (error) {
        console.error('Serving validation error:', error);
        setServingWarning(null); // Clear warning on error
      }
      
      setCheckingServings(false);
    }, 300),
    [user]
  );

  // Question data with options
  const questions = {
    meal_type: {
      title: "What are you cooking?",
      required: true,
      options: [
        { value: 'breakfast', label: 'Breakfast' },
        { value: 'lunch', label: 'Lunch' },
        { value: 'dinner', label: 'Dinner' },
        { value: 'snack', label: 'Snack' }
      ]
    },
    cooking_time: {
      title: "How much time do you have?",
      required: true,
      options: [
        { value: '15_minutes', label: '15 min' },
        { value: '30_minutes', label: '30 min' },
        { value: '45_minutes', label: '45 min' },
        { value: '60_plus_minutes', label: '1+ hour' }
      ]
    },
    vibe: {
      title: "What's the vibe?",
      required: true,
      options: [
        { value: 'healthy', label: 'Healthy' },
        { value: 'light', label: 'Light' },
        { value: 'comfort_food', label: 'Comfort Food' },
        { value: 'quick_easy', label: 'Quick & Easy' },
        { value: 'fancy', label: 'Fancy' }
      ]
    },
    cuisine_preference: {
      title: "Any cuisine preference?",
      required: false,
      options: [
        { value: 'any', label: 'Any' },
        { value: 'italian', label: 'Italian' },
        { value: 'asian', label: 'Asian' },
        { value: 'mexican', label: 'Mexican' },
        { value: 'american', label: 'American' },
        { value: 'mediterranean', label: 'Mediterranean' }
      ]
    },
    dietary_considerations: {
      title: "Any special considerations?",
      required: false,
      multiple: true,
      options: [
        { value: 'none', label: 'No special considerations' },
        { value: 'low_carb', label: 'Low Carb' },
        { value: 'high_protein', label: 'High Protein' },
        { value: 'low_calorie', label: 'Low Calorie' },
        { value: 'kid_friendly', label: 'Kid Friendly' },
        { value: 'one_pot', label: 'One Pot' },
        { value: 'meal_prep', label: 'Meal Prep' }
      ]
    }
  };

  const handleSingleSelect = (questionKey, value) => {
    setFormData(prev => ({ ...prev, [questionKey]: value }));
    // Clear error when user selects an option
    if (errors[questionKey]) {
      setErrors(prev => ({ ...prev, [questionKey]: null }));
    }
  };

  const handleMultiSelect = (questionKey, value) => {
    setFormData(prev => ({
      ...prev,
      [questionKey]: prev[questionKey].includes(value)
        ? prev[questionKey].filter(item => item !== value)
        : [...prev[questionKey], value]
    }));
  };

  const handleNotesChange = (e) => {
    setFormData(prev => ({ ...prev, additional_notes: e.target.value }));
  };

  const handleServingSizeChange = (increment) => {
    const newSize = Math.max(1, formData.serving_size + (increment ? 1 : -1));
    
    setFormData(prev => ({
      ...prev,
      serving_size: newSize
    }));
    
    // Validate if > 1 serving
    if (newSize > 1) {
      validateServingSize(newSize);
    } else {
      setServingWarning(null);
      setCheckingServings(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.entries(questions).forEach(([key, question]) => {
      if (question.required && !formData[key]) {
        newErrors[key] = `Please select ${question.title.toLowerCase()}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.question-error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const goToNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderQuestion = (key, question) => {
    const isMultiple = question.multiple;
    const currentValue = formData[key];
    const hasError = errors[key];

    return (
      <div key={key} className={`question-group ${hasError ? 'has-error' : ''}`}>
        <div className="question-header">
          <h3 className="question-title">
            {question.title}
            {question.required && <span className="required-indicator">*</span>}
          </h3>
          {hasError && (
            <div className="question-error">{hasError}</div>
          )}
        </div>
        
        <div className="chips-container">
          {question.options.map(option => {
            const isSelected = isMultiple 
              ? currentValue.includes(option.value)
              : currentValue === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`chip ${isSelected ? 'selected' : ''}`}
                onClick={() => isMultiple 
                  ? handleMultiSelect(key, option.value)
                  : handleSingleSelect(key, option.value)
                }
              >
                <span className="chip-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderServingSizeQuestion = () => {
    return (
      <div className="question-group">
        <div className="question-header">
          <h3 className="question-title">How many servings?</h3>
        </div>
        
        <div className="serving-size-container">
          <button 
            type="button"
            className="serving-btn minus-btn"
            onClick={() => handleServingSizeChange(false)}
            disabled={formData.serving_size <= 1}
          >
            -
          </button>
          
          <div className="serving-display">
            {formData.serving_size}
          </div>
          
          <button 
            type="button"
            className="serving-btn plus-btn"
            onClick={() => handleServingSizeChange(true)}
          >
            +
          </button>
        </div>
        
        {/* Real-time warning */}
        {servingWarning && (
          <div className="serving-warning">
            <span className="warning-icon">⚠️</span>
            <div className="warning-content">
              <span className="warning-text">{servingWarning.message}</span>
              <span className="warning-hint">Add more ingredients for larger portions!</span>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {checkingServings && (
          <div className="serving-checking">
            <span className="checking-spinner">⟳</span>
            <span>Checking inventory...</span>
          </div>
        )}
      </div>
    );
  };

  const isFormValid = () => {
    return Object.entries(questions)
      .filter(([_, question]) => question.required)
      .every(([key, _]) => formData[key]);
  };

  const renderProgressBar = () => {
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
      <div className="questionnaire-progress">
        <div className="questionnaire-progress__header">
          {currentStep > 1 && (
            <button
              className="questionnaire-progress__back-btn"
              onClick={goToPrevious}
              aria-label="Go back"
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className="questionnaire-progress__bar">
            <div
              className="questionnaire-progress__bar-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Welcome/Title page
        return (
          <div className="questionnaire-step questionnaire-step--welcome">
            {onBackToMeals && (
              <button
                className="questionnaire-back-to-meals"
                onClick={onBackToMeals}
                type="button"
                aria-label="Back to meals"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <div className="questionnaire-welcome-content">
              <div className="questionnaire-icon">
                <img src={TrackabideLogo} alt="Fridgy" className="questionnaire-logo" />
              </div>
              <h1 className="questionnaire-title">
                Personalize your recipes with AI
              </h1>
              <p className="questionnaire-subtitle">
                Answer a few questions to get recipes tailored to your fridge inventory and taste preferences
              </p>
              <div className="questionnaire-actions">
                <button
                  className="btn-continue btn-continue--large"
                  onClick={goToNext}
                  type="button"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        // What are you cooking?
        return (
          <div className="questionnaire-step">
            {renderQuestion('meal_type', questions.meal_type)}
            <div className="questionnaire-actions">
              <button
                className="btn-continue"
                onClick={goToNext}
                disabled={!formData.meal_type}
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        // How many servings?
        return (
          <div className="questionnaire-step">
            {renderServingSizeQuestion()}
            <div className="questionnaire-actions">
              <button
                className="btn-continue"
                onClick={goToNext}
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 4:
        // How much time do you have?
        return (
          <div className="questionnaire-step">
            {renderQuestion('cooking_time', questions.cooking_time)}
            <div className="questionnaire-actions">
              <button
                className="btn-continue"
                onClick={goToNext}
                disabled={!formData.cooking_time}
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 5:
        // What's the vibe?
        return (
          <div className="questionnaire-step">
            {renderQuestion('vibe', questions.vibe)}
            <div className="questionnaire-actions">
              <button
                className="btn-continue"
                onClick={goToNext}
                disabled={!formData.vibe}
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 6:
        // Any special considerations?
        return (
          <div className="questionnaire-step">
            {renderQuestion('dietary_considerations', questions.dietary_considerations)}
            <div className="questionnaire-actions">
              <button
                className="btn-continue"
                onClick={goToNext}
                type="button"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 7:
        // Tell Trackabite anything else
        return (
          <div className="questionnaire-step questionnaire-step--final">
            <div className="question-group">
              <div className="question-header">
                <h3 className="question-title">
                  Tell Trackabite anything else
                </h3>
                <p className="question-subtitle">
                  e.g. cravings, ingredients to use up, flavor notes...
                </p>
              </div>

              <textarea
                className="additional-notes"
                placeholder="I'm craving something creamy and comforting..."
                value={formData.additional_notes}
                onChange={handleNotesChange}
                rows={3}
              />
            </div>

            <div className="questionnaire-actions">
              <button
                className={`btn-generate-recipes ${!isFormValid() || loading ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!isFormValid() || loading}
                type="button"
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Generating recipes...</span>
                  </>
                ) : (
                  <>
                    <span>Generate my recipes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="questionnaire-container questionnaire-container--multi-step">
      {currentStep > 1 && renderProgressBar()}
      <div className="questionnaire-content">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default AIRecipeQuestionnaire;