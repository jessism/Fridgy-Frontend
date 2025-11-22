import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppNavBar } from '../../../components/Navbar';
import MobileBottomNav from '../../../components/MobileBottomNav';
import RecipeDetailModal from '../../../components/modals/RecipeDetailModal';
import RegenerateOptionsModal from '../../../components/modals/RegenerateOptionsModal';
import { UpgradeModal } from '../../../components/modals/UpgradeModal';
import AIRecipeCard from './AIRecipeCard';
import AIRecipeQuestionnaire from './AIRecipeQuestionnaire';
import AIRecipeLoadingScreen from './AIRecipeLoadingScreen';
import useAIRecipes from '../hooks/useAIRecipes';
import { useSubscription } from '../../../hooks/useSubscription';
import { useGuidedTourContext } from '../../../contexts/GuidedTourContext';
import { usePWAInstall } from '../../../hooks/usePWAInstall';
import GuidedTooltip from '../../../components/guided-tour/GuidedTooltip';
import IntroductionModal from '../../../components/guided-tour/IntroductionModal';
import InstallPromptModal from '../../../components/guided-tour/InstallPromptModal';
import IOSInstallModal from '../../../components/IOSInstallModal';
import confettiImage from '../../../assets/icons/Confetti.png';
import './AIRecipePage.css';

const AIRecipePage = () => {
  const navigate = useNavigate();
  const {
    recipes,
    hasRecipes,
    loading,
    error,
    limitInfo,
    generationStatus,
    loadRecipes,
    regenerateRecipes,
    clearRecipes,
    clearError
  } = useAIRecipes();

  // Add state to track image preloading
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [isPreloadingImages, setIsPreloadingImages] = useState(false);

  const { isFreeTier, getAIRecipeUsage, refresh, startCheckout } = useSubscription();
  const aiRecipeUsage = useMemo(() => getAIRecipeUsage(), [getAIRecipeUsage]);

  const { shouldShowTooltip, nextStep, completeTour, goToStep, dismissTour, STEPS, isIndividualTour } = useGuidedTourContext();
  const { isInstallable, isInstalled, platform, installApp } = usePWAInstall();

  const [showError, setShowError] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true); // Start with questionnaire
  const [isSubmitting, setIsSubmitting] = useState(false); // Local state for immediate loading UI
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // Upgrade modal for limit exceeded

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

  // Guided tour - Success celebration delay
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

  // PWA Install modals
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSInstallModal, setShowIOSInstallModal] = useState(false);
  const [showTourCompleteModal, setShowTourCompleteModal] = useState(false);

  // Show error state
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  // Detect when AI recipe limit is exceeded and show upgrade modal
  useEffect(() => {
    if (limitInfo && limitInfo.upgradeRequired) {
      console.log('[AIRecipePage] AI recipe limit exceeded, showing upgrade modal after delay');

      // Add 2.5 second delay so user sees loading screen longer
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [limitInfo]);

  // Auto-advance tour step when landing on AI recipes page
  useEffect(() => {
    if (shouldShowTooltip(STEPS.GENERATE_RECIPES_START_BUTTON)) {
      console.log('[AIRecipePage] User arrived from Start button, advancing to QUESTIONNAIRE step');
      nextStep();
    }
  }, [shouldShowTooltip, STEPS.GENERATE_RECIPES_START_BUTTON, nextStep]);

  // Detect when recipes are first generated during the tour
  useEffect(() => {
    if (shouldShowTooltip(STEPS.GENERATE_RECIPES_QUESTIONNAIRE) && hasRecipes && !loading && imagesPreloaded) {
      console.log('[AIRecipePage] Recipes generated during tour - advancing to success step');
      goToStep(STEPS.GENERATE_RECIPES_SUCCESS);
    }
  }, [hasRecipes, loading, imagesPreloaded, shouldShowTooltip, STEPS, goToStep]);

  // Preload images when recipes are loaded
  useEffect(() => {
    const preloadRecipeImages = async () => {
      if (recipes && recipes.length > 0 && !imagesPreloaded && !isPreloadingImages) {
        console.log('[AIRecipePage] Starting to preload', recipes.length, 'recipe images');
        setIsPreloadingImages(true);

        // Create array of image preload promises
        const imagePromises = recipes.map((recipe) => {
          return new Promise((resolve) => {
            if (!recipe.imageUrl) {
              // No image to load, resolve immediately
              resolve();
              return;
            }

            const img = new Image();
            img.onload = () => {
              console.log('[AIRecipePage] Image loaded:', recipe.title);
              resolve();
            };
            img.onerror = () => {
              console.warn('[AIRecipePage] Failed to load image for:', recipe.title);
              // Don't fail the whole preload if one image fails
              resolve();
            };
            img.src = recipe.imageUrl;
          });
        });

        // Wait for all images to load or fail
        try {
          await Promise.all(imagePromises);
          console.log('[AIRecipePage] All images preloaded successfully');
          setImagesPreloaded(true);
        } catch (error) {
          console.error('[AIRecipePage] Error preloading images:', error);
          // Still mark as preloaded to show recipes even if some images failed
          setImagesPreloaded(true);
        } finally {
          setIsPreloadingImages(false);
        }
      }
    };

    preloadRecipeImages();
  }, [recipes, imagesPreloaded, isPreloadingImages]);

  // Reset preload state when recipes change
  useEffect(() => {
    setImagesPreloaded(false);
    setIsPreloadingImages(false);
  }, [recipes]);

  // Show success celebration after 8 second delay
  useEffect(() => {
    if (shouldShowTooltip(STEPS.GENERATE_RECIPES_SUCCESS) && hasRecipes && imagesPreloaded) {
      console.log('[AIRecipePage] On success step - setting 8s timer for celebration');
      const timer = setTimeout(() => {
        console.log('[AIRecipePage] 8s elapsed - showing celebration modal');
        setShowSuccessCelebration(true);
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setShowSuccessCelebration(false);
    }
  }, [shouldShowTooltip, STEPS.GENERATE_RECIPES_SUCCESS, hasRecipes, imagesPreloaded]);

  const handleQuestionnaireSubmit = async (questionnaireData) => {
    try {
      clearError();
      setShowError(false);

      // Set submitting state BEFORE hiding questionnaire to prevent flash
      setIsSubmitting(true);
      setShowQuestionnaire(false); // Hide questionnaire during loading

      // Store the questionnaire data for potential regeneration
      setLastQuestionnaireData(questionnaireData);

      await loadRecipes(false, questionnaireData);

      // Refresh subscription to get updated usage count
      await refresh();

      // Reset submitting state after completion
      setIsSubmitting(false);
    } catch (err) {
      console.error('Failed to generate recipes:', err);
      setIsSubmitting(false); // Reset submitting state on error
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

  const handleStartFromBeginning = async () => {
    setShowRegenerateModal(false);
    setQuestionnaireInitialStep(1); // Start from step 1
    setQuestionnaireInitialData(null); // Clear any saved data
    clearRecipes(); // Clear old recipes before showing questionnaire

    // Refresh subscription to show updated usage count
    await refresh();

    setShowQuestionnaire(true);
  };

  const handleKeepPreferences = async () => {
    setShowRegenerateModal(false);
    if (lastQuestionnaireData) {
      // Jump to step 8 (final step) with preserved data
      setQuestionnaireInitialStep(8);
      setQuestionnaireInitialData(lastQuestionnaireData);
    }
    clearRecipes(); // Clear old recipes before showing questionnaire

    // Refresh subscription to show updated usage count
    await refresh();

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

  const handleUpgradeModalClose = () => {
    console.log('[AIRecipePage] User dismissed upgrade modal, navigating back to meals');
    setShowUpgradeModal(false);
    navigate('/meal-plans');
  };

  // Format reset date for display
  const formatResetDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleInstallApp = async () => {
    console.log('[AIRecipePage] User wants to install app, platform:', platform);

    // If already installed, just complete tour
    if (isInstalled) {
      console.log('[AIRecipePage] App already installed, completing tour');
      setShowInstallPrompt(false);
      completeTour();
      return;
    }

    // iOS: Show instruction modal
    if (platform === 'ios') {
      console.log('[AIRecipePage] iOS detected, showing install instructions');
      setShowInstallPrompt(false);
      setShowIOSInstallModal(true);
      return;
    }

    // Android/Desktop: Show native install prompt
    if (isInstallable) {
      console.log('[AIRecipePage] Showing native install prompt');
      const result = await installApp();

      if (result.success) {
        console.log('[AIRecipePage] Install successful, completing tour');
        setShowInstallPrompt(false);
        completeTour();
      } else {
        console.log('[AIRecipePage] Install cancelled, completing tour anyway');
        setShowInstallPrompt(false);
        completeTour();
      }
    } else {
      // No install prompt available, just complete tour
      console.log('[AIRecipePage] No install prompt available, completing tour');
      setShowInstallPrompt(false);
      completeTour();
    }
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
          {!hasRecipes && !showQuestionnaire && !isSubmitting && (
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
          {showQuestionnaire && !loading && !isSubmitting && (
            /* Questionnaire Form */
            <div className="ai-recipe-page__content">
              <AIRecipeQuestionnaire
                onSubmit={handleQuestionnaireSubmit}
                onBackToMeals={handleBackToMeals}
                loading={loading}
                initialStep={questionnaireInitialStep}
                initialFormData={questionnaireInitialData}
                onStepChange={(step) => {
                  console.log('[AIRecipePage] Questionnaire step changed to:', step);
                  setQuestionnaireInitialStep(step);
                }}
                isFreeTier={isFreeTier}
                aiRecipeUsage={aiRecipeUsage}
              />
            </div>
          )}

          {(isSubmitting || (loading && statusMessage) || (hasRecipes && !imagesPreloaded)) && (
            /* Full-screen Loading Overlay - Keep visible until images are preloaded */
            <AIRecipeLoadingScreen />
          )}

          {hasRecipes && !loading && imagesPreloaded && (
            /* Recipe Cards - Only show when images are ready */
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
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          background: 'white',
          border: '3px solid #4fcf61',
          borderRadius: '16px',
          padding: '16px 24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: '500',
          color: '#333',
          maxWidth: '280px'
        }}>
          Answer a few questions to get personalized recipes
        </div>
      )}

      {/* Guided Tour - Success Celebration */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_SUCCESS) && hasRecipes && showSuccessCelebration && !showInstallPrompt && (
        <IntroductionModal
          title="Congrats on your first personalized recipes!"
          message="Your recipes are ready! Tap any recipe to view full details."
          emoji={<img src={confettiImage} alt="Celebration" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />}
          onContinue={() => {
            console.log('[AIRecipePage] User clicked Next - showing install prompt');
            setShowSuccessCelebration(false);
            setShowInstallPrompt(true);
          }}
          continueLabel="Next"
        />
      )}

      {/* Install Prompt Modal */}
      <InstallPromptModal
        isOpen={showInstallPrompt}
        onInstall={handleInstallApp}
        onClose={() => {
          setShowInstallPrompt(false);
          setShowTourCompleteModal(true);
        }}
      />

      {/* Tour Complete Congratulations Modal */}
      {showTourCompleteModal && (
        <IntroductionModal
          title="Congratulations!"
          message="You now can add more items and create personalized recipes"
          emoji={<img src={confettiImage} alt="Celebration" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />}
          onContinue={() => {
            setShowTourCompleteModal(false);
            completeTour();
            navigate('/home');
          }}
          continueLabel="End Tour"
        />
      )}

      {/* iOS Install Modal */}
      <IOSInstallModal
        isOpen={showIOSInstallModal}
        onClose={() => {
          setShowIOSInstallModal(false);
          setShowTourCompleteModal(true);
        }}
        onContinue={() => {
          setShowIOSInstallModal(false);
          setShowTourCompleteModal(true);
        }}
      />

      {/* Upgrade Modal for AI Recipe Limit */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleUpgradeModalClose}
        feature="ai recipes"
        current={limitInfo?.current}
        limit={limitInfo?.limit}
        startCheckout={startCheckout}
      />
    </div>
  );
};

export default AIRecipePage;