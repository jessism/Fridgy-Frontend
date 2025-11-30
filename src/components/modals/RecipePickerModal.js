import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Clock } from 'lucide-react';
import './RecipePickerModal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecipePickerModal = ({ isOpen, onClose, onSelect, mealType }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState({
    saved: [],
    ai: [],
    suggestions: []
  });
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem('fridgy_token');

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

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return needsProxy(imageUrl)
      ? `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl;
  };

  // Fetch recipes from all sources
  const fetchRecipes = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);

    try {
      // Fetch all sources in parallel
      const [savedRes, aiRes, suggestionsRes] = await Promise.allSettled([
        // Saved recipes
        fetch(`${API_BASE_URL}/saved-recipes?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        // AI recipes
        fetch(`${API_BASE_URL}/ai-recipes/history?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        // Spoonacular suggestions
        fetch(`${API_BASE_URL}/recipes/suggestions?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const newRecipes = {
        saved: [],
        ai: [],
        suggestions: []
      };

      // Process saved recipes
      if (savedRes.status === 'fulfilled' && savedRes.value.ok) {
        const data = await savedRes.value.json();
        newRecipes.saved = (data.recipes || []).map(r => ({
          ...r,
          source: 'saved'
        }));
      }

      // Process AI recipes
      if (aiRes.status === 'fulfilled' && aiRes.value.ok) {
        const data = await aiRes.value.json();
        // AI recipes might be nested
        const aiRecipesList = data.recipes || data.history || [];
        newRecipes.ai = aiRecipesList.flatMap(item => {
          // Handle both flat recipes and recipe arrays
          if (item.recipes && Array.isArray(item.recipes)) {
            return item.recipes.map(r => ({ ...r, source: 'ai' }));
          }
          return [{ ...item, source: 'ai' }];
        }).filter(r => r.title);
      }

      // Process suggestions
      if (suggestionsRes.status === 'fulfilled' && suggestionsRes.value.ok) {
        const data = await suggestionsRes.value.json();
        newRecipes.suggestions = (data.suggestions || []).map(r => ({
          ...r,
          source: 'suggestion'
        }));
      }

      setRecipes(newRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recipes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
      setSearchQuery('');
      setActiveTab('all');
    }
  }, [isOpen, fetchRecipes]);

  // Get filtered recipes based on tab and search
  const getFilteredRecipes = () => {
    let result = [];

    if (activeTab === 'all') {
      result = [...recipes.saved, ...recipes.ai, ...recipes.suggestions];
    } else if (activeTab === 'saved') {
      result = recipes.saved;
    } else if (activeTab === 'ai') {
      result = recipes.ai;
    } else if (activeTab === 'suggestions') {
      result = recipes.suggestions;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title?.toLowerCase().includes(query)
      );
    }

    return result;
  };

  const handleRecipeClick = (recipe) => {
    // Immediately add the recipe to the meal slot (no confirmation needed)
    onSelect(recipe, recipe.source);
  };

  const getMealTypeLabel = () => {
    const labels = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack'
    };
    return labels[mealType] || 'Meal';
  };

  const getSourceBadge = (source) => {
    const badges = {
      saved: { label: 'Saved', className: 'recipe-picker-modal__badge--saved' },
      ai: { label: 'AI', className: 'recipe-picker-modal__badge--ai' },
      suggestion: { label: 'Suggested', className: 'recipe-picker-modal__badge--suggestion' }
    };
    return badges[source] || badges.saved;
  };

  if (!isOpen) return null;

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="recipe-picker-modal__overlay" onClick={onClose}>
      <div className="recipe-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="recipe-picker-modal__header">
          <button className="recipe-picker-modal__close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <h2 className="recipe-picker-modal__title">
            Add to {getMealTypeLabel()}
          </h2>
          <div style={{ width: 32 }} /> {/* Spacer for centering */}
        </div>

        {/* Search Bar */}
        <div className="recipe-picker-modal__search">
          <Search size={18} className="recipe-picker-modal__search-icon" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="recipe-picker-modal__search-input"
          />
        </div>

        {/* Source Tabs */}
        <div className="recipe-picker-modal__tabs">
          {['all', 'saved', 'ai', 'suggestions'].map((tab) => (
            <button
              key={tab}
              className={`recipe-picker-modal__tab ${activeTab === tab ? 'recipe-picker-modal__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All' : tab === 'saved' ? 'Saved' : tab === 'ai' ? 'AI' : 'Suggestions'}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="recipe-picker-modal__content">
          {loading ? (
            <div className="recipe-picker-modal__loading">
              Loading recipes...
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="recipe-picker-modal__empty">
              <p>No recipes found</p>
              {activeTab !== 'all' && (
                <button
                  className="recipe-picker-modal__empty-btn"
                  onClick={() => setActiveTab('all')}
                >
                  View all recipes
                </button>
              )}
            </div>
          ) : (
            <div className="recipe-picker-modal__grid">
              {filteredRecipes.map((recipe, index) => {
                const badge = getSourceBadge(recipe.source);
                const imageUrl = getImageUrl(recipe.image || recipe.image_urls?.[0]);

                return (
                  <div
                    key={`${recipe.source}-${recipe.id}-${index}`}
                    className="recipe-picker-modal__card"
                    onClick={() => handleRecipeClick(recipe)}
                  >
                    <div className="recipe-picker-modal__card-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={recipe.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="recipe-picker-modal__card-placeholder">
                          <span>🍽️</span>
                        </div>
                      )}
                      <span className={`recipe-picker-modal__badge ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="recipe-picker-modal__card-info">
                      <h4 className="recipe-picker-modal__card-title">{recipe.title}</h4>
                      {recipe.readyInMinutes && (
                        <div className="recipe-picker-modal__card-meta">
                          <Clock size={12} />
                          <span>{recipe.readyInMinutes} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RecipePickerModal;
