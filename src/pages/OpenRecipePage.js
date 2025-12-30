import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OpenRecipePage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OpenRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Target URL for the recipe - saved recipes page with recipe ID to auto-open
  // (Facebook/Messenger imports go to SavedRecipesPage, not UploadedRecipesPage)
  const recipeTargetUrl = `/saved-recipes?view=${id}`;

  // Check if already running in PWA standalone mode
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    setIsStandalone(standalone);

    // If already in PWA, redirect directly to recipes page
    if (standalone) {
      navigate(recipeTargetUrl, { replace: true });
      return;
    }

    // Check if PWA is installed (Android Chrome only)
    checkPWAInstalled();
  }, [id, navigate, recipeTargetUrl]);

  // Check if PWA is installed using getInstalledRelatedApps API
  async function checkPWAInstalled() {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        setPwaInstalled(relatedApps.length > 0);
      } catch (err) {
        console.log('[OpenRecipe] getInstalledRelatedApps error:', err);
        setPwaInstalled(false);
      }
    }
  }

  // Fetch recipe preview data (requires auth, so may fail for non-logged-in users)
  useEffect(() => {
    async function fetchRecipe() {
      try {
        const token = localStorage.getItem('fridgy_token');

        // Try to get recipe info if user is logged in
        if (token) {
          const response = await fetch(`${API_BASE_URL}/saved-recipes/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setRecipe(data);
            setLoading(false);
            return;
          }
        }

        // Fallback for non-logged-in users or failed fetch
        setRecipe({ id, title: 'Your saved recipe' });
      } catch (err) {
        console.log('[OpenRecipe] Could not fetch preview:', err);
        setRecipe({ id, title: 'Your saved recipe' });
      } finally {
        setLoading(false);
      }
    }

    if (!isStandalone) {
      fetchRecipe();
    }
  }, [id, isStandalone]);

  // Handle "Open in App" button click
  const handleOpenInApp = () => {
    // Try to open the PWA by navigating to the full URL
    // On Android with PWA installed, this may trigger the PWA
    const fullUrl = `${window.location.origin}${recipeTargetUrl}`;

    // Use window.open to potentially trigger PWA
    const opened = window.open(fullUrl, '_blank');

    // Fallback: if popup blocked or didn't work, navigate directly
    if (!opened) {
      window.location.href = fullUrl;
    }
  };

  // Handle "Continue in Browser" click
  const handleContinueInBrowser = () => {
    navigate(recipeTargetUrl);
  };

  // Don't render if already in standalone mode (will redirect)
  if (isStandalone) {
    return null;
  }

  return (
    <div className="open-recipe-page">
      <div className="open-recipe-page__container">
        {/* Logo */}
        <div className="open-recipe-page__logo">
          <img src="/logo192.png" alt="Trackabite" />
        </div>

        {/* Recipe Preview */}
        <div className="open-recipe-page__preview">
          {loading ? (
            <div className="open-recipe-page__loading">
              <div className="open-recipe-page__spinner"></div>
              <p>Loading recipe...</p>
            </div>
          ) : (
            <>
              {recipe?.image && (
                <div className="open-recipe-page__image">
                  <img src={recipe.image} alt={recipe.title} />
                </div>
              )}
              <h1 className="open-recipe-page__title">
                {recipe?.title || 'Your Recipe'}
              </h1>
              {recipe?.source_author && (
                <p className="open-recipe-page__author">by {recipe.source_author}</p>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="open-recipe-page__actions">
          {pwaInstalled ? (
            <>
              <button
                className="open-recipe-page__btn open-recipe-page__btn--primary"
                onClick={handleOpenInApp}
              >
                Open in Trackabite App
              </button>
              <button
                className="open-recipe-page__btn open-recipe-page__btn--secondary"
                onClick={handleContinueInBrowser}
              >
                Continue in Browser
              </button>
            </>
          ) : (
            <>
              <button
                className="open-recipe-page__btn open-recipe-page__btn--primary"
                onClick={handleContinueInBrowser}
              >
                View Recipe
              </button>
              <p className="open-recipe-page__install-hint">
                For the best experience, add Trackabite to your home screen
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="open-recipe-page__footer">
          <p>Trackabite - Smart Food Tracking</p>
        </div>
      </div>
    </div>
  );
}

export default OpenRecipePage;
