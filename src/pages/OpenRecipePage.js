import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './OpenRecipePage.css';
import { getIngredientIconUrl } from '../assets/icons/ingredients';
import { highlightInstructions } from '../utils/highlightInstructions';
import trackie from '../assets/images/Logo.png';
import { getStepTexts, buildShareMeta, SITE_ORIGIN } from '../utils/recipeSteps';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// "Get a free Trackabite account" popup buttons. Order = priority. /download is
// a Vercel redirect to the App Store, not a React route, so it needs a full
// navigation; swap the two entries to put web signup first.
const OVERLAY_BUTTONS = [
  {
    label: 'Get the free app',
    href: '/download',
    variant: 'primary',
    spa: false,
    note: "(Yes, it's 100% free)",
  },
  { label: 'Or sign up on the web', href: '/onboarding', variant: 'secondary', spa: true },
];

// api/share.js injects <script id="__shared_recipe__" type="application/json">
// so a /r/<slug> visit renders without a second fetch. Guard on the slug: the
// SPA reuses this component across client-side navigations.
function readBootstrap(slug) {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('__shared_recipe__');
  if (!el) return null;
  try {
    const payload = JSON.parse(el.textContent);
    return payload && payload.slug === slug ? payload : null;
  } catch {
    return null;
  }
}

const bootstrapError = (boot) => {
  if (!boot) return null;
  if (boot.status === 410) return 'gone';
  if (boot.status === 200) return null;
  return 'not_found';
};

function OpenRecipePage() {
  const { id, slug } = useParams();
  // /r/<slug> (shared by a user) vs /open-recipe/<id> (bot links, public-source rows)
  const isShare = Boolean(slug);
  const navigate = useNavigate();
  const initialBoot = useMemo(() => (isShare ? readBootstrap(slug) : null), [isShare, slug]);
  const [recipe, setRecipe] = useState(initialBoot?.status === 200 ? initialBoot.recipe : null);
  const [shareMeta, setShareMeta] = useState(initialBoot?.status === 200 ? initialBoot.meta : null);
  const [loading, setLoading] = useState(!initialBoot);
  // null | 'not_found' | 'gone' | 'network'
  const [error, setError] = useState(bootstrapError(initialBoot));
  const [retryKey, setRetryKey] = useState(0);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showSignupPrompt, setShowSignupPrompt] = useState(null);

  // Copy for the account popup: a headline naming what the reader gets, then a
  // line saying what the app does. Named recipes read warmer than "this recipe".
  const getPromptCopy = () => {
    const named = recipe?.title ? `this ${recipe.title} recipe` : 'this recipe';
    switch (showSignupPrompt) {
      case 'shopping':
        return {
          headline: 'Create free shopping list',
          body: `Open Trackabite on your phone to create a smart shopping list for ${named}.`,
        };
      case 'cook':
        return isShare
          ? {
              headline: 'Enjoy hands-free, step-by-step cooking',
              body: 'Open Trackabite on your phone to follow easy step-by-step instructions and cook hands-free.',
            }
          : {
              headline: 'Edit this recipe your way',
              body: 'Open Trackabite on your phone to change the ingredients, steps and photo.',
            };
      case 'save':
        return {
          headline: 'Keep this recipe in your cookbook',
          body: `Open Trackabite on your phone to save ${named} to your collection and cook it any time.`,
        };
      case 'servings':
        return {
          headline: 'Cook for as many as you like',
          body: 'Open Trackabite on your phone to change the servings and watch every ingredient adjust with it.',
        };
      default:
        return {
          headline: 'Get the free Trackabite app',
          body: 'Open Trackabite on your phone to continue.',
        };
    }
  };

  // Load the recipe: bootstrap payload when the server injected one, else the
  // public endpoint (no auth needed).
  useEffect(() => {
    let cancelled = false;

    async function fetchRecipe() {
      setError(null);

      if (isShare) {
        const boot = readBootstrap(slug);
        if (boot) {
          if (boot.status === 200) {
            setRecipe(boot.recipe);
            setShareMeta(boot.meta);
          } else {
            setRecipe(null);
            setError(bootstrapError(boot));
          }
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const url = isShare
        ? `${API_BASE_URL}/saved-recipes/share/${encodeURIComponent(slug)}`
        : `${API_BASE_URL}/saved-recipes/${id}/public`;

      try {
        const response = await fetch(url);
        if (cancelled) return;

        if (response.status === 410) {
          setRecipe(null);
          setError('gone');
          return;
        }
        if (!response.ok) {
          setRecipe(null);
          setError('not_found');
          return;
        }

        const data = await response.json();
        if (cancelled) return;
        setRecipe(data);
        if (isShare) setShareMeta(buildShareMeta(data, slug, SITE_ORIGIN));
      } catch (err) {
        console.error('[OpenRecipe] Error fetching recipe:', err);
        if (!cancelled) {
          setRecipe(null);
          setError('network');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecipe();
    return () => { cancelled = true; };
  }, [id, slug, isShare, retryKey]);

  // The page's warm ground has to reach the document canvas as well, or
  // rubber-band scrolling past the top or bottom on iOS shows white behind it.
  useEffect(() => {
    document.documentElement.classList.add('open-recipe-html');
    return () => document.documentElement.classList.remove('open-recipe-html');
  }, []);

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
      const firstSentence = sentences[0].trim();
      // A truncated sentence ends in an ellipsis and nothing else; appending a
      // full stop as well is what produced "coconu...." on shared pages.
      if (firstSentence.length > 100) {
        return firstSentence.substring(0, 97) + '\u2026';
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
        {recipe.extendedIngredients.map((ingredient, index) => {
          const iconUrl = getIngredientIconUrl(ingredient.name);
          return (
            <div key={index} className="open-recipe-page__ingredient-item">
              <div className="open-recipe-page__ingredient-icon">
                {iconUrl ? (
                  <img src={iconUrl} alt="" className="open-recipe-page__ingredient-icon-img" />
                ) : (
                  <span className="open-recipe-page__ingredient-icon-fallback">🥘</span>
                )}
              </div>
              {/* Name first, measurement right-aligned and muted — the app's
                  arrangement, rather than leading with the amount. */}
              <span className="open-recipe-page__ingredient-name">{ingredient.name}</span>
              <span className="open-recipe-page__ingredient-measure">
                {[formatAmount(ingredient.amount), ingredient.unit].filter(Boolean).join(' ')}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render instructions
  const renderInstructions = () => {
    const ingredients = recipe?.extendedIngredients || [];

    // Format 1: analyzedInstructions — every block, not just [0]; importers
    // and the AI writer both produce multi-block arrays.
    const stepTexts = getStepTexts(recipe);
    if (stepTexts.length > 0) {
      return stepTexts.map((text, index) => (
        <div key={index} className="open-recipe-page__instruction-step">
          <span className="open-recipe-page__step-number">{index + 1}</span>
          <span className="open-recipe-page__step-text">
            {highlightInstructions(text, ingredients)}
          </span>
        </div>
      ));
    }
    // Format 2: instructionSteps array
    if (recipe?.instructionSteps?.length > 0) {
      return recipe.instructionSteps.map((step, index) => (
        <div key={index} className="open-recipe-page__instruction-step">
          <span className="open-recipe-page__step-number">{index + 1}</span>
          <span className="open-recipe-page__step-text">
            {highlightInstructions(step, ingredients)}
          </span>
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
            <span className="open-recipe-page__step-text">
              {highlightInstructions(step.trim(), ingredients)}
            </span>
          </div>
        ));
      }
    }
    // Format 4: instructions array
    if (Array.isArray(recipe?.instructions)) {
      return recipe.instructions.map((step, index) => (
        <div key={index} className="open-recipe-page__instruction-step">
          <span className="open-recipe-page__step-number">{index + 1}</span>
          <span className="open-recipe-page__step-text">
            {highlightInstructions(step, ingredients)}
          </span>
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
    const errorCopy = error === 'gone'
      ? { title: 'This recipe is no longer shared', body: 'The owner turned off sharing for this recipe.' }
      : error === 'network'
        ? { title: "Couldn't load this recipe", body: 'Check your connection and try again.' }
        : { title: 'Recipe not found', body: 'This recipe may have been deleted or is no longer available.' };
    return (
      <div className="open-recipe-page">
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="open-recipe-page__error">
          <h2>{errorCopy.title}</h2>
          <p>{errorCopy.body}</p>
          {error === 'network' && (
            <button onClick={() => setRetryKey((k) => k + 1)}>Try again</button>
          )}
          <button onClick={() => navigate('/')}>Go to Trackabite</button>
        </div>
      </div>
    );
  }

  return (
    <div className="open-recipe-page">
      {/* Share pages: the same tags api/share.js injected (values come from its
          bootstrap, so helmet-async keeps the server nodes instead of
          duplicating them). No JSON-LD here — the server-injected block has no
          data-rh and must stay unmanaged. */}
      {isShare && shareMeta && (
        <Helmet>
          <title>{shareMeta.docTitle}</title>
          <meta name="description" content={shareMeta.description} />
          <meta name="robots" content="noindex" />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="Trackabite" />
          <meta property="og:title" content={shareMeta.title} />
          <meta property="og:description" content={shareMeta.description} />
          <meta property="og:url" content={shareMeta.url} />
          <meta property="og:image" content={shareMeta.image} />
          {shareMeta.imageWidth && shareMeta.imageHeight && (
            <meta property="og:image:width" content={String(shareMeta.imageWidth)} />
          )}
          {shareMeta.imageWidth && shareMeta.imageHeight && (
            <meta property="og:image:height" content={String(shareMeta.imageHeight)} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={shareMeta.title} />
          <meta name="twitter:description" content={shareMeta.description} />
          <meta name="twitter:image" content={shareMeta.image} />
          <link rel="canonical" href={shareMeta.url} />
        </Helmet>
      )}
      {/* Modal-style container */}
      <div className="open-recipe-page__modal">
        {/* Header */}
        <div className="open-recipe-page__header">
          <Link to="/" className="open-recipe-page__logo" aria-label="Go to the Trackabite home page">
            <img src={trackie} alt="" />
            <span>Trackabite</span>
          </Link>
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
              {isShare && recipe.owner?.displayName && (
                <div className="open-recipe-page__shared-by">
                  Shared by {recipe.owner.displayName}
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

              {/* Action Buttons */}
              <div className="open-recipe-page__action-buttons">
                <button
                  className="open-recipe-page__action-btn"
                  onClick={() => setShowSignupPrompt('shopping')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  Shopping list
                </button>
                <button
                  className="open-recipe-page__action-btn"
                  onClick={() => setShowSignupPrompt('cook')}
                >
                  {isShare ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="6 3 20 12 6 21 6 3"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  )}
                  {isShare ? 'Start cooking' : 'Edit recipe'}
                </button>
                {isShare && (
                  <button
                    className="open-recipe-page__action-btn"
                    onClick={() => setShowSignupPrompt('save')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Save to my recipes
                  </button>
                )}
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
                        <div className="open-recipe-page__servings-control">
                          <button
                            className="open-recipe-page__serving-btn"
                            onClick={() => setShowSignupPrompt('servings')}
                          >
                            -
                          </button>
                          <span className="open-recipe-page__serving-value">
                            {recipe.servings} {recipe.servings === 1 ? 'Serving' : 'Servings'}
                          </span>
                          <button
                            className="open-recipe-page__serving-btn"
                            onClick={() => setShowSignupPrompt('servings')}
                          >
                            +
                          </button>
                        </div>
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
              <p className="open-recipe-page__cta-title">
                Save recipes from anywhere and plan your week
              </p>
              {/* Same source of truth as the popup, so the two never drift */}
              {OVERLAY_BUTTONS.map((btn) => (
                <React.Fragment key={btn.href}>
                  <button
                    className={
                      btn.variant === 'primary'
                        ? 'open-recipe-page__cta-btn'
                        : 'open-recipe-page__cta-btn-secondary'
                    }
                    onClick={() => (btn.spa ? navigate(btn.href) : window.location.assign(btn.href))}
                  >
                    {btn.label}
                  </button>
                  {btn.note && <p className="open-recipe-page__free-note">{btn.note}</p>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signup Prompt Popup */}
      {showSignupPrompt && (
        <div className="open-recipe-page__signup-overlay" onClick={() => setShowSignupPrompt(null)}>
          <div className="open-recipe-page__signup-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="open-recipe-page__popup-close"
              onClick={() => setShowSignupPrompt(null)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="open-recipe-page__popup-icon">
              <img src={trackie} alt="" />
            </div>
            <p className="open-recipe-page__popup-message">{getPromptCopy().headline}</p>
            <p className="open-recipe-page__popup-body">{getPromptCopy().body}</p>
            {OVERLAY_BUTTONS.map((btn) => (
              <React.Fragment key={btn.href}>
                <button
                  className={`open-recipe-page__popup-btn-${btn.variant}`}
                  onClick={() => (btn.spa ? navigate(btn.href) : window.location.assign(btn.href))}
                >
                  {btn.label}
                </button>
                {btn.note && <p className="open-recipe-page__free-note">{btn.note}</p>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OpenRecipePage;
