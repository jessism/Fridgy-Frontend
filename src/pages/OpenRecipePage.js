import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OpenRecipePage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OpenRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');

  // Fetch recipe from public endpoint (no auth needed)
  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/saved-recipes/${id}/public`);

        if (!response.ok) {
          throw new Error('Recipe not found');
        }

        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        console.error('[OpenRecipe] Error fetching recipe:', err);
        setError('Recipe not found');
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [id]);

  // Helper function to check if URL needs proxying
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

  // Get image URL with proxy for Instagram
  const getImageUrl = () => {
    if (!recipe) return 'https://via.placeholder.com/400x300?text=No+Image';
    const baseImageUrl = recipe.image || recipe.image_urls?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
    return needsProxy(baseImageUrl)
      ? `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(baseImageUrl)}`
      : baseImageUrl;
  };

  // Format amounts as Unicode fractions
  const formatAmount = (amount) => {
    if (!amount || amount === 0) return '';
    const whole = Math.floor(amount);
    const decimal = amount - whole;
    const fractions = {
      0.125: '⅛', 0.25: '¼', 0.33: '⅓', 0.375: '⅜',
      0.5: '½', 0.625: '⅝', 0.67: '⅔', 0.75: '¾', 0.875: '⅞'
    };
    if (decimal < 0.0625) {
      return whole === 0 ? '' : String(whole);
    }
    const fractionKeys = Object.keys(fractions).map(Number);
    const closest = fractionKeys.reduce((a, b) =>
      Math.abs(b - decimal) < Math.abs(a - decimal) ? b : a
    );
    const fractionStr = fractions[closest] || '';
    return whole > 0 ? `${whole}${fractionStr}` : fractionStr;
  };

  // Get cook time
  const getCookTime = () => {
    if (recipe?.readyInMinutes) return `${recipe.readyInMinutes} minutes`;
    if (recipe?.cookingMinutes) return `${recipe.cookingMinutes} minutes`;
    return 'Time varies';
  };

  // Get dietary/special attributes
  const getSpecialAttributes = () => {
    const attributes = [];
    if (recipe?.vegetarian) attributes.push('Vegetarian');
    if (recipe?.vegan) attributes.push('Vegan');
    if (recipe?.glutenFree) attributes.push('Gluten Free');
    if (recipe?.dairyFree) attributes.push('Dairy Free');
    if (recipe?.cuisines?.length > 0) attributes.push(recipe.cuisines[0]);
    if (recipe?.dishTypes?.length > 0) {
      const dishType = recipe.dishTypes[0];
      if (!attributes.some(attr => attr.toLowerCase().includes(dishType.toLowerCase()))) {
        attributes.push(dishType);
      }
    }
    return attributes.slice(0, 3);
  };

  // Get clean description
  const getDescription = () => {
    if (!recipe?.summary) return 'A delicious recipe worth trying.';
    const cleanSummary = recipe.summary
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .trim();
    const sentences = cleanSummary
      .split(/[.!?]+/)
      .filter(s => {
        const sentence = s.trim().toLowerCase();
        return sentence.length > 0 &&
               !sentence.includes('serves') &&
               !sentence.includes('serving') &&
               !sentence.includes('costs') &&
               !sentence.includes('$') &&
               !sentence.includes('price');
      });
    if (sentences.length > 0) {
      let firstSentence = sentences[0].trim();
      if (firstSentence.length > 100) {
        firstSentence = firstSentence.substring(0, 97) + '...';
      }
      return firstSentence + '.';
    }
    return 'A delicious recipe worth trying.';
  };

  // Get source attribution
  const getSourceAttribution = () => {
    if (recipe?.source_type === 'instagram') {
      return `@${recipe.source_author || 'View original post'}`;
    }
    if (recipe?.source_type === 'facebook') {
      return recipe.source_author || 'View original post';
    }
    if (recipe?.source_url) {
      try {
        return new URL(recipe.source_url).hostname.replace('www.', '');
      } catch {
        return 'View original';
      }
    }
    return recipe?.source_author ? `Created by ${recipe.source_author}` : '';
  };

  // Render ingredients
  const renderIngredients = () => {
    if (!recipe?.extendedIngredients || recipe.extendedIngredients.length === 0) {
      return <p className="open-recipe-page__no-content">No ingredients available</p>;
    }
    return (
      <div className="open-recipe-page__ingredients-list">
        {recipe.extendedIngredients.map((ingredient, index) => (
          <div key={index} className="open-recipe-page__ingredient-item">
            <span className="open-recipe-page__ingredient-amount">
              {formatAmount(ingredient.amount)}
            </span>
            <span className="open-recipe-page__ingredient-unit">{ingredient.unit || ''}</span>
            <span className="open-recipe-page__ingredient-name">{ingredient.name}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render instructions
  const renderInstructions = () => {
    // Format 1: analyzedInstructions
    if (recipe?.analyzedInstructions?.[0]?.steps?.length > 0) {
      return recipe.analyzedInstructions[0].steps.map((step, index) => (
        <div key={index} className="open-recipe-page__instruction-step">
          <span className="open-recipe-page__step-number">{step.number || index + 1}</span>
          <span className="open-recipe-page__step-text">{step.step}</span>
        </div>
      ));
    }
    // Format 2: instructionSteps array
    if (recipe?.instructionSteps?.length > 0) {
      return recipe.instructionSteps.map((step, index) => (
        <div key={index} className="open-recipe-page__instruction-step">
          <span className="open-recipe-page__step-number">{index + 1}</span>
          <span className="open-recipe-page__step-text">{step}</span>
        </div>
      ));
    }
    // Format 3: instructions string
    if (typeof recipe?.instructions === 'string') {
      const steps = recipe.instructions
        .replace(/<[^>]*>/g, '')
        .split(/\.\s+|\n/)
        .filter(step => step.trim().length > 10);
      if (steps.length > 0) {
        return steps.map((step, index) => (
          <div key={index} className="open-recipe-page__instruction-step">
            <span className="open-recipe-page__step-number">{index + 1}</span>
            <span className="open-recipe-page__step-text">{step.trim()}</span>
          </div>
        ));
      }
    }
    // Format 4: instructions array
    if (Array.isArray(recipe?.instructions)) {
      return recipe.instructions.map((step, index) => (
        <div key={index} className="open-recipe-page__instruction-step">
          <span className="open-recipe-page__step-number">{index + 1}</span>
          <span className="open-recipe-page__step-text">{step}</span>
        </div>
      ));
    }
    return <p className="open-recipe-page__no-content">No instructions available</p>;
  };

  // Render nutrition
  const renderNutrition = () => {
    if (!recipe?.nutrition) {
      return (
        <p className="open-recipe-page__no-content">
          Nutrition information not available
        </p>
      );
    }

    const { perServing, caloricBreakdown, isAIEstimated } = recipe.nutrition;

    return (
      <div className="open-recipe-page__nutrition-info">
        {isAIEstimated && (
          <p className="open-recipe-page__nutrition-estimate">Estimated nutrition</p>
        )}

        {/* Caloric Section */}
        {caloricBreakdown && perServing?.calories && (
          <div className="open-recipe-page__caloric-container">
            <div className="open-recipe-page__calories-section">
              <div className="open-recipe-page__calories-number">
                {Math.round(perServing.calories.amount)}
              </div>
              <div className="open-recipe-page__calories-label">calories</div>
            </div>
            <div className="open-recipe-page__breakdown">
              <h4 className="open-recipe-page__breakdown-title">Caloric Breakdown</h4>
              <div className="open-recipe-page__breakdown-bars">
                <div className="open-recipe-page__breakdown-item">
                  <span className="open-recipe-page__breakdown-label">Protein</span>
                  <div className="open-recipe-page__breakdown-bar-container">
                    <div
                      className="open-recipe-page__breakdown-bar open-recipe-page__breakdown-bar--protein"
                      style={{ width: `${caloricBreakdown.percentProtein}%` }}
                    />
                  </div>
                  <span className="open-recipe-page__breakdown-percent">{caloricBreakdown.percentProtein}%</span>
                </div>
                <div className="open-recipe-page__breakdown-item">
                  <span className="open-recipe-page__breakdown-label">Carbs</span>
                  <div className="open-recipe-page__breakdown-bar-container">
                    <div
                      className="open-recipe-page__breakdown-bar open-recipe-page__breakdown-bar--carbs"
                      style={{ width: `${caloricBreakdown.percentCarbs}%` }}
                    />
                  </div>
                  <span className="open-recipe-page__breakdown-percent">{caloricBreakdown.percentCarbs}%</span>
                </div>
                <div className="open-recipe-page__breakdown-item">
                  <span className="open-recipe-page__breakdown-label">Fat</span>
                  <div className="open-recipe-page__breakdown-bar-container">
                    <div
                      className="open-recipe-page__breakdown-bar open-recipe-page__breakdown-bar--fat"
                      style={{ width: `${caloricBreakdown.percentFat}%` }}
                    />
                  </div>
                  <span className="open-recipe-page__breakdown-percent">{caloricBreakdown.percentFat}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="open-recipe-page__nutrition-header">
          <h3 className="open-recipe-page__nutrition-title">Nutritional information per serving:</h3>
        </div>

        {/* Nutrition Table */}
        <div className="open-recipe-page__nutrition-table">
          {perServing?.calories && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Calories</span>
              <span className="open-recipe-page__nutrition-value">{Math.round(perServing.calories.amount)}kcal</span>
            </div>
          )}
          {perServing?.fat && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Fat</span>
              <span className="open-recipe-page__nutrition-value">{perServing.fat.amount}g</span>
            </div>
          )}
          {perServing?.saturatedFat && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Saturated Fat</span>
              <span className="open-recipe-page__nutrition-value">{perServing.saturatedFat.amount}g</span>
            </div>
          )}
          {perServing?.fiber && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Dietary Fibre</span>
              <span className="open-recipe-page__nutrition-value">{perServing.fiber.amount}g</span>
            </div>
          )}
          {perServing?.carbohydrates && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Carbohydrates</span>
              <span className="open-recipe-page__nutrition-value">{perServing.carbohydrates.amount}g</span>
            </div>
          )}
          {perServing?.sugar && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Sugars</span>
              <span className="open-recipe-page__nutrition-value">{perServing.sugar.amount}g</span>
            </div>
          )}
          {perServing?.protein && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Protein</span>
              <span className="open-recipe-page__nutrition-value">{perServing.protein.amount}g</span>
            </div>
          )}
          {perServing?.sodium && (
            <div className="open-recipe-page__nutrition-row">
              <span className="open-recipe-page__nutrition-label">Sodium</span>
              <span className="open-recipe-page__nutrition-value">{perServing.sodium.amount}mg</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="open-recipe-page">
        <div className="open-recipe-page__loading">
          <div className="open-recipe-page__spinner"></div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <div className="open-recipe-page">
        <div className="open-recipe-page__error">
          <h2>Recipe not found</h2>
          <p>This recipe may have been deleted or is no longer available.</p>
          <button onClick={() => navigate('/')}>Go to Trackabite</button>
        </div>
      </div>
    );
  }

  return (
    <div className="open-recipe-page">
      {/* Modal-style container */}
      <div className="open-recipe-page__modal">
        {/* Header */}
        <div className="open-recipe-page__header">
          <div className="open-recipe-page__logo">
            <img src="/logo192.png" alt="Trackabite" />
            <span>Trackabite</span>
          </div>
        </div>

        {/* Content */}
        <div className="open-recipe-page__content">
          <div className="open-recipe-page__layout">
            {/* Recipe Image */}
            <div className="open-recipe-page__image-container">
              <img
                src={getImageUrl()}
                alt={recipe.title}
                className="open-recipe-page__main-image"
                onError={(e) => {
                  if (e.target.src !== 'https://via.placeholder.com/400x300?text=No+Image') {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }
                }}
              />
            </div>

            {/* Recipe Title */}
            <h1 className="open-recipe-page__title">{recipe.title}</h1>

            {/* Meta Info Section */}
            <div className="open-recipe-page__meta-info">
              {/* Description */}
              <div className="open-recipe-page__description">
                <p>{getDescription()}</p>
              </div>

              {/* Source Attribution */}
              {getSourceAttribution() && (
                <div className="open-recipe-page__attribution">
                  {recipe.source_url ? (
                    <a
                      href={recipe.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-recipe-page__attribution-link"
                    >
                      {getSourceAttribution()}
                    </a>
                  ) : (
                    <span className="open-recipe-page__attribution-link">
                      {getSourceAttribution()}
                    </span>
                  )}
                </div>
              )}

              {/* Time and attributes */}
              <div className="open-recipe-page__info-text">
                <div className="open-recipe-page__info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span>{getCookTime()}</span>
                </div>
                {getSpecialAttributes().slice(0, 2).map((attribute, index) => (
                  <div key={index} className="open-recipe-page__info-item">
                    <span>{attribute}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs Container */}
            <div className="open-recipe-page__tabs-container">
              {/* Tab Navigation */}
              <div className="open-recipe-page__tabs">
                <button
                  className={`open-recipe-page__tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ingredients')}
                >
                  Ingredients
                </button>
                <button
                  className={`open-recipe-page__tab ${activeTab === 'method' ? 'active' : ''}`}
                  onClick={() => setActiveTab('method')}
                >
                  Method
                </button>
                <button
                  className={`open-recipe-page__tab ${activeTab === 'nutrition' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nutrition')}
                >
                  Nutrition
                </button>
              </div>

              {/* Tab Content */}
              <div className="open-recipe-page__tab-content">
                {activeTab === 'ingredients' && (
                  <div>
                    <div className="open-recipe-page__section-header">
                      <h2 className="open-recipe-page__section-title">Ingredients</h2>
                      {recipe.servings && (
                        <span className="open-recipe-page__servings">
                          {recipe.servings} {recipe.servings === 1 ? 'Serving' : 'Servings'}
                        </span>
                      )}
                    </div>
                    {renderIngredients()}
                  </div>
                )}
                {activeTab === 'method' && (
                  <div>
                    <h2 className="open-recipe-page__section-title">Instructions</h2>
                    <div className="open-recipe-page__instructions-container">
                      {renderInstructions()}
                    </div>
                  </div>
                )}
                {activeTab === 'nutrition' && (
                  <div>
                    <h2 className="open-recipe-page__section-title">Nutrition</h2>
                    {renderNutrition()}
                  </div>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <div className="open-recipe-page__cta">
              <p>Want to save recipes and plan your meals?</p>
              <button
                className="open-recipe-page__cta-btn"
                onClick={() => navigate('/onboarding')}
              >
                Get Started Free
              </button>
              <button
                className="open-recipe-page__cta-btn-secondary"
                onClick={() => navigate('/signin')}
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenRecipePage;
