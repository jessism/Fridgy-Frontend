import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../../../components/Navbar';
import MobileBottomNav from '../../../components/MobileBottomNav';
import RecipeDetailModal from '../../../components/modals/RecipeDetailModal';
import AIRecipeCard from './AIRecipeCard';
import AIRecipeQuestionnaire from './AIRecipeQuestionnaire';
import useAIRecipes from '../hooks/useAIRecipes';
import './AIRecipePage.css';

const AIRecipePage = () => {
  const navigate = useNavigate();
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
  const [showQuestionnaire, setShowQuestionnaire] = useState(true); // Start with questionnaire
  
  // Modal state for recipe details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState(null);

  // Show error state
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

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

  const handleBackToMeals = () => {
    navigate('/meal-plans');
  };

  // Helper function to parse AI time strings to minutes
  const parseTimeToMinutes = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return null;
    
    // Extract number from strings like "30 minutes", "1 hour", "45 mins", etc.
    const match = timeString.match(/(\d+)\s*(minute|min|hour|hr)/i);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.includes('hour') || unit.includes('hr')) {
      return value * 60; // Convert hours to minutes
    }
    return value; // Already in minutes
  };

  // Transform AI recipe data to format expected by RecipeDetailModal
  const transformAIRecipeForModal = (aiRecipe) => {
    return {
      // Basic info
      id: aiRecipe.id || aiRecipe._id,
      title: aiRecipe.title,
      image: aiRecipe.imageUrl || aiRecipe.image,
      servings: aiRecipe.servings,
      
      // Time info - parse AI time strings to minutes
      readyInMinutes: parseTimeToMinutes(aiRecipe.total_time) ||
                     (parseTimeToMinutes(aiRecipe.prep_time) || 0) + (parseTimeToMinutes(aiRecipe.cook_time) || 0) ||
                     null,
      
      // Description - convert AI format to Spoonacular format  
      summary: aiRecipe.description || aiRecipe.summary || 'A delicious AI-generated recipe.',
      
      // Dietary info - convert nested structure to flat boolean structure (FIXED)
      vegetarian: aiRecipe.dietary_info?.vegetarian || false,
      vegan: aiRecipe.dietary_info?.vegan || false,
      glutenFree: aiRecipe.dietary_info?.gluten_free || false,
      dairyFree: aiRecipe.dietary_info?.dairy_free || false,
      
      // Cuisine info - convert to array format
      cuisines: aiRecipe.cuisine_type ? [aiRecipe.cuisine_type] : [],
      dishTypes: [], // AI recipes might not have this
      
      // Ingredients - FIXED to use correct AI format
      extendedIngredients: aiRecipe.ingredients?.map(ingredient => {
        // Handle string ingredients (fallback)
        if (typeof ingredient === 'string') {
          return {
            name: ingredient,
            amount: '',
            unit: ''
          };
        }
        // Handle AI recipe format: {item: "name", amount: "1 cup", from_inventory: true}
        return {
          name: ingredient.item || ingredient.name || 'Unknown ingredient', // ✅ Use 'item' field
          amount: ingredient.amount || '',  // ✅ Already correct
          unit: '' // ✅ AI doesn't separate unit from amount
        };
      }) || 
      // Fallback to key_ingredients if ingredients array doesn't exist
      aiRecipe.key_ingredients?.map(ingredient => ({
        name: typeof ingredient === 'string' ? ingredient : ingredient.item || 'Unknown ingredient',
        amount: '',
        unit: ''
      })) || [],
      
      // Instructions - ensure it's in the right format
      instructions: aiRecipe.instructions || aiRecipe.steps || 'No instructions available.',
      
      // Additional fields that might be present
      difficulty: aiRecipe.difficulty,
      tips: aiRecipe.tips
    };
  };

  // Modal handlers for recipe details
  const handleViewFullRecipe = (recipe) => {
    console.log('🍳 Opening AI recipe details for:', recipe.title);
    setIsModalOpen(true);
    setIsLoadingRecipe(false); // No loading needed since we have the data
    setRecipeError(null);
    
    // Transform AI recipe data to format expected by modal (no API call needed)
    const transformedRecipe = transformAIRecipeForModal(recipe);
    setSelectedRecipe(transformedRecipe);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
    setIsLoadingRecipe(false);
    setRecipeError(null);
  };

  const handleActuallyCook = async (recipe) => {
    try {
      // For AI recipes, we might not have the same marking system as Spoonacular
      // Just log for now, but this could be extended to track cooking history
      console.log(`✅ Marked AI recipe ${recipe.title} as cooked`);
      // TODO: Implement AI recipe cooking tracking if needed
    } catch (error) {
      console.error('Failed to mark AI recipe as cooked:', error);
    }
  };

  // Get status message for different states
  const getStatusMessage = () => {
    switch (generationStatus) {
      case 'generating':
        return {
          title: 'Creating Your Personalized Recipes',
          message: 'Our AI is analyzing your fridge inventory and preferences to create delicious recipes just for you...',
          icon: ''
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
    <div className="ai-recipe-page">
      <AppNavBar />

      {/* AI Recipe Content */}
      <div className="ai-recipe-page__main">
        <div className="ai-recipe-page__container">
          {/* Hero Section - Only show when not displaying recipes */}
          {!hasRecipes && (
            <div className="ai-recipe-page__hero">
              <button className="ai-recipe-page__back-btn" onClick={handleBackToMeals}>
                ←
              </button>
              <h1 className="ai-recipe-page__hero-title">Personalize your recipes<br />with AI</h1>
              <p className="ai-recipe-page__hero-subtitle">Answer a few questions to get recipes tailored to your fridge inventory and taste preferences</p>
            </div>
          )}
          
          {/* Back button for recipes view */}
          {hasRecipes && !loading && (
            <div className="ai-recipe-page__recipes-header">
              <button className="ai-recipe-page__back-btn" onClick={handleBackToMeals}>
                ←
              </button>
            </div>
          )}

          {/* Error Message */}
          {showError && error && (
            <div className="error-message">
              <div className="error-content">
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
          {showQuestionnaire && !loading && (
            /* Questionnaire Form */
            <div className="ai-recipe-page__content">
              <AIRecipeQuestionnaire 
                onSubmit={handleQuestionnaireSubmit}
                loading={loading}
              />
            </div>
          )}

          {loading && statusMessage && (
            /* Loading State */
            <div className="ai-recipe-page__content">
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
                      <span className="step-icon"></span>
                      <span>Analyzing inventory</span>
                    </div>
                    <div className="step active">
                      <span className="step-icon"></span>
                      <span>Checking preferences</span>
                    </div>
                    <div className="step active">
                      <span className="step-icon"></span>
                      <span>Generating recipes</span>
                    </div>
                    <div className="step">
                      <span className="step-icon">📸</span>
                      <span>Creating images</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasRecipes && !loading && (
            /* Recipe Cards */
            <div className="recipes-container-no-border">
              <div className="recipes-header">
                <h2>Your Personalized Recipes</h2>
                <button 
                  className="btn-regenerate"
                  onClick={handleRegenerateRecipes}
                  disabled={loading}
                >
                  Generate New Recipes
                </button>
              </div>

              <div className="recipes-grid">
                {recipes.map((recipe, index) => (
                  <AIRecipeCard 
                    key={recipe.id || index} 
                    recipe={recipe} 
                    index={index}
                    onViewFullRecipe={handleViewFullRecipe}
                  />
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
      
      <MobileBottomNav />
      
      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        recipe={selectedRecipe}
        isLoading={isLoadingRecipe}
        error={recipeError}
        onCookNow={handleActuallyCook}
      />
    </div>
  );
};

export default AIRecipePage;