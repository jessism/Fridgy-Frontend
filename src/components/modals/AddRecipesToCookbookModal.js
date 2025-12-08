import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRecipesToCookbookModal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AddRecipesToCookbookModal = ({ isOpen, onClose, cookbook, onComplete }) => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddNewSlideUp, setShowAddNewSlideUp] = useState(false);

  // Fetch all user recipes
  const fetchRecipes = useCallback(async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/saved-recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedRecipes([]);
      setSearchQuery('');
      setLoading(true);
      fetchRecipes();
    }
  }, [isOpen, fetchRecipes]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleRecipe = (recipe) => {
    setSelectedRecipes(prev => {
      const isSelected = prev.some(r => r.id === recipe.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const handleAddSelected = async () => {
    if (selectedRecipes.length === 0) {
      onComplete();
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('fridgy_token');
      const recipesToAdd = selectedRecipes.map(r => ({
        recipe_id: r.id,
        recipe_source: 'saved'
      }));

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbook.id}/recipes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipes: recipesToAdd })
      });

      if (!response.ok) {
        throw new Error('Failed to add recipes');
      }

      onComplete(selectedRecipes.length);
    } catch (err) {
      console.error('Error adding recipes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleImportFromInternet = () => {
    setShowAddNewSlideUp(false);
    onClose();
    navigate('/import', { state: { cookbookId: cookbook?.id, cookbookName: cookbook?.name } });
  };

  const handleUploadRecipe = () => {
    setShowAddNewSlideUp(false);
    onClose();
    navigate('/recipe-scanner', { state: { cookbookId: cookbook?.id, cookbookName: cookbook?.name } });
  };

  // Filter recipes by search query
  const filteredRecipes = recipes.filter(recipe => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      recipe.title?.toLowerCase().includes(query) ||
      recipe.source_author?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="add-recipes-modal__overlay" onClick={handleOverlayClick}>
      <div className="add-recipes-modal__content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="add-recipes-modal__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="add-recipes-modal__header">
          <h2>Add Recipes to "{cookbook?.name}"</h2>
          <p>Select recipes to add to your cookbook</p>
        </div>

        {/* Search */}
        <div className="add-recipes-modal__search">
          <svg className="add-recipes-modal__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="add-recipes-modal__search-input"
          />
        </div>

        {/* Recipe list */}
        <div className="add-recipes-modal__list">
          {loading ? (
            <div className="add-recipes-modal__loading">
              <div className="add-recipes-modal__spinner"></div>
              <p>Loading recipes...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="add-recipes-modal__empty">
              {searchQuery ? (
                <p>No recipes match your search</p>
              ) : (
                <p>You don't have any saved recipes yet</p>
              )}
            </div>
          ) : (
            filteredRecipes.map(recipe => {
              const isSelected = selectedRecipes.some(r => r.id === recipe.id);
              return (
                <div
                  key={recipe.id}
                  className={`add-recipes-modal__item ${isSelected ? 'add-recipes-modal__item--selected' : ''}`}
                  onClick={() => toggleRecipe(recipe)}
                >
                  <div className="add-recipes-modal__item-image">
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} />
                    ) : (
                      <div className="add-recipes-modal__item-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                          <path d="M21 15l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 15l-3-3-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="add-recipes-modal__item-info">
                    <h4>{recipe.title}</h4>
                    {recipe.source_author && (
                      <p className="add-recipes-modal__item-author">@{recipe.source_author}</p>
                    )}
                  </div>
                  <div className={`add-recipes-modal__checkbox ${isSelected ? 'add-recipes-modal__checkbox--checked' : ''}`}>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.5 3.5L5.5 10L2.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add new recipe link */}
        <div className="add-recipes-modal__add-new" onClick={() => setShowAddNewSlideUp(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Add new recipe</span>
        </div>

        {/* Footer */}
        <div className="add-recipes-modal__footer">
          <div className="add-recipes-modal__selected-count">
            {selectedRecipes.length > 0 && (
              <span>{selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="add-recipes-modal__actions">
            <button
              className="add-recipes-modal__button add-recipes-modal__button--secondary"
              onClick={handleSkip}
              disabled={saving}
            >
              Skip for Now
            </button>
            <button
              className="add-recipes-modal__button add-recipes-modal__button--primary"
              onClick={handleAddSelected}
              disabled={saving || selectedRecipes.length === 0}
            >
              {saving ? 'Adding...' : `Add Selected`}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Recipe Slide-up */}
      {showAddNewSlideUp && (
        <div className="add-recipes-modal__slideup-overlay" onClick={() => setShowAddNewSlideUp(false)}>
          <div className="add-recipes-modal__slideup" onClick={(e) => e.stopPropagation()}>
            <div className="add-recipes-modal__slideup-handle"></div>
            <div className="add-recipes-modal__slideup-options">
              <button className="add-recipes-modal__slideup-option" onClick={handleImportFromInternet}>
                <div className="add-recipes-modal__slideup-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4fcf61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <span className="add-recipes-modal__slideup-option-label">Import from the internet</span>
              </button>
              <button className="add-recipes-modal__slideup-option" onClick={handleUploadRecipe}>
                <div className="add-recipes-modal__slideup-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4fcf61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <span className="add-recipes-modal__slideup-option-label">Upload Recipe</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecipesToCookbookModal;
