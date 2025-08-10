import React, { useState, useEffect } from 'react';
import AIRecipeCard from './AIRecipeCard';
import AIRecipeQuestionnaire from './AIRecipeQuestionnaire';
import useAIRecipes from '../hooks/useAIRecipes';
import './AIRecipeSection.css';

const AIRecipeSection = () => {
  const {
    recipes,
    hasRecipes,
    loading,
    error,
    generationStatus,
    loadRecipes,
    regenerateRecipes,
    clearError
  } = useAIRecipes();

  const [showError, setShowError] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Show error state
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleStartQuestionnaire = () => {
    setShowQuestionnaire(true);
    clearError();
    setShowError(false);
  };

  const handleQuestionnaireSubmit = async (questionnaireData) => {
    try {
      clearError();
      setShowError(false);
      setShowQuestionnaire(false); // Hide questionnaire during loading
      await loadRecipes(false, questionnaireData);
    } catch (err) {
      console.error('Failed to generate recipes:', err);
      setShowQuestionnaire(true); // Show questionnaire again on error
    }
  };

  const handleRegenerateRecipes = async () => {
    try {
      clearError();
      setShowError(false);
      setShowQuestionnaire(true); // Show questionnaire for regeneration too
    } catch (err) {
      console.error('Failed to regenerate recipes:', err);
    }
  };

  const handleDismissError = () => {
    setShowError(false);
    clearError();
  };

  // Get status message for different states
  const getStatusMessage = () => {
    switch (generationStatus) {
      case 'generating':
        return {
          title: 'Creating Your Personalized Recipes',
          message: 'Our AI is analyzing your fridge inventory and preferences to create delicious recipes just for you...',
          icon: '🤖'
        };
      case 'failed':
        return {
          title: 'Recipe Generation Failed',
          message: 'We encountered an issue generating your recipes. Please try again.',
          icon: '😔'
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <section className="ai-recipe-section">
      {/* Section Header */}
      <div className="section-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="title-icon">🤖</span>
            Recommended by AI
          </h2>
          <p className="section-description">
            Personalized recipes based on your fridge inventory and dietary preferences
          </p>
        </div>

        {hasRecipes && (
          <button 
            className="btn-regenerate"
            onClick={handleRegenerateRecipes}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            New Recipes
          </button>
        )}
      </div>

      {/* Error Message */}
      {showError && error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <strong>Oops!</strong> {error}
            </div>
            <button className="error-dismiss" onClick={handleDismissError}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="section-content">
        {!hasRecipes && !loading && !showQuestionnaire && (
          /* Initial State - Start Questionnaire Button */
          <div className="initial-state">
            <div className="initial-content">
              <div className="initial-icon">🍽️</div>
              <h3 className="initial-title">Get AI-Powered Recipe Suggestions</h3>
              <p className="initial-description">
                Let our AI create personalized recipes using the ingredients you already have in your fridge. 
                We'll consider your dietary preferences and suggest delicious meals you can make right now!
              </p>
              
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">🥘</span>
                  <span>Uses your current inventory</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌱</span>
                  <span>Respects dietary preferences</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📸</span>
                  <span>Beautiful food photography</span>
                </div>
              </div>

              <button 
                className="btn-generate-primary"
                onClick={handleStartQuestionnaire}
                disabled={loading}
              >
                <span className="btn-icon">✨</span>
                Start generating recipes
              </button>
            </div>
          </div>
        )}

        {showQuestionnaire && !loading && (
          /* Questionnaire Form */
          <AIRecipeQuestionnaire 
            onSubmit={handleQuestionnaireSubmit}
            loading={loading}
          />
        )}

        {loading && statusMessage && (
          /* Loading State */
          <div className="loading-state">
            <div className="loading-content">
              <div className="loading-animation">
                <div className="loading-spinner"></div>
                <span className="loading-icon">{statusMessage.icon}</span>
              </div>
              <h3 className="loading-title">{statusMessage.title}</h3>
              <p className="loading-message">{statusMessage.message}</p>
              
              {/* Loading Steps */}
              <div className="loading-steps">
                <div className="step active">
                  <span className="step-icon">📦</span>
                  <span>Analyzing inventory</span>
                </div>
                <div className="step active">
                  <span className="step-icon">🍽️</span>
                  <span>Checking preferences</span>
                </div>
                <div className="step active">
                  <span className="step-icon">🤖</span>
                  <span>Generating recipes</span>
                </div>
                <div className="step">
                  <span className="step-icon">📸</span>
                  <span>Creating images</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasRecipes && !loading && (
          /* Recipe Cards */
          <div className="recipes-container">
            <div className="recipes-grid">
              {recipes.map((recipe, index) => (
                <AIRecipeCard 
                  key={recipe.id || index} 
                  recipe={recipe} 
                  index={index}
                />
              ))}
            </div>

            {/* Generation Info */}
            <div className="generation-info">
              <div className="info-content">
                <span className="info-icon">💡</span>
                <span className="info-text">
                  Recipes personalized for your inventory and preferences. 
                  <button className="info-link" onClick={handleRegenerateRecipes}>
                    Generate different ones?
                  </button>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIRecipeSection;