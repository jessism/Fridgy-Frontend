import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileBottomNav from '../components/MobileBottomNav';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import './SavedRecipesPage.css';

const SavedRecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  useEffect(() => {
    fetchRecipes();
  }, [filter, searchQuery]);
  
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('fridgy_token');
      
      // If no token, don't try to fetch - user is not logged in
      if (!token) {
        console.log('No token found - user not authenticated');
        setRecipes([]);
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        filter,
        search: searchQuery,
        limit: 50
      });
      
      const response = await fetch(`http://localhost:5000/api/saved-recipes?${params}`, {
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
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleFavorite = async (recipeId, event) => {
    event.stopPropagation();
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`http://localhost:5000/api/saved-recipes/${recipeId}/favorite`, {
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
      const response = await fetch(`http://localhost:5000/api/saved-recipes/${recipeId}`, {
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
      await fetch(`http://localhost:5000/api/saved-recipes/${recipe.id}/cook`, {
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
            <h1 className="saved-recipes-page__title">My Cookbook 📚</h1>
            <button 
              className="saved-recipes-page__setup-button"
              onClick={() => navigate('/shortcuts/setup')}
            >
              📱 Setup Import
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="saved-recipes-page__search-section">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="saved-recipes-page__search-input"
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="saved-recipes-page__filter-tabs">
            <button 
              className={`saved-recipes-page__tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({recipes.length})
            </button>
            <button 
              className={`saved-recipes-page__tab ${filter === 'instagram' ? 'active' : ''}`}
              onClick={() => setFilter('instagram')}
            >
              📷 Instagram
            </button>
            <button 
              className={`saved-recipes-page__tab ${filter === 'favorites' ? 'active' : ''}`}
              onClick={() => setFilter('favorites')}
            >
              ❤️ Favorites
            </button>
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
                {filter === 'favorites' 
                  ? "No favorite recipes yet"
                  : filter === 'instagram'
                  ? "No Instagram recipes saved"
                  : "No saved recipes yet"}
              </h2>
              <p className="saved-recipes-page__empty-text">
                {filter === 'favorites' 
                  ? "Mark recipes as favorites to see them here"
                  : "Start saving recipes from Instagram!"}
              </p>
              <button 
                className="saved-recipes-page__cta-button"
                onClick={() => navigate('/shortcuts/setup')}
              >
                Setup Instagram Import
              </button>
            </div>
          ) : (
            <div className="saved-recipes-page__recipes-grid">
              {recipes.map(recipe => {
                const imageUrl = recipe.image || 
                               recipe.image_urls?.[0] || 
                               'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                
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
                      <img src={imageUrl} alt={recipe.title} />
                      {recipe.source_type === 'instagram' && (
                        <div className="saved-recipes-page__source-badge">
                          <span>📷 Instagram</span>
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
                          {recipe.is_favorite ? '❤️' : '🤍'}
                        </button>
                        <button 
                          className="saved-recipes-page__delete-btn"
                          onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                        >
                          🗑️
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
      
      <MobileBottomNav />
    </div>
  );
};

export default SavedRecipesPage;