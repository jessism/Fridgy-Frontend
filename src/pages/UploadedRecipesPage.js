import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileBottomNav from '../components/MobileBottomNav';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import RecipeCreationModal from '../components/modals/RecipeCreationModal';
import './UploadedRecipesPage.css';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UploadedRecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchRecipes();
  }, []); // Intentionally fetch only on mount

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        console.log('No token found - user not authenticated');
        setRecipes([]);
        setLoading(false);
        return;
      }

      await fetchUploadedRecipes(token);
    } catch (error) {
      console.error('Error in fetchRecipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedRecipes = async (token) => {
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
          navigate('/signin');
          return;
        }
        console.error('Failed to fetch recipes:', response.status);
        setRecipes([]);
        return;
      }

      const data = await response.json();

      // Filter to only show uploaded/manual recipes
      const uploadedRecipes = (data.recipes || []).filter(recipe => {
        const sourceType = recipe.source_type?.toLowerCase();
        // Include manual/uploaded recipes
        return sourceType === 'manual' ||
               recipe.import_method === 'manual' ||
               recipe.source_author === 'Me' ||
               sourceType === 'scanned' ||
               sourceType === 'voice' ||
               sourceType === 'user_created' ||
               (!sourceType && !recipe.source_type && recipe.source_author === 'Me');
      });

      console.log('[UploadedRecipes] Filtered uploaded recipes:', {
        total: data.recipes?.length,
        uploaded: uploadedRecipes.length
      });

      // Debug: Check image URLs in the received recipes
      if (uploadedRecipes.length > 0) {
        console.log('[UploadedRecipes] Checking image URLs in recipes:');
        uploadedRecipes.forEach((recipe, index) => {
          console.log(`[UploadedRecipes] Recipe ${index + 1}: "${recipe.title}"`, {
            hasImage: !!recipe.image,
            imageURL: recipe.image || 'NO IMAGE',
            id: recipe.id
          });
        });
      }

      setRecipes(uploadedRecipes);
    } catch (error) {
      console.error('Error fetching uploaded recipes:', error);
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

    if (deletingRecipeId === recipeId) {
      console.log('[Delete] Already deleting this recipe, ignoring click');
      return;
    }

    console.log('[Delete] Deleting recipe immediately...');
    setDeletingRecipeId(recipeId);

    try {
      const token = localStorage.getItem('fridgy_token');
      const url = `${API_BASE_URL}/saved-recipes/${recipeId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('[Delete] Recipe deleted successfully');
        setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== recipeId));
        if (selectedRecipe?.id === recipeId) {
          setShowDetail(false);
          setSelectedRecipe(null);
        }
      } else {
        const errorText = await response.text();
        console.error('[Delete] Server error:', response.status, errorText);
        // Don't show alert - just log the error
        console.error(`Failed to delete recipe: ${response.status} - ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Delete] Exception caught:', error);
      // Don't show alert - just log the error
      console.error(`Failed to delete recipe: ${error.message}`);
    } finally {
      setDeletingRecipeId(null);
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
    <div className="uploaded-recipes-page">
      <div className="uploaded-recipes-page__main">
        <div className="uploaded-recipes-page__container">
          {/* Header */}
          <div className="uploaded-recipes-page__header" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0.5rem 0 1rem 0', marginTop: '-1rem', marginLeft: '-0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
              <button
                className="uploaded-recipes-page__back-button"
                onClick={() => navigate('/meal-plans/recipes')}
                style={{ marginRight: '0.5rem', marginLeft: '-0.5rem' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="uploaded-recipes-page__title" style={{ margin: 0, textAlign: 'left' }}>
                All uploaded recipes
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'flex-end' }}>
              <button
                className="uploaded-recipes-page__add-button-header"
                onClick={() => setShowCreationModal(true)}
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
            <div className="uploaded-recipes-page__loading-state">
              <div className="uploaded-recipes-page__spinner"></div>
              <p>Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="uploaded-recipes-page__empty-state">
              <div className="uploaded-recipes-page__empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="uploaded-recipes-page__empty-title">
                No uploaded recipes yet
              </h2>
              <p className="uploaded-recipes-page__empty-text">
                Create your first recipe!
              </p>
              <div className="uploaded-recipes-page__empty-actions">
                <button
                  className="uploaded-recipes-page__cta-button"
                  onClick={() => setShowCreationModal(true)}
                >
                  Create Recipe
                </button>
              </div>
            </div>
          ) : (
            <div className="uploaded-recipes-page__recipes-grid">
              {recipes.map(recipe => {
                const imageUrl = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

                // Debug log for each recipe card
                console.log(`[UploadedRecipes] Rendering recipe card: "${recipe.title}"`, {
                  recipeId: recipe.id,
                  hasImage: !!recipe.image,
                  originalImage: recipe.image,
                  displayingImage: imageUrl
                });

                return (
                  <div
                    key={recipe.id}
                    className="uploaded-recipes-page__recipe-card"
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setShowDetail(true);
                    }}
                  >
                    <div className="uploaded-recipes-page__recipe-image">
                      <img
                        src={imageUrl}
                        alt={recipe.title}
                        onError={(e) => {
                          if (e.target.src !== 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c') {
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                          }
                        }}
                      />
                    </div>

                    <div className="uploaded-recipes-page__recipe-content">
                      <h3>{recipe.title}</h3>
                      {recipe.source_author && (
                        <p className="uploaded-recipes-page__recipe-author">@{recipe.source_author}</p>
                      )}

                      <div className="uploaded-recipes-page__recipe-meta">
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

                      <div className="uploaded-recipes-page__recipe-actions">
                        <button
                          className={`uploaded-recipes-page__favorite-btn ${recipe.is_favorite ? 'active' : ''}`}
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
                          className={`uploaded-recipes-page__delete-btn ${deletingRecipeId === recipe.id ? 'deleting' : ''}`}
                          onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                          disabled={deletingRecipeId === recipe.id}
                          title={deletingRecipeId === recipe.id ? 'Deleting...' : 'Delete recipe'}
                        >
                          {deletingRecipeId === recipe.id ? (
                            <div className="uploaded-recipes-page__spinner-small">...</div>
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

      <MobileBottomNav currentRoute="meals" />

      {showDetail && selectedRecipe && (
        <RecipeDetailModal
          isOpen={showDetail}
          recipe={selectedRecipe}
          onClose={() => {
            setShowDetail(false);
            setSelectedRecipe(null);
          }}
          onCook={() => handleCookRecipe(selectedRecipe)}
          onDelete={async (recipeId) => {
            // Create a proper event object for handleDeleteRecipe
            await handleDeleteRecipe(recipeId, { stopPropagation: () => {} });
            // The modal will close automatically if deletion is successful
            // because handleDeleteRecipe sets selectedRecipe to null
          }}
        />
      )}

      {showCreationModal && (
        <RecipeCreationModal
          onClose={() => setShowCreationModal(false)}
          onSave={() => {
            setShowCreationModal(false);
            fetchRecipes();
          }}
          onImport={() => {
            setShowCreationModal(false);
            navigate('/import');
          }}
          onManual={() => {
            setShowCreationModal(false);
            navigate('/recipes/manual');
          }}
          onScan={() => {
            setShowCreationModal(false);
            navigate('/recipes/scan');
          }}
        />
      )}
    </div>
  );
};

export default UploadedRecipesPage;