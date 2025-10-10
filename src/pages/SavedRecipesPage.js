import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileBottomNav from '../components/MobileBottomNav';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import RecipeCreationModal from '../components/modals/RecipeCreationModal';
import './SavedRecipesPage.css';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SavedRecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [scannedRecipes, setScannedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);
  const [shortcutConfig, setShortcutConfig] = useState(null);
  const [installingShortcut, setInstallingShortcut] = useState(false);

  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchScannedRecipes = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        setScannedRecipes([]);
        return;
      }

      const params = new URLSearchParams({
        limit: 10,
        filter: 'scanned'
      });

      const response = await fetch(`${API_BASE_URL}/saved-recipes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch scanned recipes:', response.status);
        setScannedRecipes([]);
        return;
      }

      const data = await response.json();
      setScannedRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching scanned recipes:', error);
      setScannedRecipes([]);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('fridgy_token');

      // If no token, don't try to fetch - user is not logged in
      if (!token) {
        console.log('No token found - user not authenticated');
        setRecipes([]);
        setScannedRecipes([]);
        setLoading(false);
        return;
      }

      // Fetch both regular recipes and scanned recipes
      await Promise.all([
        fetchAllRecipes(token),
        fetchScannedRecipes()
      ]);
    } catch (error) {
      console.error('Error in fetchRecipes:', error);
      setRecipes([]);
      setScannedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecipes = async (token) => {
    try {
      const params = new URLSearchParams({
        limit: 50
      });

      const response = await fetch(`${API_BASE_URL}/saved-recipes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed - token might be expired');
          // Only redirect if truly unauthorized, not for empty results
          navigate('/signin');
          return;
        }
        console.error('Failed to fetch recipes:', response.status);
        // Don't throw error for other status codes, just set empty recipes
        setRecipes([]);
        return;
      }

      const data = await response.json();

      // Filter to only show imported recipes (exclude manual/uploaded)
      const importedRecipes = (data.recipes || []).filter(recipe => {
        // Exclude manual/uploaded recipes
        return recipe.source_type !== 'manual' &&
               recipe.import_method !== 'manual' &&
               recipe.source_author !== 'Me';
      });

      console.log('[SavedRecipes] Filtered imported recipes:', {
        total: data.recipes?.length,
        imported: importedRecipes.length
      });

      setRecipes(importedRecipes);
    } catch (error) {
      console.error('Error fetching all recipes:', error);
      setRecipes([]);
    }
  };
  
  const handleToggleFavorite = async (recipeId, event) => {
    event.stopPropagation();
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/saved-recipes/${recipeId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setRecipes(prevRecipes => 
          prevRecipes.map(recipe => 
            recipe.id === recipeId 
              ? { ...recipe, is_favorite: !recipe.is_favorite }
              : recipe
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  const handleDeleteRecipe = async (recipeId, event) => {
    console.log('[Delete] Button clicked for recipe:', recipeId);
    event.stopPropagation();

    // Prevent multiple clicks
    if (deletingRecipeId === recipeId) {
      console.log('[Delete] Already deleting this recipe, ignoring click');
      return;
    }

    console.log('[Delete] Deleting recipe immediately...');
    setDeletingRecipeId(recipeId); // Show loading state

    try {
      const token = localStorage.getItem('fridgy_token');
      console.log('[Delete] Token exists:', !!token);

      const url = `${API_BASE_URL}/saved-recipes/${recipeId}`;
      console.log('[Delete] Making DELETE request to:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[Delete] Response status:', response.status);
      console.log('[Delete] Response ok:', response.ok);

      if (response.ok) {
        console.log('[Delete] Recipe deleted successfully');
        setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== recipeId));
        if (selectedRecipe?.id === recipeId) {
          setShowDetail(false);
          setSelectedRecipe(null);
        }
      } else {
        // Log detailed error information
        const errorText = await response.text();
        console.error('[Delete] Server error:', response.status, errorText);
        alert(`Failed to delete recipe: ${response.status} - ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Delete] Exception caught:', error);
      console.error('[Delete] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Failed to delete recipe: ${error.message}`);
    } finally {
      setDeletingRecipeId(null); // Reset loading state
    }
  };
  
  const handleCookRecipe = async (recipe) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      await fetch(`${API_BASE_URL}/saved-recipes/${recipe.id}/cook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setRecipes(prevRecipes =>
        prevRecipes.map(r =>
          r.id === recipe.id
            ? { ...r, times_cooked: (r.times_cooked || 0) + 1, last_cooked: new Date() }
            : r
        )
      );
    } catch (error) {
      console.error('Error marking recipe as cooked:', error);
    }
  };

  // Quick install shortcut function using iCloud link
  const handleQuickShortcutInstall = async () => {
    if (!isIOS) {
      // For non-iOS users, go to the setup page
      navigate('/shortcuts/setup');
      return;
    }

    setInstallingShortcut(true);

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        alert('Please sign in to set up shortcuts');
        navigate('/signin');
        return;
      }

      // Fetch user's shortcut token
      const response = await fetch(`${API_BASE_URL}/shortcuts/setup`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shortcut configuration');
      }

      const config = await response.json();

      // Copy token to clipboard for easy pasting
      try {
        await navigator.clipboard.writeText(config.token);
        console.log('Token copied to clipboard');
      } catch (clipboardError) {
        console.warn('Could not copy to clipboard:', clipboardError);
      }

      // iCloud shortcut link
      const iCloudShortcutURL = process.env.REACT_APP_ICLOUD_SHORTCUT_URL || 'https://www.icloud.com/shortcuts/PLACEHOLDER';

      // Show instructions modal with token displayed
      const userConfirmed = window.confirm(
        '📱 Install Trackabite Recipe Saver\n\n' +
        '✅ Token copied to clipboard!\n\n' +
        `Your token: ${config.token}\n\n` +
        '1. Tap OK to open the shortcut\n' +
        '2. Tap "Add Shortcut"\n' +
        '3. Paste token when asked (one time only!)\n\n' +
        'Token saves permanently - no paste needed after!'
      );

      if (userConfirmed) {
        // Open iCloud shortcut link (clean, no parameters)
        window.location.href = iCloudShortcutURL;

        // Mark as installed after user confirms
        setTimeout(() => {
          const installed = window.confirm('Did you successfully add the shortcut?');
          if (installed) {
            localStorage.setItem('shortcut_installed', 'true');
            alert('🎉 Great! Now you can share recipes from Instagram directly to Trackabite!');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error installing shortcut:', error);
      alert('Failed to set up shortcut. Please try again or use manual import.');
    } finally {
      setInstallingShortcut(false);
    }
  };

  return (
    <div className="saved-recipes-page">
      <div className="saved-recipes-page__main">
        <div className="saved-recipes-page__container">
          {/* Header */}
          <div className="saved-recipes-page__header" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0.5rem 0 1rem 0', marginTop: '-1rem', marginLeft: '-0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
              <button
                className="saved-recipes-page__back-button"
                onClick={() => navigate('/meal-plans/recipes')}
                style={{ marginRight: '0.5rem', marginLeft: '-0.5rem' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="saved-recipes-page__title" style={{ margin: 0, textAlign: 'left' }}>
                All imported recipes
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'flex-end' }}>
              {isIOS && !localStorage.getItem('shortcut_installed') && (
                <button
                  className="saved-recipes-page__setup-button"
                  onClick={handleQuickShortcutInstall}
                  disabled={installingShortcut}
                  style={{
                    position: 'relative',
                    backgroundColor: installingShortcut ? '#ccc' : undefined
                  }}
                >
                  {installingShortcut ? (
                    <>Installing...</>
                  ) : (
                    <>
                      📱 Quick Save
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#ff4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        !
                      </span>
                    </>
                  )}
                </button>
              )}
              <button
                className="saved-recipes-page__add-button-header"
                onClick={() => navigate('/import')}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="var(--primary-green)"/>
                  <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>


          {/* Content */}
          {loading ? (
            <div className="saved-recipes-page__loading-state">
              <div className="saved-recipes-page__spinner"></div>
              <p>Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="saved-recipes-page__empty-state">
              <div className="saved-recipes-page__empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="saved-recipes-page__empty-title">
                No imported recipes yet
              </h2>
              <p className="saved-recipes-page__empty-text">
                Start importing recipes from Instagram!
              </p>
              <div className="saved-recipes-page__empty-actions">
                <button
                  className="saved-recipes-page__cta-button"
                  onClick={() => navigate('/import')}
                >
                  Import Recipe from Instagram
                </button>
                <button
                  className="saved-recipes-page__cta-button saved-recipes-page__cta-button--secondary"
                  onClick={() => navigate('/shortcuts/setup')}
                >
                  Setup iOS Shortcut
                </button>
              </div>
            </div>
          ) : (
            <div className="saved-recipes-page__recipes-grid">
              {recipes.map(recipe => {
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

                // Get the base image URL
                const baseImageUrl = recipe.image || recipe.image_urls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

                // Use proxy for Instagram images, direct URL for others
                const imageUrl = needsProxy(baseImageUrl)
                  ? `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(baseImageUrl)}`
                  : baseImageUrl;

                // DEBUG: Log image URL selection for Instagram recipes
                if (recipe.source_type === 'instagram') {
                  console.log('[SavedRecipes] Instagram recipe image debug:', {
                    recipeId: recipe.id,
                    title: recipe.title,
                    hasImage: !!recipe.image,
                    imageValue: recipe.image?.substring(0, 100) + '...',
                    hasImageUrls: !!recipe.image_urls,
                    imageUrlsLength: recipe.image_urls?.length,
                    firstImageUrl: recipe.image_urls?.[0]?.substring(0, 100) + '...',
                    baseImageUrl: baseImageUrl.substring(0, 100) + '...',
                    needsProxy: needsProxy(baseImageUrl),
                    selectedImageUrl: imageUrl.substring(0, 100) + '...',
                    isUsingPlaceholder: baseImageUrl === 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
                    isUsingProxy: needsProxy(baseImageUrl)
                  });
                }

                return (
                  <div 
                    key={recipe.id}
                    className="saved-recipes-page__recipe-card"
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setShowDetail(true);
                    }}
                  >
                    <div className="saved-recipes-page__recipe-image">
                      <img
                        src={imageUrl}
                        alt={recipe.title}
                        onError={(e) => {
                          console.error('[SavedRecipes] Image failed to load:', {
                            recipeId: recipe.id,
                            title: recipe.title,
                            failedUrl: e.target.src,
                            sourceType: recipe.source_type
                          });
                          // Fallback to placeholder if Instagram image fails
                          if (e.target.src !== 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c') {
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                          }
                        }}
                        onLoad={(e) => {
                          if (recipe.source_type === 'instagram') {
                            console.log('[SavedRecipes] Instagram image loaded successfully:', {
                              recipeId: recipe.id,
                              title: recipe.title,
                              loadedUrl: e.target.src.substring(0, 100) + '...'
                            });
                          }
                        }}
                      />
                      {recipe.source_type === 'instagram' && (
                        <div className="saved-recipes-page__source-badge">
                          <span>Instagram</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="saved-recipes-page__recipe-content">
                      <h3>{recipe.title}</h3>
                      {recipe.source_author && (
                        <p className="saved-recipes-page__recipe-author">@{recipe.source_author}</p>
                      )}
                      
                      <div className="saved-recipes-page__recipe-meta">
                        {recipe.readyInMinutes && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M12 6V12L15 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {recipe.readyInMinutes} min
                          </span>
                        )}
                        {recipe.servings && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <rect x="5" y="6" width="14" height="13" rx="2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 12h4" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {recipe.servings} servings
                          </span>
                        )}
                      </div>
                      
                      <div className="saved-recipes-page__recipe-actions">
                        <button
                          className={`saved-recipes-page__favorite-btn ${recipe.is_favorite ? 'active' : ''}`}
                          onClick={(e) => handleToggleFavorite(recipe.id, e)}
                        >
                          {recipe.is_favorite ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#4fcf61" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          className={`saved-recipes-page__delete-btn ${deletingRecipeId === recipe.id ? 'deleting' : ''}`}
                          onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                          disabled={deletingRecipeId === recipe.id}
                          title={deletingRecipeId === recipe.id ? 'Deleting...' : 'Delete recipe'}
                        >
                          {deletingRecipeId === recipe.id ? (
                            <div className="saved-recipes-page__spinner-small">...</div>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Recipe Detail Modal */}
      {showDetail && selectedRecipe && (
        <RecipeDetailModal
          isOpen={showDetail}
          recipe={selectedRecipe}
          onClose={() => {
            setShowDetail(false);
            setSelectedRecipe(null);
          }}
          onCookNow={() => handleCookRecipe(selectedRecipe)}
          isLoading={false}
        />
      )}

      {/* Recipe Creation Modal */}
      <RecipeCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
      />

      <MobileBottomNav />
    </div>
  );
};

export default SavedRecipesPage;