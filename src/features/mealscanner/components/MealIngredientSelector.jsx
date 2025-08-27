import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MealTypeSelector from './MealTypeSelector';
import '../styles/MealScanner.css';
import '../styles/MealTypeSelector.css';

const MealIngredientSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🍽️ showMealTypeSelector state changed to:', showMealTypeSelector);
  }, [showMealTypeSelector]);

  useEffect(() => {
    // Get ingredients from navigation state
    if (location.state?.ingredients) {
      const ingredientsList = location.state.ingredients;
      setIngredients(ingredientsList);
      
      // Select all ingredients by default
      const initialSelection = {};
      ingredientsList.forEach((ing, index) => {
        initialSelection[index] = true;
      });
      setSelectedIngredients(initialSelection);
    } else {
      // No ingredients passed, redirect back
      navigate('/mealscanner');
    }
  }, [location.state, navigate]);

  const handleToggleIngredient = (index) => {
    setSelectedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getSelectedCount = () => {
    return Object.values(selectedIngredients).filter(Boolean).length;
  };

  const handleLogMeal = () => {
    console.log('🍽️ handleLogMeal clicked!');
    console.log('🍽️ Current selectedIngredients:', selectedIngredients);
    console.log('🍽️ Total ingredients:', ingredients.length);
    
    const selectedItems = ingredients.filter((_, index) => selectedIngredients[index]);
    console.log('🍽️ Selected items:', selectedItems.length, selectedItems);
    
    if (selectedItems.length === 0) {
      console.log('❌ No items selected, showing error');
      setError('Please select at least one ingredient');
      return;
    }

    // Show meal type selector modal
    console.log('🍽️ Setting showMealTypeSelector to true...');
    setShowMealTypeSelector(true);
    console.log('🍽️ showMealTypeSelector state should now be true');
  };

  const handleMealTypeSelected = async (mealType) => {
    const selectedItems = ingredients.filter((_, index) => selectedIngredients[index]);
    
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('fridgy_token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/meals/log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: selectedItems,
          imageUrl: location.state?.imageUrl,  // Send URL instead of base64 image
          mealType: mealType,  // Include the selected meal type
          targetDate: location.state?.targetDate  // Include target date for date-aware logging
        })
      });

      // Check if response is OK and is JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } else {
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();

      if (data.success) {
        // Navigate back to the appropriate location
        if (location.state?.returnTo) {
          navigate(location.state.returnTo, { 
            state: { returnDate: location.state.returnDate } 
          });
        } else {
          // Default to inventory if no return location specified
          navigate('/inventory');
        }
      } else {
        throw new Error(data.error || 'Failed to log meal');
      }
    } catch (err) {
      console.error('Error logging meal:', err);
      setError('Failed to log meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="meal-ingredient-selector">
      {/* Header */}
      <div className="meal-selector-header">
        <button className="meal-selector-back" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="meal-selector-title">Scan a Meal</h2>
        <div className="meal-selector-spacer"></div>
      </div>

      {/* Ingredients List */}
      <div className="meal-ingredients-list">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="meal-ingredient-item">
            <div className="meal-ingredient-info">
              <div className="meal-ingredient-name">{ingredient.name}</div>
              <div className="meal-ingredient-details">
                {ingredient.quantity} {ingredient.unit}
                {ingredient.calories && `, ${ingredient.calories} cal`}
              </div>
            </div>
            <label className="meal-ingredient-toggle">
              <input
                type="checkbox"
                checked={selectedIngredients[index] || false}
                onChange={() => handleToggleIngredient(index)}
              />
              <span className="meal-toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>

      {/* Meal Image Preview (Optional) */}
      {location.state?.mealImage && (
        <div className="meal-preview-section">
          <h3 className="meal-preview-title">Your meal</h3>
          <div className="meal-preview-image">
            <img src={location.state.mealImage} alt="Your meal" />
          </div>
        </div>
      )}

      {error && (
        <div className="meal-selector-error">
          {error}
        </div>
      )}

      {/* Bottom Action */}
      <div className="meal-selector-footer">
        <div className="meal-selector-count">
          {getSelectedCount()} Items
        </div>
        <button 
          className="meal-selector-log-btn"
          onClick={handleLogMeal}
          disabled={isLoading || getSelectedCount() === 0}
        >
          {isLoading ? (
            <>
              <span className="meal-selector-spinner"></span>
              Logging...
            </>
          ) : (
            'Log meal'
          )}
        </button>
      </div>
    </div>

    {/* Meal Type Selector Modal */}
    {console.log('🍽️ About to render MealTypeSelector with isOpen:', showMealTypeSelector)}
    <MealTypeSelector
      isOpen={showMealTypeSelector}
      onClose={() => {
        console.log('🍽️ Closing MealTypeSelector');
        setShowMealTypeSelector(false);
      }}
      onSelectMealType={handleMealTypeSelected}
    />
    
    {/* Temporary debug modal - always visible for testing */}
    {showMealTypeSelector && (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        zIndex: 99999,
        border: '3px solid yellow'
      }}>
        DEBUG: Modal should be visible! State is: {showMealTypeSelector.toString()}
      </div>
    )}
    </>
  );
};

export default MealIngredientSelector;