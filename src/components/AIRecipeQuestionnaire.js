import React, { useState } from 'react';
import './AIRecipeQuestionnaire.css';

const AIRecipeQuestionnaire = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    meal_type: '',
    cooking_time: '',
    vibe: '',
    cuisine_preference: '',
    dietary_considerations: [],
    additional_notes: ''
  });

  const [errors, setErrors] = useState({});

  // Question data with options
  const questions = {
    meal_type: {
      title: "What are you cooking?",
      icon: "🍽️",
      required: true,
      options: [
        { value: 'breakfast', label: 'Breakfast', icon: '🥞' },
        { value: 'lunch', label: 'Lunch', icon: '🥗' },
        { value: 'dinner', label: 'Dinner', icon: '🍽️' },
        { value: 'snack', label: 'Snack', icon: '🍎' }
      ]
    },
    cooking_time: {
      title: "How much time do you have?",
      icon: "⏰",
      required: true,
      options: [
        { value: '15_minutes', label: '15 min', icon: '⚡' },
        { value: '30_minutes', label: '30 min', icon: '⏱️' },
        { value: '45_minutes', label: '45 min', icon: '⏰' },
        { value: '60_minutes', label: '1 hour', icon: '🕐' },
        { value: '90_plus_minutes', label: '90+ min', icon: '⏳' }
      ]
    },
    vibe: {
      title: "What's the vibe?",
      icon: "✨",
      required: true,
      options: [
        { value: 'healthy', label: 'Healthy', icon: '🥬' },
        { value: 'light', label: 'Light', icon: '🍃' },
        { value: 'comfort_food', label: 'Comfort Food', icon: '🧈' },
        { value: 'quick_easy', label: 'Quick & Easy', icon: '⚡' },
        { value: 'fancy', label: 'Fancy', icon: '✨' }
      ]
    },
    cuisine_preference: {
      title: "Any cuisine preference?",
      icon: "🌍",
      required: false,
      options: [
        { value: 'any', label: 'Any', icon: '🌍' },
        { value: 'italian', label: 'Italian', icon: '🍝' },
        { value: 'asian', label: 'Asian', icon: '🥢' },
        { value: 'mexican', label: 'Mexican', icon: '🌮' },
        { value: 'american', label: 'American', icon: '🍔' },
        { value: 'mediterranean', label: 'Mediterranean', icon: '🫒' }
      ]
    },
    dietary_considerations: {
      title: "Any special considerations?",
      icon: "🌱",
      required: false,
      multiple: true,
      options: [
        { value: 'low_carb', label: 'Low Carb', icon: '🥩' },
        { value: 'high_protein', label: 'High Protein', icon: '💪' },
        { value: 'low_calorie', label: 'Low Calorie', icon: '📉' },
        { value: 'kid_friendly', label: 'Kid Friendly', icon: '👶' },
        { value: 'one_pot', label: 'One Pot', icon: '🍲' },
        { value: 'meal_prep', label: 'Meal Prep', icon: '📦' }
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

  const renderQuestion = (key, question) => {
    const isMultiple = question.multiple;
    const currentValue = formData[key];
    const hasError = errors[key];

    return (
      <div key={key} className={`question-group ${hasError ? 'has-error' : ''}`}>
        <div className="question-header">
          <h3 className="question-title">
            <span className="question-icon">{question.icon}</span>
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
                <span className="chip-icon">{option.icon}</span>
                <span className="chip-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const isFormValid = () => {
    return Object.entries(questions)
      .filter(([_, question]) => question.required)
      .every(([key, _]) => formData[key]);
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <div className="questionnaire-icon">🤖</div>
        <h2 className="questionnaire-title">Let's personalize your recipes!</h2>
        <p className="questionnaire-subtitle">
          Answer a few quick questions to get AI recommendations tailored just for you
        </p>
      </div>

      <div className="questionnaire-form">
        {Object.entries(questions).map(([key, question]) => 
          renderQuestion(key, question)
        )}

        <div className="question-group">
          <div className="question-header">
            <h3 className="question-title">
              <span className="question-icon">💭</span>
              Tell Fridgy anything else
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
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                <span>Generating recipes...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">✨</span>
                <span>Generate my recipes</span>
              </>
            )}
          </button>
          
          <p className="generation-note">
            This will generate 3 personalized recipes with beautiful photos
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIRecipeQuestionnaire;