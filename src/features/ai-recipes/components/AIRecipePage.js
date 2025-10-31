import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppNavBar } from '../../../components/Navbar';
import MobileBottomNav from '../../../components/MobileBottomNav';
import RecipeDetailModal from '../../../components/modals/RecipeDetailModal';
import RegenerateOptionsModal from '../../../components/modals/RegenerateOptionsModal';
import AIRecipeCard from './AIRecipeCard';
import AIRecipeQuestionnaire from './AIRecipeQuestionnaire';
import AIRecipeLoadingScreen from './AIRecipeLoadingScreen';
import useAIRecipes from '../hooks/useAIRecipes';
import { useGuidedTourContext } from '../../../contexts/GuidedTourContext';
import GuidedTooltip from '../../../components/guided-tour/GuidedTooltip';
import IntroductionModal from '../../../components/guided-tour/IntroductionModal';
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
    clearRecipes,
    clearError
  } = useAIRecipes();

  const { shouldShowTooltip, nextStep, completeTour, goToStep, dismissTour, STEPS, isIndividualTour } = useGuidedTourContext();

  const [showError, setShowError] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true); // Start with questionnaire

  // Modal state for recipe details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState(null);

  // Regenerate options modal state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [lastQuestionnaireData, setLastQuestionnaireData] = useState(null);
  const [questionnaireInitialStep, setQuestionnaireInitialStep] = useState(1);
  const [questionnaireInitialData, setQuestionnaireInitialData] = useState(null);

  // Show error state
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  // Detect when recipes are first generated during the tour
  useEffect(() => {
    if (shouldShowTooltip(STEPS.GENERATE_RECIPES_QUESTIONNAIRE) && hasRecipes && !loading) {
      console.log('[AIRecipePage] Recipes generated during tour - showing success');
      goToStep(STEPS.GENERATE_RECIPES_SUCCESS);
    }
  }, [hasRecipes, loading, shouldShowTooltip, STEPS, goToStep]);

  const handleQuestionnaireSubmit = async (questionnaireData) => {
    try {
      clearError();
      setShowError(false);
      setShowQuestionnaire(false); // Hide questionnaire during loading

      // Store the questionnaire data for potential regeneration
      setLastQuestionnaireData(questionnaireData);

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
      // Show the options modal instead of directly showing questionnaire
      setShowRegenerateModal(true);
    } catch (err) {
      console.error('Failed to regenerate recipes:', err);
    }
  };

  const handleStartFromBeginning = () => {
    setShowRegenerateModal(false);
    setQuestionnaireInitialStep(1); // Start from step 1
    setQuestionnaireInitialData(null); // Clear any saved data
    clearRecipes(); // Clear old recipes before showing questionnaire
    setShowQuestionnaire(true);
  };

  const handleKeepPreferences = () => {
    setShowRegenerateModal(false);
    if (lastQuestionnaireData) {
      // Jump to step 8 (final step) with preserved data
      setQuestionnaireInitialStep(8);
      setQuestionnaireInitialData(lastQuestionnaireData);
    }
    clearRecipes(); // Clear old recipes before showing questionnaire
    setShowQuestionnaire(true);
  };

  const handleCloseRegenerateModal = () => {
    setShowRegenerateModal(false);
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

  // Helper function to parse AI ingredient amounts like "1 cup", "2 lbs", etc.
  const parseIngredientAmount = (amountString) => {
    if (!amountString) return { amount: 1, unit: 'piece' };

    const str = String(amountString).trim();

    // Try to extract number and unit from strings like "1 cup", "2 tablespoons", "½ tsp"
    const match = str.match(/^([\d.\/½¼¾⅓⅔⅛⅜⅝⅞]+)\s*(.*)$/);

    if (!match) {
      // If no number found, return default
      return { amount: 1, unit: str || 'piece' };
    }

    let amount = match[1];

    // Handle common fractions
    if (amount === '½' || amount === '1/2') amount = 0.5;
    else if (amount === '¼' || amount === '1/4') amount = 0.25;
    else if (amount === '¾' || amount === '3/4') amount = 0.75;
    else if (amount === '⅓' || amount === '1/3') amount = 0.33;
    else if (amount === '⅔' || amount === '2/3') amount = 0.67;
    else if (amount === '⅛' || amount === '1/8') amount = 0.125;
    else if (amount.includes('/')) {
      // Handle fractions like "1/2"
      const parts = amount.split('/');
      amount = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      amount = parseFloat(amount);
    }

    // Extract unit (everything after the number)
    let unit = match[2].trim();

    // If unit contains the ingredient name, extract just the unit part
    // e.g., "cup chicken" -> "cup"
    const unitWords = unit.split(/\s+/);
    unit = unitWords[0] || 'piece';

    return {
      amount: isNaN(amount) ? 1 : amount,
      unit: unit || 'piece'
    };
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
          const parsed = parseIngredientAmount('1');
          return {
            name: ingredient,
            amount: parsed.amount,
            unit: parsed.unit
          };
        }
        // Handle AI recipe format: {item: "name", amount: "1 cup", from_inventory: true}
        // Parse the combined amount+unit string into separate numeric amount and unit
        const parsed = parseIngredientAmount(ingredient.amount);
        return {
          name: ingredient.item || ingredient.name || 'Unknown ingredient',
          amount: parsed.amount,  // Numeric value
          unit: parsed.unit       // String unit
        };
      }) || 
      // Fallback to key_ingredients if ingredients array doesn't exist
      aiRecipe.key_ingredients?.map(ingredient => {
        const parsed = parseIngredientAmount('1');
        return {
          name: typeof ingredient === 'string' ? ingredient : ingredient.item || 'Unknown ingredient',
          amount: parsed.amount,
          unit: parsed.unit
        };
      }) || [],
      
      // Instructions - ensure it's in the right format and remove duplicate "Step X:" prefixes
      instructions: Array.isArray(aiRecipe.instructions)
        ? aiRecipe.instructions.map(step =>
            typeof step === 'string' ? step.replace(/^Step \d+:\s*/i, '') : step
          )
        : (aiRecipe.instructions || aiRecipe.steps || 'No instructions available.'),

      // Nutrition - backend already returns in correct format, just pass through
      nutrition: aiRecipe.nutrition || null,

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
          {/* Hero Section - Only show when not displaying recipes and not in questionnaire */}
          {!hasRecipes && !showQuestionnaire && (
            <div className="ai-recipe-page__hero">
              <div className="ai-recipe-page__hero-header">
                <button className="ai-recipe-page__back-btn" onClick={handleBackToMeals}>
                  <ChevronLeft size={20} />
                </button>
                <h1 className="ai-recipe-page__hero-title">Personalize your recipes with AI</h1>
              </div>
              <p className="ai-recipe-page__hero-subtitle">Answer a few questions to get recipes tailored to your fridge inventory and taste preferences</p>
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
                onBackToMeals={handleBackToMeals}
                loading={loading}
                initialStep={questionnaireInitialStep}
                initialFormData={questionnaireInitialData}
              />
            </div>
          )}

          {loading && statusMessage && (
            /* Full-screen Loading Overlay */
            <AIRecipeLoadingScreen />
          )}

          {hasRecipes && !loading && (
            /* Recipe Cards */
            <div className="recipes-container-no-border">
              <div className="recipes-header">
                <button className="ai-recipe-page__back-btn" onClick={handleBackToMeals}>
                  <ChevronLeft size={20} />
                </button>
                <h2>Your Personalized Recipes</h2>
                <button
                  className="btn-regenerate"
                  onClick={handleRegenerateRecipes}
                  disabled={loading}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                  </svg>
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

      {/* Regenerate Options Modal */}
      <RegenerateOptionsModal
        isOpen={showRegenerateModal}
        onClose={handleCloseRegenerateModal}
        onStartFromBeginning={handleStartFromBeginning}
        onKeepPreferences={handleKeepPreferences}
      />

      {/* Guided Tour - Questionnaire Tooltip */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_QUESTIONNAIRE) && showQuestionnaire && questionnaireInitialStep === 1 && (
        <GuidedTooltip
          targetSelector=".btn-continue--large"
          message="Answer a list of questions to personalize your recipes. The AI will use your preferences to create perfect meals for you."
          position="top"
          onAction={() => {
            console.log('[AIRecipePage] User acknowledged questionnaire tooltip');
            nextStep();
          }}
          onDismiss={() => {
            console.log('[AIRecipePage] User dismissed generate recipes tour');
            dismissTour();
          }}
          actionLabel="Got it"
        />
      )}

      {/* Guided Tour - Success Celebration */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_SUCCESS) && hasRecipes && (
        <IntroductionModal
          title="Congrats on your first personalized recipes!"
          message="Your AI-generated recipes are ready! Browse through them and tap any recipe to see the full details, ingredients, and cooking instructions."
          emoji="🎉"
          onContinue={() => {
            console.log('[AIRecipePage] User completed generate recipes tour');
            // If individual tour, complete it. If full tour, continue to next section.
            if (isIndividualTour) {
              completeTour();
            } else {
              nextStep(); // Continue to next section of full tour
            }
          }}
          continueLabel={isIndividualTour ? "Start Cooking!" : "Continue Tour"}
        />
      )}
    </div>
  );
};

export default AIRecipePage;