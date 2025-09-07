import React, { useState, useEffect } from 'react';
import MealTypeSelector from '../../mealscanner/components/MealTypeSelector';
import DeductionSuccessModal from '../../../components/modals/DeductionSuccessModal';
import './RecipeCookingConfirmation.css';

const RecipeCookingConfirmation = ({ 
  recipe, 
  isOpen, 
  onClose, 
  onCookComplete 
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [deductionResults, setDeductionResults] = useState(null);
  
  // Initialize all ingredients as selected when modal opens
  useEffect(() => {
    if (isOpen && recipe?.extendedIngredients) {
      const initialSelection = {};
      recipe.extendedIngredients.forEach((_, index) => {
        initialSelection[index] = true;
      });
      setSelectedIngredients(initialSelection);
    }
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;

  const handleToggleIngredient = (index) => {
    setSelectedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getSelectedCount = () => {
    return Object.values(selectedIngredients).filter(Boolean).length;
  };

  const handleCookRecipe = () => {
    const selectedItems = recipe.extendedIngredients.filter((_, index) => selectedIngredients[index]);
    
    if (selectedItems.length === 0) {
      setError('Please select at least one ingredient to deduct');
      return;
    }

    // Show meal type selector
    setShowMealTypeSelector(true);
  };

  const getMealTypeByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 21) return 'dinner';
    return 'snack';
  };

  const handleMealTypeSelected = async (mealType) => {
    console.log('🍳 Recipe cooking started for:', recipe.title);
    console.log('🍽️ Meal type selected:', mealType);
    
    const selectedItems = recipe.extendedIngredients
      .filter((_, index) => selectedIngredients[index])
      .map(ing => ({
        name: ing.name,
        quantity: ing.amount || 1,
        unit: ing.unit || 'piece',
        // Include original string for better matching
        original: ing.original
      }));
    
    console.log('📦 Selected ingredients:', selectedItems);
    
    setIsLoading(true);
    setError(null);
    setShowMealTypeSelector(false);

    try {
      const token = localStorage.getItem('fridgy_token');
      
      // Use the actual meal type if provided, otherwise use time-based detection
      const finalMealType = mealType || getMealTypeByTime();
      
      console.log('📡 Making API call to:', `/recipes/${recipe.id}/cook`);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/recipes/${recipe.id}/cook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: selectedItems,
          imageUrl: recipe.image, // Use recipe image
          mealType: finalMealType,
          mealName: recipe.title, // Use recipe title as meal name
          servings: recipe.servings || 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (data.success) {
        // Store deduction results and show modal
        console.log('✅ Recipe cooked successfully, showing success modal');
        setDeductionResults(data.results);
        setShowDeductionModal(true);
      } else {
        throw new Error(data.error || 'Failed to cook recipe');
      }
    } catch (err) {
      console.error('❌ Error cooking recipe:', err);
      setError('Failed to cook recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Only show cooking modal when success modal is not showing */}
      {!showDeductionModal && (
        <div className="recipe-cooking-overlay" onClick={handleOverlayClick}>
          <div className="recipe-cooking-modal">
            {/* Header */}
            <div className="recipe-cooking-header">
              <button className="recipe-cooking-back" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h2 className="recipe-cooking-title">Cook: {recipe.title}</h2>
              <button 
                className="recipe-cooking-close"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>

          {/* Recipe Info */}
          <div className="recipe-cooking-info">
            <img 
              src={recipe.image || 'https://via.placeholder.com/100x100?text=No+Image'} 
              alt={recipe.title}
              className="recipe-cooking-image"
            />
            <div className="recipe-cooking-details">
              <p className="recipe-cooking-servings">
                {recipe.servings || 2} servings
              </p>
              <p className="recipe-cooking-time">
                {recipe.readyInMinutes ? `${recipe.readyInMinutes} minutes` : 'Time varies'}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="recipe-cooking-instructions">
            <p>Select the ingredients you want to deduct from your inventory:</p>
          </div>

          {/* Ingredients List */}
          <div className="recipe-cooking-ingredients">
            {recipe.extendedIngredients?.map((ingredient, index) => (
              <div key={index} className="recipe-cooking-ingredient">
                <div className="recipe-ingredient-info">
                  <div className="recipe-ingredient-name">{ingredient.name}</div>
                  <div className="recipe-ingredient-amount">
                    {ingredient.amount ? Math.round(ingredient.amount * 100) / 100 : ''} {ingredient.unit || ''}
                  </div>
                </div>
                <label className="recipe-ingredient-toggle">
                  <input
                    type="checkbox"
                    checked={selectedIngredients[index] || false}
                    onChange={() => handleToggleIngredient(index)}
                  />
                  <span className="recipe-toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>

          {error && (
            <div className="recipe-cooking-error">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="recipe-cooking-footer">
            <div className="recipe-cooking-count">
              {getSelectedCount()} of {recipe.extendedIngredients?.length || 0} ingredients selected
            </div>
            <div className="recipe-cooking-actions">
              <button 
                className="recipe-cooking-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="recipe-cooking-confirm"
                onClick={handleCookRecipe}
                disabled={isLoading || getSelectedCount() === 0}
              >
                {isLoading ? (
                  <>
                    <span className="recipe-cooking-spinner"></span>
                    Cooking...
                  </>
                ) : (
                  'Cook & Deduct'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Meal Type Selector Modal */}
      <MealTypeSelector
        isOpen={showMealTypeSelector}
        onClose={() => setShowMealTypeSelector(false)}
        onSelectMealType={handleMealTypeSelected}
      />
      
      {/* Deduction Success Modal */}
      <DeductionSuccessModal
        isOpen={showDeductionModal}
        onClose={() => {
          setShowDeductionModal(false);
          onClose(); // Close cooking modal
          if (onCookComplete) {
            onCookComplete(); // Notify parent of completion
          }
        }}
        deductionResults={deductionResults}
      />
    </>
  );
};

export default RecipeCookingConfirmation;