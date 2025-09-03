import React from 'react';

const RecipeDetailModal = ({
  isOpen,
  onClose,
  recipe,
  isLoading,
  onCookNow
}) => {
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
    if (onCookNow && recipe) {
      onCookNow(recipe);
    }
    onClose();
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
    if (!recipe?.instructions) return <p>No instructions available</p>;

    // If instructions is a string, try to parse it
    if (typeof recipe.instructions === 'string') {
      // Remove HTML tags and split by periods or line breaks
      const cleanInstructions = recipe.instructions
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .split(/\.\s+|\n/)
        .filter(step => step.trim().length > 10); // Filter out very short steps
      
      return cleanInstructions.map((step, index) => (
        <div key={index} className="instruction-step">
          <span className="step-number">Step {index + 1}:</span>
          <span className="step-text">{step.trim()}</span>
        </div>
      ));
    }

    // If instructions is an array
    if (Array.isArray(recipe.instructions)) {
      return recipe.instructions.map((step, index) => (
        <div key={index} className="instruction-step">
          <span className="step-number">Step {index + 1}:</span>
          <span className="step-text">{step}</span>
        </div>
      ));
    }

    return <p>Instructions format not supported</p>;
  };

  return (
    <div className="recipe-modal-overlay" onClick={handleOverlayClick}>
      <div className="recipe-modal">
        {/* Header with close button */}
        <div className="recipe-modal-header">
          <button 
            className="recipe-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="recipe-modal-content">
          {isLoading ? (
            <div className="recipe-loading">
              <div className="loading-spinner"></div>
              <p>Loading recipe details...</p>
            </div>
          ) : recipe ? (
            <div className="recipe-simple-layout">
              {/* Recipe Title at Top */}
              <h1 className="recipe-main-title">{recipe.title}</h1>
              
              {/* Recipe Image Below Title */}
              <div className="recipe-image-container">
                <img 
                  src={recipe.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={recipe.title}
                  className="recipe-main-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              </div>

              {/* Description and Info Text Below Image */}
              <div className="recipe-meta-info">
                <div className="recipe-description">
                  <p>{getDescription()}</p>
                </div>

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
                  <div className="servings-display">
                    {recipe.servings || 2} servings
                  </div>
                  <button 
                    className="save-recipe-action-btn"
                    onClick={() => console.log('Save recipe placeholder')}
                  >
                    Save recipe
                  </button>
                </div>
              </div>

              {/* Two Column Section Below Photo: Ingredients Left, Instructions Right */}
              <div className="recipe-bottom-section">
                {/* Left Column - Ingredients */}
                <div className="ingredients-column">
                  <h2 className="section-title">Ingredients</h2>
                  <div className="ingredients-container">
                    {renderIngredients()}
                  </div>
                </div>

                {/* Right Column - Instructions */}
                <div className="instructions-column">
                  <h2 className="section-title">Instructions</h2>
                  <div className="instructions-container">
                    {renderInstructions()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="recipe-error">
              <p>Failed to load recipe details</p>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        {recipe && !isLoading && (
          <div className="recipe-modal-footer">
            <button 
              className="recipe-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="recipe-cook-button"
              onClick={handleCookNow}
            >
              🍳 Cook This Recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailModal;