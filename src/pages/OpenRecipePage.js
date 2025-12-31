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

  // Format fraction for display
  const formatFraction = (amount) => {
    if (!amount) return '';
    const fractions = {
      0.25: '¼', 0.33: '⅓', 0.5: '½', 0.66: '⅔', 0.75: '¾',
      0.125: '⅛', 0.375: '⅜', 0.625: '⅝', 0.875: '⅞'
    };
    const whole = Math.floor(amount);
    const decimal = amount - whole;
    const fraction = fractions[Math.round(decimal * 1000) / 1000] || '';
    if (whole === 0 && fraction) return fraction;
    if (fraction) return `${whole} ${fraction}`;
    return amount % 1 === 0 ? amount.toString() : amount.toFixed(1);
  };

  // Get instructions from various formats
  const getInstructions = () => {
    if (!recipe) return [];

    // Format 1: analyzedInstructions[0].steps
    if (recipe.analyzedInstructions?.[0]?.steps) {
      return recipe.analyzedInstructions[0].steps.map(s => s.step);
    }
    // Format 2: instructionSteps array
    if (Array.isArray(recipe.instructionSteps)) {
      return recipe.instructionSteps;
    }
    // Format 3: instructions as string
    if (typeof recipe.instructions === 'string') {
      return recipe.instructions.split(/\.\s+|\n/).filter(s => s.trim());
    }
    // Format 4: instructions as array
    if (Array.isArray(recipe.instructions)) {
      return recipe.instructions;
    }
    return [];
  };

  // Get image URL with proxy for Instagram
  const getImageUrl = () => {
    const baseUrl = recipe?.image || recipe?.image_urls?.[0];
    if (!baseUrl) return null;

    // Use proxy for Instagram images
    if (baseUrl.includes('cdninstagram.com') || baseUrl.includes('fbcdn.net')) {
      return `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(baseUrl)}`;
    }
    return baseUrl;
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

  const instructions = getInstructions();
  const imageUrl = getImageUrl();

  return (
    <div className="open-recipe-page">
      {/* Header */}
      <header className="open-recipe-page__header">
        <div className="open-recipe-page__logo-small">
          <img src="/logo192.png" alt="Trackabite" />
          <span>Trackabite</span>
        </div>
      </header>

      {/* Recipe Content */}
      <div className="open-recipe-page__content">
        {/* Recipe Image */}
        {imageUrl && (
          <div className="open-recipe-page__image">
            <img
              src={imageUrl}
              alt={recipe.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
              }}
            />
          </div>
        )}

        {/* Title & Meta */}
        <div className="open-recipe-page__title-section">
          <h1>{recipe.title}</h1>
          {recipe.source_author && (
            <p className="open-recipe-page__author">by {recipe.source_author}</p>
          )}

          <div className="open-recipe-page__meta">
            {recipe.readyInMinutes && (
              <span className="open-recipe-page__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                {recipe.readyInMinutes} min
              </span>
            )}
            {recipe.servings && (
              <span className="open-recipe-page__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {recipe.servings} servings
              </span>
            )}
          </div>

          {/* Dietary tags */}
          <div className="open-recipe-page__tags">
            {recipe.vegetarian && <span className="open-recipe-page__tag">Vegetarian</span>}
            {recipe.vegan && <span className="open-recipe-page__tag">Vegan</span>}
            {recipe.glutenFree && <span className="open-recipe-page__tag">Gluten-Free</span>}
            {recipe.dairyFree && <span className="open-recipe-page__tag">Dairy-Free</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="open-recipe-page__tabs">
          <button
            className={`open-recipe-page__tab ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button
            className={`open-recipe-page__tab ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            Instructions
          </button>
          {recipe.nutrition && (
            <button
              className={`open-recipe-page__tab ${activeTab === 'nutrition' ? 'active' : ''}`}
              onClick={() => setActiveTab('nutrition')}
            >
              Nutrition
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="open-recipe-page__tab-content">
          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <div className="open-recipe-page__ingredients">
              {recipe.extendedIngredients?.length > 0 ? (
                <ul>
                  {recipe.extendedIngredients.map((ing, index) => (
                    <li key={index}>
                      <span className="open-recipe-page__ing-amount">
                        {formatFraction(ing.amount)} {ing.unit}
                      </span>
                      <span className="open-recipe-page__ing-name">{ing.name || ing.original}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="open-recipe-page__empty">No ingredients available</p>
              )}
            </div>
          )}

          {/* Instructions Tab */}
          {activeTab === 'instructions' && (
            <div className="open-recipe-page__instructions">
              {instructions.length > 0 ? (
                <ol>
                  {instructions.map((step, index) => (
                    <li key={index}>
                      <span className="open-recipe-page__step-num">{index + 1}</span>
                      <span className="open-recipe-page__step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="open-recipe-page__empty">No instructions available</p>
              )}
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && recipe.nutrition && (
            <div className="open-recipe-page__nutrition">
              <div className="open-recipe-page__calories">
                <span className="open-recipe-page__calories-num">
                  {Math.round(recipe.nutrition.perServing?.calories?.amount || recipe.nutrition.calories || 0)}
                </span>
                <span className="open-recipe-page__calories-label">calories per serving</span>
              </div>
              <div className="open-recipe-page__macros">
                <div className="open-recipe-page__macro">
                  <span className="open-recipe-page__macro-value">
                    {Math.round(recipe.nutrition.perServing?.protein?.amount || recipe.nutrition.protein || 0)}g
                  </span>
                  <span className="open-recipe-page__macro-label">Protein</span>
                </div>
                <div className="open-recipe-page__macro">
                  <span className="open-recipe-page__macro-value">
                    {Math.round(recipe.nutrition.perServing?.carbohydrates?.amount || recipe.nutrition.carbs || 0)}g
                  </span>
                  <span className="open-recipe-page__macro-label">Carbs</span>
                </div>
                <div className="open-recipe-page__macro">
                  <span className="open-recipe-page__macro-value">
                    {Math.round(recipe.nutrition.perServing?.fat?.amount || recipe.nutrition.fat || 0)}g
                  </span>
                  <span className="open-recipe-page__macro-label">Fat</span>
                </div>
              </div>
            </div>
          )}
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

      {/* Footer */}
      <footer className="open-recipe-page__footer">
        <p>Trackabite - Smart Food Tracking</p>
      </footer>
    </div>
  );
}

export default OpenRecipePage;
