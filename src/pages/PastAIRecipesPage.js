import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import './SavedRecipesPage.css'; // Reuse saved recipes styling

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PastAIRecipesPage = () => {
  const navigate = useNavigate();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deletingGenerationId, setDeletingGenerationId] = useState(null);

  useEffect(() => {
    fetchPastGenerations();
  }, []);

  const fetchPastGenerations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        console.log('No token found - user not authenticated');
        setGenerations([]);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({ limit: 20 });
      const response = await fetch(`${API_BASE_URL}/ai-recipes/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch past AI recipes');
      }

      const data = await response.json();
      console.log('Past AI recipes loaded:', data.data?.generations?.length || 0);
      setGenerations(data.data?.generations || []);
    } catch (error) {
      console.error('Error fetching past AI recipes:', error);
      setGenerations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGeneration = async (generationId, event) => {
    console.log('[Delete] Button clicked for generation:', generationId);
    event.stopPropagation();

    if (deletingGenerationId === generationId) {
      console.log('[Delete] Already deleting, ignoring');
      return;
    }

    console.log('[Delete] Setting deleting state...');
    setDeletingGenerationId(generationId);

    try {
      const token = localStorage.getItem('fridgy_token');
      console.log('[Delete] Token exists:', !!token);

      const url = `${API_BASE_URL}/ai-recipes/${generationId}`;
      console.log('[Delete] Making DELETE request to:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[Delete] Response status:', response.status);
      console.log('[Delete] Response ok:', response.ok);

      const data = await response.json();
      console.log('[Delete] Response data:', data);

      if (response.ok) {
        console.log('[Delete] Generation deleted successfully');
        setGenerations(prevGens => {
          const updated = prevGens.filter(g => g.id !== generationId);
          console.log('[Delete] Updated generations count:', updated.length);
          return updated;
        });
        if (selectedRecipe) {
          setShowDetail(false);
          setSelectedRecipe(null);
        }
      } else {
        console.error('[Delete] Failed to delete:', response.status, data);
        alert(`Failed to delete: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Delete] Error deleting generation:', error);
      alert(`Error: ${error.message}`);
    } finally {
      console.log('[Delete] Clearing deleting state');
      setDeletingGenerationId(null);
    }
  };

  const handleViewRecipe = (recipe, imageUrl) => {
    // Transform AI recipe to modal format
    const transformedRecipe = {
      id: recipe.id || Math.random().toString(36),
      title: recipe.title,
      image: imageUrl,
      servings: recipe.servings,
      readyInMinutes: parseInt(recipe.total_time) || null,
      summary: recipe.description || '',
      vegetarian: recipe.dietary_info?.vegetarian || false,
      vegan: recipe.dietary_info?.vegan || false,
      glutenFree: recipe.dietary_info?.gluten_free || false,
      dairyFree: recipe.dietary_info?.dairy_free || false,
      cuisines: recipe.cuisine_type ? [recipe.cuisine_type] : [],
      extendedIngredients: recipe.ingredients?.map(ing => ({
        name: ing.item || ing.name || '',
        amount: ing.amount || '',
        unit: ''
      })) || [],
      instructions: recipe.instructions || [],
      nutrition: recipe.nutrition || null,
      difficulty: recipe.difficulty,
      tips: recipe.tips
    };

    setSelectedRecipe(transformedRecipe);
    setShowDetail(true);
  };

  return (
    <div className="saved-recipes-page">
      <AppNavBar />

      <div className="saved-recipes-page__main">
        <div className="saved-recipes-page__container">
          {/* Header */}
          <div className="saved-recipes-page__header">
            <button
              className="saved-recipes-page__back-button"
              onClick={() => navigate('/meal-plans/recipes')}
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="saved-recipes-page__title">Your Past AI Recipes</h1>
          </div>

        {/* Loading State */}
        {loading ? (
          <div className="saved-recipes-page__loading">
            <div className="saved-recipes-page__loading-spinner"></div>
            <p>Loading your AI recipe history...</p>
          </div>
        ) : generations.length === 0 ? (
          /* Empty State */
          <div className="saved-recipes-page__empty">
            <div className="saved-recipes-page__empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="saved-recipes-page__empty-title">No AI Recipes Yet</h2>
            <p className="saved-recipes-page__empty-subtitle">
              Generate personalized recipes to see them here
            </p>
            <button
              className="saved-recipes-page__empty-button"
              onClick={() => navigate('/ai-recipes')}
            >
              Generate AI Recipes
            </button>
          </div>
        ) : (
          /* Recipe Generations Grid */
          <div className="saved-recipes-page__recipes-grid">
            {generations.flatMap((generation, genIndex) =>
              generation.recipes.map((recipe, recipeIndex) => {
                const imageUrl = generation.image_urls[recipeIndex];
                const generationId = generation.id;
                return (
                  <div
                    key={`${genIndex}-${recipeIndex}`}
                    className="saved-recipes-page__recipe-card"
                    onClick={() => handleViewRecipe(recipe, imageUrl)}
                  >
                        <div className="saved-recipes-page__recipe-image">
                          <img
                            src={imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                            alt={recipe.title}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                            }}
                          />
                          <div className="saved-recipes-page__source-badge">
                            {generation.tour_mode ? 'DEMO' : 'AI Generated'}
                          </div>
                        </div>
                        <div className="saved-recipes-page__recipe-content">
                          <h3>{recipe.title}</h3>
                          <p className="saved-recipes-page__recipe-author" style={{ color: '#999', fontSize: '0.875rem' }}>
                            {recipe.cuisine_type || ''}
                          </p>
                          <div className="saved-recipes-page__recipe-meta">
                            {recipe.total_time && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M12 6V12L15 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {recipe.total_time}
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
                            {recipe.difficulty && (
                              <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                {recipe.difficulty}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="saved-recipes-page__recipe-actions">
                            <button
                              className="saved-recipes-page__favorite-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Favorite AI recipe:', recipe.title);
                              }}
                              title="Favorite"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className={`saved-recipes-page__delete-btn ${deletingGenerationId === generationId ? 'deleting' : ''}`}
                              onClick={(e) => handleDeleteGeneration(generationId, e)}
                              disabled={deletingGenerationId === generationId}
                              title={deletingGenerationId === generationId ? 'Deleting...' : 'Delete this recipe set'}
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
              })
            )}
          </div>
        )}
        </div>
      </div>

      <MobileBottomNav />

      {/* Recipe Detail Modal */}
      {showDetail && selectedRecipe && (
        <RecipeDetailModal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedRecipe(null);
          }}
          recipe={selectedRecipe}
          isLoading={false}
          error={null}
          onCookNow={async () => {
            console.log('Cooking AI recipe:', selectedRecipe.title);
          }}
        />
      )}
    </div>
  );
};

export default PastAIRecipesPage;
