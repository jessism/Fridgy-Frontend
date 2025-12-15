import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCookingConfirmation from '../../features/recipe-cooking/components/RecipeCookingConfirmation';
import useShoppingLists from '../../hooks/useShoppingLists';
import { useSubscription } from '../../hooks/useSubscription';
import ShoppingListSelectionModal from '../ShoppingListSelectionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CookingModeModal from './CookingModeModal';
import { UpgradeModal } from './UpgradeModal';
import { highlightInstructions } from '../../utils/highlightInstructions';
import ClockIcon from '../../assets/icons/Clock.png';

const RecipeDetailModal = ({
  isOpen,
  onClose,
  recipe,
  isLoading,
  onCookNow,
  customActionLabel,
  onDelete,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showCookingConfirmation, setShowCookingConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);

  // Action sheet and edit mode states
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Serving size adjustment state
  const [selectedServings, setSelectedServings] = useState(recipe?.servings || 1);

  // Reset selected servings when recipe changes
  React.useEffect(() => {
    setSelectedServings(recipe?.servings || 1);
  }, [recipe?.id, recipe?.servings]);

  // Shopping list selection modal state
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [selectedIngredientsForList, setSelectedIngredientsForList] = useState(null);

  // Shopping lists hook
  const { lists: shoppingLists, createList, addItem: addToShoppingList, addRecipeToList } = useShoppingLists();

  // Subscription hook for premium gating
  const { isPremium, startCheckout } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Navigation hook
  const navigate = useNavigate();

  // API base URL for proxy
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Helper function to check if URL needs proxying (copied from SavedRecipesPage)
  const needsProxy = (url) => {
    return url &&
           (url.includes('cdninstagram.com') ||
            url.includes('instagram.com') ||
            url.includes('fbcdn.net') ||
            url.includes('instagram.')) &&
           !url.includes('URL_OF_IMAGE') &&
           !url.includes('example.com') &&
           url !== 'URL of image';
  };

  // Helper function to get the correct image URL (copied from SavedRecipesPage)
  const getImageUrl = () => {
    if (!recipe) return 'https://via.placeholder.com/400x300?text=No+Image';

    // Get the base image URL with fallback to image_urls
    const baseImageUrl = recipe.image || recipe.image_urls?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';

    // Use proxy for Instagram images, direct URL for others
    return needsProxy(baseImageUrl)
      ? `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(baseImageUrl)}`
      : baseImageUrl;
  };
  
  if (!isOpen) return null;

  // Helper function to format amounts as Unicode fractions
  const formatAmount = (amount) => {
    if (!amount || amount === 0) return '';

    const whole = Math.floor(amount);
    const decimal = amount - whole;

    // Common fraction mappings
    const fractions = {
      0.125: '⅛', 0.25: '¼', 0.33: '⅓', 0.375: '⅜',
      0.5: '½', 0.625: '⅝', 0.67: '⅔', 0.75: '¾', 0.875: '⅞'
    };

    // If decimal is very small, just return whole number
    if (decimal < 0.0625) {
      return whole === 0 ? '' : String(whole);
    }

    // Find closest fraction
    const fractionKeys = Object.keys(fractions).map(Number);
    const closest = fractionKeys.reduce((a, b) =>
      Math.abs(b - decimal) < Math.abs(a - decimal) ? b : a
    );

    const fractionStr = fractions[closest] || '';
    return whole > 0 ? `${whole}${fractionStr}` : fractionStr;
  };

  // Helper function to calculate scaled ingredient amount
  const getScaledAmount = (originalAmount, originalServings, newServings) => {
    if (!originalAmount || !originalServings) return originalAmount;
    const ratio = newServings / originalServings;
    return originalAmount * ratio;
  };

  // Handle serving change with premium gate
  const handleServingChange = (increment) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedServings(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };

  // Helper function to get cook time
  const getCookTime = () => {
    if (recipe?.readyInMinutes) {
      return `${recipe.readyInMinutes} minutes`;
    }
    if (recipe?.cookingMinutes) {
      return `${recipe.cookingMinutes} minutes`;
    }
    return 'Time varies';
  };

  // Helper function to get dietary/special attributes
  const getSpecialAttributes = () => {
    const attributes = [];
    
    if (recipe?.vegetarian) attributes.push('Vegetarian');
    if (recipe?.vegan) attributes.push('Vegan');
    if (recipe?.glutenFree) attributes.push('Gluten Free');
    if (recipe?.dairyFree) attributes.push('Dairy Free');
    if (recipe?.veryHealthy) attributes.push('Healthy');
    if (recipe?.cheap) attributes.push('Budget');
    if (recipe?.veryPopular) attributes.push('Popular');
    
    // Check cuisine types
    if (recipe?.cuisines?.length > 0) {
      attributes.push(recipe.cuisines[0]);
    }
    
    // Check dish types
    if (recipe?.dishTypes?.length > 0) {
      const dishType = recipe.dishTypes[0];
      if (!attributes.some(attr => attr.toLowerCase().includes(dishType.toLowerCase()))) {
        attributes.push(dishType);
      }
    }
    
    return attributes.slice(0, 3); // Limit to 3 attributes max
  };

  // Helper function to transform recipe ingredients to shopping list format
  const transformIngredientsForShoppingList = () => {
    if (!recipe?.extendedIngredients) return [];

    const originalServings = recipe?.servings || 1;

    return recipe.extendedIngredients.map(ingredient => {
      // Calculate scaled amount based on selected servings
      const scaledAmount = getScaledAmount(
        ingredient.amount,
        originalServings,
        selectedServings
      );

      // Combine amount and unit into quantity string
      let quantity = '';
      if (scaledAmount && scaledAmount > 0) {
        quantity = formatAmount(scaledAmount);
        if (ingredient.unit) {
          quantity += ` ${ingredient.unit}`;
        }
      } else if (ingredient.unit) {
        quantity = ingredient.unit;
      } else {
        quantity = '1';
      }

      return {
        name: ingredient.name || 'Unknown ingredient',
        quantity: quantity.trim(),
        category: 'Other'
      };
    });
  };

  // Get count of ingredients
  const getIngredientsCount = () => {
    return recipe?.extendedIngredients?.length || 0;
  };

  // Helper function to get clean description
  const getDescription = () => {
    if (!recipe?.summary) return 'A delicious recipe worth trying.';
    
    // Remove HTML tags
    const cleanSummary = recipe.summary
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .trim();
    
    // Filter out sentences containing serving/cost info and other unwanted phrases
    const sentences = cleanSummary
      .split(/[.!?]+/)
      .filter(s => {
        const sentence = s.trim().toLowerCase();
        // Remove sentences about servings, costs, and other unwanted phrases
        return sentence.length > 0 && 
               !sentence.includes('serves') && 
               !sentence.includes('serving') &&
               !sentence.includes('per serving') &&
               !sentence.includes('costs') &&
               !sentence.includes('cents per') &&
               !sentence.includes('$') &&  // Filter out any sentence with dollar signs
               !sentence.includes('dollar') &&  // Filter out sentences with "dollar"
               !sentence.includes('price') &&  // Filter out sentences with "price"
               !sentence.startsWith('for ') &&  // Filter out sentences starting with "For"
               !sentence.includes('watching your figure') &&
               !sentence.includes('figure') &&
               !sentence.includes('recipe serves') &&
               !sentence.includes('this recipe');
      });
    
    // Return only first sentence, and truncate if too long
    if (sentences.length > 0) {
      let firstSentence = sentences[0].trim();
      // Limit to roughly 100 characters for 1-2 lines
      if (firstSentence.length > 100) {
        firstSentence = firstSentence.substring(0, 97) + '...';
      }
      return firstSentence + '.';
    }
    return 'A delicious recipe worth trying.';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCookNow = () => {
    if (recipe) {
      setShowCookingConfirmation(true);
    }
  };

  const handleCookingComplete = () => {
    setShowCookingConfirmation(false);
    onClose();
    // Optionally call parent's onCookNow if they need to know
    if (onCookNow) {
      onCookNow(recipe);
    }
  };

  // Shopping list handlers
  const handleAddToShoppingList = () => {
    const ingredients = transformIngredientsForShoppingList();
    setSelectedIngredientsForList(ingredients);
    setShowShoppingListModal(true);
  };

  const handleAddToExistingList = async (listId, listName) => {
    try {
      // Add all ingredients to the existing list
      for (const ingredient of selectedIngredientsForList) {
        await addToShoppingList(listId, ingredient);
      }

      // Add recipe metadata for carousel display
      if (recipe) {
        const recipeMetadata = {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image || recipe.image_urls?.[0],
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings || 1
        };
        await addRecipeToList(listId, recipeMetadata);
      }

      // Close modals
      setShowShoppingListModal(false);
      setSelectedIngredientsForList(null);
      onClose();

      // Navigate to shopping list tab and show the specific list details
      navigate('/inventory/shopping-list', {
        state: {
          selectedListId: listId,
          autoSelectList: true
        }
      });
    } catch (error) {
      console.error('Failed to add ingredients to shopping list:', error);
      alert('Failed to add ingredients to shopping list. Please try again.');
    }
  };

  const handleCreateNewListAndAdd = async (listName) => {
    try {
      // Build recipe metadata for carousel display
      const recipeMetadata = recipe ? {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image || recipe.image_urls?.[0],
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings || 1
      } : null;

      // Create list with all the ingredients and recipe metadata
      const newList = await createList(listName, '#4fcf61', selectedIngredientsForList, recipeMetadata);

      // Close modals
      setShowShoppingListModal(false);
      setSelectedIngredientsForList(null);
      onClose();

      // Navigate to shopping list tab and show the new list details
      navigate('/inventory/shopping-list', {
        state: {
          selectedListId: newList.id,
          autoSelectList: true
        }
      });
    } catch (error) {
      console.error('Failed to create new shopping list:', error);
      alert('Failed to create shopping list. Please try again.');
    }
  };

  const handleCloseShoppingListModal = () => {
    setShowShoppingListModal(false);
    setSelectedIngredientsForList(null);
  };

  const handleDeleteRecipe = () => {
    if (!recipe) return;
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && recipe) {
      onDelete(recipe.id);
    }
    setShowDeleteConfirmation(false);
    onClose(); // Close the modal after deletion
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Edit mode handlers
  const handleEnterEditMode = () => {
    setShowActionSheet(false);
    setEditedRecipe({ ...recipe });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedRecipe(null);
  };

  const handleSaveEdit = async () => {
    if (!editedRecipe) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(
        `${API_BASE_URL}/saved-recipes/${recipe.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editedRecipe)
        }
      );

      if (response.ok) {
        const updatedRecipe = await response.json();
        if (onUpdate) onUpdate(updatedRecipe);
        setIsEditMode(false);
        setEditedRecipe(null);
      } else {
        console.error('Failed to save changes');
        alert('Failed to save changes. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions for editing instructions
  const handleUpdateStep = (index, newText) => {
    if (!editedRecipe) return;

    const currentInstructions = editedRecipe.analyzedInstructions?.[0]?.steps || [];
    const newSteps = [...currentInstructions];
    newSteps[index] = { ...newSteps[index], step: newText };

    setEditedRecipe({
      ...editedRecipe,
      analyzedInstructions: [{
        ...(editedRecipe.analyzedInstructions?.[0] || {}),
        steps: newSteps
      }]
    });
  };

  const handleAddStep = () => {
    if (!editedRecipe) return;

    const currentSteps = editedRecipe.analyzedInstructions?.[0]?.steps || [];
    const newSteps = [...currentSteps, { number: currentSteps.length + 1, step: '' }];

    setEditedRecipe({
      ...editedRecipe,
      analyzedInstructions: [{
        ...(editedRecipe.analyzedInstructions?.[0] || {}),
        steps: newSteps
      }]
    });
  };

  const handleRemoveStep = (index) => {
    if (!editedRecipe) return;

    const currentSteps = editedRecipe.analyzedInstructions?.[0]?.steps || [];
    const newSteps = currentSteps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      number: i + 1
    }));

    setEditedRecipe({
      ...editedRecipe,
      analyzedInstructions: [{
        ...(editedRecipe.analyzedInstructions?.[0] || {}),
        steps: newSteps
      }]
    });
  };

  const renderIngredients = () => {
    if (!recipe?.extendedIngredients || recipe.extendedIngredients.length === 0) {
      return <p className="no-ingredients">No ingredients available</p>;
    }

    const originalServings = recipe?.servings || 1;

    return (
      <div className="ingredients-list">
        {recipe.extendedIngredients.map((ingredient, index) => {
          const scaledAmount = getScaledAmount(
            ingredient.amount,
            originalServings,
            selectedServings
          );
          return (
            <div key={index} className="ingredient-item">
              <span className="ingredient-amount">
                {formatAmount(scaledAmount)}
              </span>
              <span className="ingredient-unit">{ingredient.unit || ''}</span>
              <span className="ingredient-name">{ingredient.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInstructions = () => {
    // First check for analyzedInstructions format (from Instagram imports)
    if (recipe?.analyzedInstructions &&
        Array.isArray(recipe.analyzedInstructions) &&
        recipe.analyzedInstructions.length > 0 &&
        recipe.analyzedInstructions[0].steps &&
        Array.isArray(recipe.analyzedInstructions[0].steps) &&
        recipe.analyzedInstructions[0].steps.length > 0) {
      return recipe.analyzedInstructions[0].steps.map((step, index) => (
        <div key={index} className="instruction-step">
          <span className="step-number">{step.number || index + 1}</span>
          <span className="step-text">{highlightInstructions(step.step, recipe?.extendedIngredients)}</span>
        </div>
      ));
    }

    // Second check for structured step-by-step instructions
    if (recipe?.instructionSteps && Array.isArray(recipe.instructionSteps) && recipe.instructionSteps.length > 0) {
      return recipe.instructionSteps.map((step, index) => (
        <div key={index} className="instruction-step">
          <span className="step-number">{index + 1}</span>
          <span className="step-text">{highlightInstructions(step, recipe?.extendedIngredients)}</span>
        </div>
      ));
    }

    // Fall back to parsing the instructions string
    if (recipe?.instructions && typeof recipe.instructions === 'string') {
      // Remove HTML tags and split by periods or line breaks
      const cleanInstructions = recipe.instructions
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .split(/\.\s+|\n/)
        .filter(step => step.trim().length > 10); // Filter out very short steps
      
      if (cleanInstructions.length > 0) {
        return cleanInstructions.map((step, index) => (
          <div key={index} className="instruction-step">
            <span className="step-number">{index + 1}</span>
            <span className="step-text">{highlightInstructions(step.trim(), recipe?.extendedIngredients)}</span>
          </div>
        ));
      }
    }

    // If instructions is already an array (shouldn't happen with current API)
    if (recipe?.instructions && Array.isArray(recipe.instructions)) {
      return recipe.instructions.map((step, index) => (
        <div key={index} className="instruction-step">
          <span className="step-number">{index + 1}</span>
          <span className="step-text">{highlightInstructions(step, recipe?.extendedIngredients)}</span>
        </div>
      ));
    }

    return <p>No instructions available</p>;
  };

  // Helper function to extract instruction steps as array for CookingMode
  const getInstructionSteps = () => {
    // Format 1: analyzedInstructions (from Instagram imports)
    if (recipe?.analyzedInstructions &&
        Array.isArray(recipe.analyzedInstructions) &&
        recipe.analyzedInstructions.length > 0 &&
        recipe.analyzedInstructions[0].steps &&
        Array.isArray(recipe.analyzedInstructions[0].steps) &&
        recipe.analyzedInstructions[0].steps.length > 0) {
      return recipe.analyzedInstructions[0].steps.map(step => step.step);
    }

    // Format 2: instructionSteps array
    if (recipe?.instructionSteps && Array.isArray(recipe.instructionSteps) && recipe.instructionSteps.length > 0) {
      return recipe.instructionSteps;
    }

    // Format 3: instructions string (parsed)
    if (recipe?.instructions && typeof recipe.instructions === 'string') {
      const cleanInstructions = recipe.instructions
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .split(/\.\s+|\n/)
        .filter(step => step.trim().length > 10);

      if (cleanInstructions.length > 0) {
        return cleanInstructions.map(step => step.trim());
      }
    }

    // Format 4: instructions array
    if (recipe?.instructions && Array.isArray(recipe.instructions)) {
      return recipe.instructions;
    }

    return [];
  };

  const renderNutrition = () => {
    console.log('[RecipeDetailModal] Nutrition data:', {
      hasNutrition: !!recipe?.nutrition,
      isAIEstimated: recipe?.nutrition?.isAIEstimated,
      confidence: recipe?.nutrition?.confidence,
      calories: recipe?.nutrition?.perServing?.calories?.amount,
      sourceType: recipe?.source_type,
      importMethod: recipe?.import_method
    });

    if (!recipe?.nutrition) {
      return (
        <div className="nutrition-info">
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.95rem' }}>
            Nutrition information not available
          </p>
        </div>
      );
    }

    const { perServing, caloricBreakdown, isAIEstimated, confidence } = recipe.nutrition;

    return (
      <div className="nutrition-info">
        {/* AI Estimation Badge */}
        {isAIEstimated && (
          <p style={{ fontSize: '0.8rem', color: '#999', margin: '0 0 0.5rem 0' }}>
            Estimated nutrition
          </p>
        )}

        {/* Caloric Section - 50/50 Layout */}
        {caloricBreakdown && perServing.calories && (
          <div className="nutrition-caloric-container">
            {/* Left Side - Total Calories */}
            <div className="calories-total-section">
              <div className="calories-big-number">
                {Math.round(perServing.calories.amount)}
              </div>
              <div className="calories-label">calories</div>
            </div>
            
            {/* Right Side - Caloric Breakdown */}
            <div className="nutrition-caloric-breakdown">
              <h4 className="breakdown-title">Caloric Breakdown</h4>
              <div className="breakdown-bars">
                <div className="breakdown-item">
                  <span className="breakdown-label">Protein</span>
                  <div className="breakdown-bar-container">
                    <div 
                      className="breakdown-bar protein-bar" 
                      style={{ width: `${caloricBreakdown.percentProtein}%` }}
                    />
                  </div>
                  <span className="breakdown-percent">{caloricBreakdown.percentProtein}%</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Carbs</span>
                  <div className="breakdown-bar-container">
                    <div 
                      className="breakdown-bar carbs-bar" 
                      style={{ width: `${caloricBreakdown.percentCarbs}%` }}
                    />
                  </div>
                  <span className="breakdown-percent">{caloricBreakdown.percentCarbs}%</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Fat</span>
                  <div className="breakdown-bar-container">
                    <div 
                      className="breakdown-bar fat-bar" 
                      style={{ width: `${caloricBreakdown.percentFat}%` }}
                    />
                  </div>
                  <span className="breakdown-percent">{caloricBreakdown.percentFat}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="nutrition-table-header">
          <h3 className="nutrition-table-title">Nutritional information per serving:</h3>
        </div>

        {/* Clean Nutrition Table */}
        <div className="nutrition-table">
          {perServing.calories && (
            <div className="nutrition-row">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">
                {Math.round(perServing.calories.amount)}kcal
              </span>
            </div>
          )}
          
          {perServing.fat && (
            <div className="nutrition-row">
              <span className="nutrition-label">Fat</span>
              <span className="nutrition-value">{perServing.fat.amount}g</span>
            </div>
          )}
          
          {perServing.saturatedFat && (
            <div className="nutrition-row">
              <span className="nutrition-label">Saturated Fat</span>
              <span className="nutrition-value">{perServing.saturatedFat.amount}g</span>
            </div>
          )}
          
          {perServing.fiber && (
            <div className="nutrition-row">
              <span className="nutrition-label">Dietary Fibre</span>
              <span className="nutrition-value">{perServing.fiber.amount}g</span>
            </div>
          )}
          
          {perServing.carbohydrates && (
            <div className="nutrition-row">
              <span className="nutrition-label">Carbohydrates</span>
              <span className="nutrition-value">{perServing.carbohydrates.amount}g</span>
            </div>
          )}
          
          {perServing.sugar && (
            <div className="nutrition-row">
              <span className="nutrition-label">Sugars</span>
              <span className="nutrition-value">{perServing.sugar.amount}g</span>
            </div>
          )}
          
          {perServing.protein && (
            <div className="nutrition-row">
              <span className="nutrition-label">Protein</span>
              <span className="nutrition-value">{perServing.protein.amount}g</span>
            </div>
          )}
          
          {perServing.sodium && (
            <div className="nutrition-row">
              <span className="nutrition-label">Sodium</span>
              <span className="nutrition-value">{perServing.sodium.amount}mg</span>
            </div>
          )}
          
          {perServing.cholesterol && (
            <div className="nutrition-row">
              <span className="nutrition-label">Cholesterol</span>
              <span className="nutrition-value">{perServing.cholesterol.amount}mg</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="recipe-modal-overlay" onClick={handleOverlayClick}>
        <div className="recipe-modal">
          {/* Header with close/cancel and more options/save buttons */}
          <div className="recipe-modal-header">
            <button
              className="recipe-modal-close"
              onClick={isEditMode ? handleCancelEdit : onClose}
              aria-label={isEditMode ? "Cancel editing" : "Close modal"}
            >
              {isEditMode ? (
                <span className="recipe-modal-cancel-text">Cancel</span>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            {isEditMode ? (
              <button
                className="recipe-modal-save"
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            ) : (
              onDelete && recipe && (
                <button
                  className="recipe-modal-more"
                  onClick={() => setShowActionSheet(true)}
                  aria-label="More options"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                  </svg>
                </button>
              )
            )}
          </div>

          <div className="recipe-modal-content">
            {isLoading ? (
              <div className="recipe-loading">
                <div className="loading-spinner"></div>
                <p>Loading recipe details...</p>
              </div>
            ) : recipe ? (
              <div className="recipe-simple-layout">
                {/* Recipe Image at Top */}
                <div className="recipe-image-container">
                  <img
                    src={getImageUrl()}
                    alt={recipe.title}
                    className="recipe-main-image"
                    onError={(e) => {
                      console.error('[RecipeDetailModal] Image failed to load:', {
                        recipeId: recipe.id,
                        title: recipe.title,
                        failedUrl: e.target.src,
                        sourceType: recipe.source_type,
                        hasImage: !!recipe.image,
                        hasImageUrls: !!recipe.image_urls,
                        imageUrlsLength: recipe.image_urls?.length
                      });
                      // Fallback to placeholder if image fails
                      if (e.target.src !== 'https://via.placeholder.com/400x300?text=No+Image') {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }
                    }}
                    onLoad={(e) => {
                      if (recipe.source_type === 'instagram') {
                        console.log('[RecipeDetailModal] Instagram image loaded successfully:', {
                          recipeId: recipe.id,
                          title: recipe.title,
                          loadedUrl: e.target.src.substring(0, 100) + '...'
                        });
                      }
                    }}
                  />
                </div>

                {/* Recipe Title Below Image */}
                {isEditMode ? (
                  <input
                    type="text"
                    className="recipe-edit-title"
                    value={editedRecipe?.title || ''}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, title: e.target.value })}
                    placeholder="Recipe title"
                  />
                ) : (
                  <h1 className="recipe-main-title">{recipe.title}</h1>
                )}

                {/* Description and Info Text Below Image */}
                <div className="recipe-meta-info">
                  <div className="recipe-description">
                    <p>{getDescription()}</p>
                  </div>

                  {/* Instagram Attribution */}
                  {recipe.source_type === 'instagram' && (recipe.source_author || recipe.source_url) && (
                    <div className="recipe-instagram-attribution">
                      {recipe.source_url && (
                        <a
                          href={recipe.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="recipe-instagram-link"
                        >
                          @{recipe.source_author || 'View original post'}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="recipe-info-text">
                    <div className="info-text-item">
                      <img src={ClockIcon} alt="Time" className="info-text-icon-img" />
                      <span className="info-text">{getCookTime()}</span>
                    </div>
                    {getSpecialAttributes().slice(0, 2).map((attribute, index) => (
                      <div key={index} className="info-text-item">
                        <span className="info-text">{attribute}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="recipe-action-buttons">
                    <div className="recipe-action-row single-row">
                      <button
                        className="recipe-add-items-button"
                        onClick={handleAddToShoppingList}
                        disabled={getIngredientsCount() === 0}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 2L3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-6-5H9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="7" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="9" y1="10" x2="15" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Shopping list
                      </button>
                      <button
                        className="recipe-cook-button"
                        onClick={customActionLabel ? () => onCookNow(recipe) : handleCookNow}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {customActionLabel || "Cook this"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabbed Interface */}
                <div className="recipe-tabs-container">
                  {/* Tab Navigation */}
                  <div className="recipe-tabs">
                    <button 
                      className={`recipe-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                      onClick={() => setActiveTab('ingredients')}
                    >
                      Ingredients
                    </button>
                    <button 
                      className={`recipe-tab ${activeTab === 'method' ? 'active' : ''}`}
                      onClick={() => setActiveTab('method')}
                    >
                      Method
                    </button>
                    <button 
                      className={`recipe-tab ${activeTab === 'nutrition' ? 'active' : ''}`}
                      onClick={() => setActiveTab('nutrition')}
                    >
                      Nutrition
                    </button>
                  </div>
                  
                  {/* Tab Content */}
                  <div className="recipe-tab-content">
                    {activeTab === 'ingredients' && (
                      <div>
                        <div className="recipe-detail-modal__ingredients-header">
                          <h2 className="section-title">Ingredients</h2>
                          <div className="recipe-detail-modal__servings-inline">
                            <button
                              type="button"
                              className="recipe-detail-modal__serving-btn"
                              onClick={() => handleServingChange(false)}
                              disabled={isPremium && selectedServings <= 1}
                              aria-label="Decrease servings"
                            >
                              -
                            </button>
                            <span className="recipe-detail-modal__serving-value">
                              {selectedServings} {selectedServings === 1 ? 'Serving' : 'Servings'}
                            </span>
                            <button
                              type="button"
                              className="recipe-detail-modal__serving-btn"
                              onClick={() => handleServingChange(true)}
                              aria-label="Increase servings"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="ingredients-container">
                          {renderIngredients()}
                        </div>
                      </div>
                    )}
                    {activeTab === 'method' && (
                      <div>
                        <div className="cooking-mode__instructions-header">
                          <h2 className="section-title">Instructions</h2>
                          {!isEditMode && getInstructionSteps().length > 0 && (
                            <button
                              className="cooking-mode__play-button"
                              onClick={() => setShowCookingMode(true)}
                              title="Start Cooking Mode"
                              aria-label="Start step-by-step cooking mode"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="instructions-container">
                          {isEditMode ? (
                            <div className="recipe-edit-instructions">
                              {(editedRecipe?.analyzedInstructions?.[0]?.steps || []).map((step, index) => (
                                <div key={index} className="recipe-edit-step">
                                  <span className="step-number">{index + 1}</span>
                                  <textarea
                                    className="recipe-edit-step-textarea"
                                    value={step.step || ''}
                                    onChange={(e) => handleUpdateStep(index, e.target.value)}
                                    placeholder={`Step ${index + 1}`}
                                  />
                                  <button
                                    className="recipe-edit-step-remove"
                                    onClick={() => handleRemoveStep(index)}
                                    aria-label="Remove step"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <line x1="18" y1="6" x2="6" y2="18"/>
                                      <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                  </button>
                                </div>
                              ))}
                              <button className="recipe-add-step-btn" onClick={handleAddStep}>
                                + Add Step
                              </button>
                            </div>
                          ) : (
                            renderInstructions()
                          )}
                        </div>
                      </div>
                    )}
                    {activeTab === 'nutrition' && (
                      <div>
                        <h2 className="section-title">Nutrition</h2>
                        {renderNutrition()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="recipe-error">
                <p>Failed to load recipe details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Cooking Confirmation Modal */}
      <RecipeCookingConfirmation
        recipe={recipe}
        isOpen={showCookingConfirmation}
        onClose={() => setShowCookingConfirmation(false)}
        onCookComplete={handleCookingComplete}
      />

      {/* Shopping List Selection Modal */}
      <ShoppingListSelectionModal
        isOpen={showShoppingListModal}
        onClose={handleCloseShoppingListModal}
        item={{ itemName: `${getIngredientsCount()} recipe ingredients` }}
        shoppingLists={shoppingLists}
        onAddToExistingList={handleAddToExistingList}
        onCreateNewListAndAdd={handleCreateNewListAndAdd}
        recipeTitle={recipe?.title}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={recipe?.title}
        itemType="recipe"
      />

      {/* Cooking Mode Modal */}
      <CookingModeModal
        isOpen={showCookingMode}
        onClose={() => setShowCookingMode(false)}
        steps={getInstructionSteps()}
        recipeName={recipe?.title}
        ingredients={recipe?.extendedIngredients}
      />

      {/* Upgrade Modal for serving adjustment */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="serving adjustment"
        startCheckout={startCheckout}
      />

      {/* Action Sheet */}
      {showActionSheet && (
        <div className="recipe-action-sheet-overlay" onClick={() => setShowActionSheet(false)}>
          <div className="recipe-action-sheet" onClick={e => e.stopPropagation()}>
            <button
              className="recipe-action-sheet__option"
              onClick={handleEnterEditMode}
            >
              <span>EDIT RECIPE</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              className="recipe-action-sheet__option"
              onClick={() => {
                setShowActionSheet(false);
                handleDeleteRecipe();
              }}
            >
              <span>DELETE RECIPE</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeDetailModal;