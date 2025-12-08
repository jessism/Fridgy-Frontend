import React, { useState, useEffect, useCallback } from 'react';
import './CookbookDetailView.css';
import ClockIcon from '../assets/icons/Clock.png';
import ServingIcon from '../assets/icons/Serving.png';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CookbookDetailView = ({
  cookbook,
  onBack,
  onAddRecipes,
  onDeleteCookbook,
  onRecipeClick,
  onRemoveRecipe
}) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editName, setEditName] = useState(cookbook?.name || '');

  const fetchCookbookRecipes = useCallback(async () => {
    if (!cookbook?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbook.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.cookbook?.recipes || []);
      }
    } catch (err) {
      console.error('Error fetching cookbook recipes:', err);
    } finally {
      setLoading(false);
    }
  }, [cookbook?.id]);

  useEffect(() => {
    fetchCookbookRecipes();
  }, [fetchCookbookRecipes]);

  const handleRemoveRecipe = async (recipe) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const url = `${API_BASE_URL}/cookbooks/${cookbook.id}/recipes/${recipe.id}?recipe_source=saved`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setRecipes(prev => prev.filter(r => r.id !== recipe.id));
        if (onRemoveRecipe) onRemoveRecipe(recipe);
      }
    } catch (err) {
      console.error('Error removing recipe:', err);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName.trim() === cookbook.name) {
      setShowEditName(false);
      return;
    }

    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbook.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editName.trim() })
      });

      if (response.ok) {
        cookbook.name = editName.trim();
      }
    } catch (err) {
      console.error('Error updating cookbook name:', err);
    } finally {
      setShowEditName(false);
    }
  };

  const handleDelete = () => {
    if (onDeleteCookbook) {
      onDeleteCookbook(cookbook);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="cookbook-detail">
      {/* Header */}
      <div className="cookbook-detail__header">
        <button className="cookbook-detail__back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back</span>
        </button>

        <div className="cookbook-detail__actions">
          <button
            className="cookbook-detail__action-btn"
            onClick={() => {
              setEditName(cookbook.name);
              setShowEditName(true);
            }}
            title="Edit name"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="cookbook-detail__action-btn cookbook-detail__action-btn--danger"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete cookbook"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="cookbook-detail__title-section">
        {showEditName ? (
          <div className="cookbook-detail__edit-name">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="cookbook-detail__name-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') setShowEditName(false);
              }}
            />
            <button className="cookbook-detail__save-btn" onClick={handleSaveName}>
              Save
            </button>
            <button
              className="cookbook-detail__cancel-btn"
              onClick={() => setShowEditName(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <h1 className="cookbook-detail__title">{cookbook?.name}</h1>
        )}
        <p className="cookbook-detail__count">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>

      {/* Add recipes button */}
      <button className="cookbook-detail__add-btn" onClick={onAddRecipes}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Add Recipes
      </button>

      {/* Recipe grid */}
      <div className="cookbook-detail__recipes">
        {loading ? (
          <div className="cookbook-detail__loading">
            <div className="cookbook-detail__spinner"></div>
            <p>Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="cookbook-detail__empty">
            <div className="cookbook-detail__empty-icon">
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
          </div>
        ) : (
          <div className="cookbook-detail__grid">
            {recipes.map(recipe => (
              <div
                key={recipe.id}
                className="cookbook-detail__recipe-card"
                onClick={() => onRecipeClick && onRecipeClick(recipe)}
              >
                <div className="cookbook-detail__recipe-image">
                  {recipe.image ? (
                    <img src={recipe.image} alt={recipe.title} />
                  ) : (
                    <div className="cookbook-detail__recipe-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <path d="M21 15l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <button
                    className="cookbook-detail__remove-btn"
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
                <div className="cookbook-detail__recipe-info">
                  <h4>{recipe.title}</h4>
                  {recipe.source_author && (
                    <p className="cookbook-detail__recipe-author">@{recipe.source_author}</p>
                  )}
                  <div className="cookbook-detail__recipe-meta">
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

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="cookbook-detail__confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="cookbook-detail__confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete "{cookbook?.name}"?</h3>
            <p>This will remove the cookbook but not the recipes themselves.</p>
            <div className="cookbook-detail__confirm-actions">
              <button
                className="cookbook-detail__confirm-btn cookbook-detail__confirm-btn--cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="cookbook-detail__confirm-btn cookbook-detail__confirm-btn--delete"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookbookDetailView;
