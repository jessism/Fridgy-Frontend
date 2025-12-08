import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Trash2 } from 'lucide-react';
import AddRecipesToCookbookModal from '../components/modals/AddRecipesToCookbookModal';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import ShareCookbookModal from '../components/modals/ShareCookbookModal';
import ClockIcon from '../assets/icons/Clock.png';
import ServingIcon from '../assets/icons/Serving.png';
import './CookbookDetailPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CookbookDetailPage = () => {
  const { cookbookId } = useParams();
  const navigate = useNavigate();

  const [cookbook, setCookbook] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showAddRecipesModal, setShowAddRecipesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const fetchCookbook = useCallback(async () => {
    if (!cookbookId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCookbook(data.cookbook);
        setRecipes(data.cookbook?.recipes || []);
      } else {
        // Cookbook not found, navigate back
        navigate('/meals/recipes');
      }
    } catch (err) {
      console.error('Error fetching cookbook:', err);
      navigate('/meals/recipes');
    } finally {
      setLoading(false);
    }
  }, [cookbookId, navigate]);

  useEffect(() => {
    fetchCookbook();
  }, [fetchCookbook]);

  const handleRemoveRecipe = async (recipe) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const url = `${API_BASE_URL}/cookbooks/${cookbookId}/recipes/${recipe.id}?recipe_source=saved`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setRecipes(prev => prev.filter(r => r.id !== recipe.id));
      }
    } catch (err) {
      console.error('Error removing recipe:', err);
    }
  };

  const handleDeleteCookbook = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        navigate('/meals/recipes');
      }
    } catch (err) {
      console.error('Error deleting cookbook:', err);
      alert('Failed to delete cookbook. Please try again.');
    }
  };

  const handleShareCookbook = () => {
    setShowBottomSheet(false);
    setShowShareModal(true);
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const handleAddRecipesComplete = () => {
    setShowAddRecipesModal(false);
    fetchCookbook(); // Refresh to show new recipes
  };

  if (loading) {
    return (
      <div className="cookbook-detail-page">
        <div className="cookbook-detail-page__loading">
          <div className="cookbook-detail-page__spinner"></div>
          <p>Loading cookbook...</p>
        </div>
      </div>
    );
  }

  if (!cookbook) {
    return (
      <div className="cookbook-detail-page">
        <div className="cookbook-detail-page__loading">
          <p>Cookbook not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cookbook-detail-page">
      {/* Header */}
      <div className="cookbook-detail-page__header">
        <button
          className="cookbook-detail-page__back-btn"
          onClick={() => navigate('/meals/recipes')}
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="cookbook-detail-page__title" title={cookbook.name}>
          {cookbook.name}
        </h1>

        <div className="cookbook-detail-page__header-actions">
          <button
            className="cookbook-detail-page__add-btn"
            onClick={() => setShowAddRecipesModal(true)}
            aria-label="Add recipes"
          >
            +
          </button>
          <button
            className="cookbook-detail-page__more-btn"
            onClick={() => setShowBottomSheet(true)}
            aria-label="More options"
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="cookbook-detail-page__content">
        {/* Recipe count */}
        <p className="cookbook-detail-page__count">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </p>

        {/* Recipe grid */}
        {recipes.length === 0 ? (
          <div className="cookbook-detail-page__empty">
            <div className="cookbook-detail-page__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>No recipes yet</h3>
            <p>Add some recipes to your cookbook to get started</p>
            <button
              className="cookbook-detail-page__add-first-btn"
              onClick={() => setShowAddRecipesModal(true)}
            >
              + Add Recipes
            </button>
          </div>
        ) : (
          <div className="cookbook-detail-page__grid">
            {recipes.map(recipe => (
              <div
                key={recipe.id}
                className="cookbook-detail-page__recipe-card"
                onClick={() => handleRecipeClick(recipe)}
              >
                <div className="cookbook-detail-page__recipe-image">
                  {recipe.image ? (
                    <img src={recipe.image} alt={recipe.title} />
                  ) : (
                    <div className="cookbook-detail-page__recipe-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <path d="M21 15l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <button
                    className="cookbook-detail-page__remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecipe(recipe);
                    }}
                    title="Remove from cookbook"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="cookbook-detail-page__recipe-info">
                  <h4>{recipe.title}</h4>
                  {recipe.source_author && (
                    <p className="cookbook-detail-page__recipe-author">@{recipe.source_author}</p>
                  )}
                  <div className="cookbook-detail-page__recipe-meta">
                    {recipe.readyInMinutes && (
                      <span>
                        <img src={ClockIcon} alt="Time" width="14" height="14" />
                        {recipe.readyInMinutes} min
                      </span>
                    )}
                    {recipe.servings && (
                      <span>
                        <img src={ServingIcon} alt="Servings" width="14" height="14" />
                        {recipe.servings} servings
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <div
          className="cookbook-detail-page__bottom-sheet-overlay"
          onClick={() => setShowBottomSheet(false)}
        >
          <div
            className="cookbook-detail-page__bottom-sheet"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="cookbook-detail-page__bottom-sheet-option"
              onClick={handleShareCookbook}
            >
              <span>SHARE COOKBOOK</span>
              <Users size={20} />
            </button>
            <button
              className="cookbook-detail-page__bottom-sheet-option"
              onClick={() => {
                setShowBottomSheet(false);
                setShowDeleteConfirm(true);
              }}
            >
              <span>DELETE COOKBOOK</span>
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="cookbook-detail-page__confirm-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="cookbook-detail-page__confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete "{cookbook.name}"?</h3>
            <p>This will remove the cookbook but not the recipes themselves.</p>
            <div className="cookbook-detail-page__confirm-actions">
              <button
                className="cookbook-detail-page__confirm-btn cookbook-detail-page__confirm-btn--cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="cookbook-detail-page__confirm-btn cookbook-detail-page__confirm-btn--delete"
                onClick={handleDeleteCookbook}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipes Modal */}
      <AddRecipesToCookbookModal
        isOpen={showAddRecipesModal}
        onClose={() => setShowAddRecipesModal(false)}
        cookbook={cookbook}
        onComplete={handleAddRecipesComplete}
      />

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          isOpen={isRecipeModalOpen}
          onClose={() => {
            setIsRecipeModalOpen(false);
            setSelectedRecipe(null);
          }}
        />
      )}

      {/* Share Cookbook Modal */}
      <ShareCookbookModal
        cookbook={cookbook}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default CookbookDetailPage;
