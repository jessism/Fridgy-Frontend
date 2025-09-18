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
      setRecipes(data.recipes || []);
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
    event.stopPropagation();
    if (!window.confirm('Delete this recipe from your cookbook?')) return;
    
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/saved-recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== recipeId));
        if (selectedRecipe?.id === recipeId) {
          setShowDetail(false);
          setSelectedRecipe(null);
        }
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
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

  return (
    <div className="saved-recipes-page">
      <div className="saved-recipes-page__main">
        <div className="saved-recipes-page__container">
          {/* Header */}
          <div className="saved-recipes-page__header">
            <button
              className="saved-recipes-page__back-button"
              onClick={() => navigate('/meal-plans')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="saved-recipes-page__title">My recipe</h1>
            <div className="saved-recipes-page__header-actions">
              <button
                className="saved-recipes-page__setup-button"
                onClick={() => navigate('/shortcuts/setup')}
              >
                Setup Shortcut
              </button>
            </div>
          </div>

          {/* Your own recipe section */}
          <div className="saved-recipes-page__custom-section">
            <div className="saved-recipes-page__section-header">
              <h2 className="saved-recipes-page__section-title">My uploaded recipe</h2>
              <button
                className="saved-recipes-page__add-button"
                onClick={() => setShowCreationModal(true)}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" fill="var(--primary-green)"/>
                  <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="saved-recipes-page__custom-container-wrapper">
              <div className="saved-recipes-page__custom-container-left">
                <div className="saved-recipes-page__custom-container">
                  <div className="saved-recipes-page__plus-icon">+</div>
                </div>
                <p className="saved-recipes-page__container-label">Create your recipe</p>
              </div>
              <div className="saved-recipes-page__custom-container-right">
                {scannedRecipes.length > 0 ? (
                  <div
                    className="saved-recipes-page__custom-container saved-recipes-page__scanned-recipe"
                    onClick={() => {
                      setSelectedRecipe(scannedRecipes[0]);
                      setShowDetail(true);
                    }}
                  >
                    <img
                      src={scannedRecipes[0].image || scannedRecipes[0].image_urls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                      alt={scannedRecipes[0].title}
                      className="saved-recipes-page__scanned-thumbnail"
                      onError={(e) => {
                        console.error('[SavedRecipes] Scanned recipe image failed to load:', {
                          recipeId: scannedRecipes[0].id,
                          title: scannedRecipes[0].title,
                          failedUrl: e.target.src,
                          sourceType: scannedRecipes[0].source_type
                        });
                        if (e.target.src !== 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c') {
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="saved-recipes-page__custom-container">
                    {/* Empty container when no scanned recipes */}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Your imported recipe section */}
          <div className="saved-recipes-page__import-section">
            <div className="saved-recipes-page__section-header">
              <h2 className="saved-recipes-page__section-title">My imported recipe</h2>
              <button
                className="saved-recipes-page__add-button"
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
                No saved recipes yet
              </h2>
              <p className="saved-recipes-page__empty-text">
                Start saving recipes from Instagram!
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
                          <span>⏱️ {recipe.readyInMinutes} min</span>
                        )}
                        {recipe.servings && (
                          <span>🍽️ {recipe.servings} servings</span>
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
                          className="saved-recipes-page__delete-btn"
                          onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
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