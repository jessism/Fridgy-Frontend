import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCookingConfirmation from '../../features/recipe-cooking/components/RecipeCookingConfirmation';
import useShoppingLists from '../../hooks/useShoppingLists';
import ShoppingListSelectionModal from '../ShoppingListSelectionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const RecipeDetailModal = ({
  isOpen,
  onClose,
  recipe,
  isLoading,
  onCookNow,
  customActionLabel,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showCookingConfirmation, setShowCookingConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Shopping list selection modal state
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [selectedIngredientsForList, setSelectedIngredientsForList] = useState(null);

  // Shopping lists hook
  const { lists: shoppingLists, createList, addItem: addToShoppingList } = useShoppingLists();

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

    return recipe.extendedIngredients.map(ingredient => {
      // Combine amount and unit into quantity string
      let quantity = '';
      if (ingredient.amount && ingredient.amount > 0) {
        quantity = `${Math.round(ingredient.amount * 100) / 100}`;
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
      // Create list with all the ingredients already included
      const newList = await createList(listName, '#4fcf61', selectedIngredientsForList);

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

  const renderIngredients = () => {
    if (!recipe?.extendedIngredients || recipe.extendedIngredients.length === 0) {
      return <p className="no-ingredients">No ingredients available</p>;
    }

    return (
      <div className="ingredients-list">
        {recipe.extendedIngredients.map((ingredient, index) => (
          <div key={index} className="ingredient-item">
            <span className="ingredient-amount">
              {ingredient.amount ? Math.round(ingredient.amount * 100) / 100 : ''}
            </span>
            <span className="ingredient-unit">{ingredient.unit || ''}</span>
            <span className="ingredient-name">{ingredient.name}</span>
          </div>
        ))}
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
          <span className="step-text">
            <strong>Step {step.number || index + 1}:</strong> {step.step}
          </span>
        </div>
      ));
    }

    // Second check for structured step-by-step instructions
    if (recipe?.instructionSteps && Array.isArray(recipe.instructionSteps) && recipe.instructionSteps.length > 0) {
      return recipe.instructionSteps.map((step, index) => (
        <div key={index} className="instruction-step">
          <span className="step-text">
            <strong>Step {index + 1}:</strong> {step}
          </span>
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
            <span className="step-text">
              <strong>Step {index + 1}:</strong> {step.trim()}
            </span>
          </div>
        ));
      }
    }

    // If instructions is already an array (shouldn't happen with current API)
    if (recipe?.instructions && Array.isArray(recipe.instructions)) {
      return recipe.instructions.map((step, index) => (
        <div key={index} className="instruction-step">
          <span className="step-text">
            <strong>Step {index + 1}:</strong> {step}
          </span>
        </div>
      ));
    }

    return <p>No instructions available</p>;
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
          {/* Header with close and delete buttons */}
          <div className="recipe-modal-header">
            <button
              className="recipe-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {onDelete && recipe && (
              <button
                className="recipe-modal-delete"
                onClick={handleDeleteRecipe}
                aria-label="Delete recipe"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
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
                <h1 className="recipe-main-title">{recipe.title}</h1>

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
                      <span className="info-text-icon">⏱</span>
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
                      <div className="servings-display">
                        {recipe.servings || 2} servings
                      </div>
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
                        <h2 className="section-title">Ingredients</h2>
                        <div className="ingredients-container">
                          {renderIngredients()}
                        </div>
                      </div>
                    )}
                    {activeTab === 'method' && (
                      <div>
                        <h2 className="section-title">Instructions</h2>
                        <div className="instructions-container">
                          {renderInstructions()}
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
    </>
  );
};

export default RecipeDetailModal;