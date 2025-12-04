import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Clock } from 'lucide-react';
import './RecipePickerModal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecipePickerModal = ({ isOpen, onClose, onSelect, mealType }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState({
    imported: [],
    uploaded: [],
    ai: []
  });
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle close with animation
  const handleClose = () => {
    if (isClosing) return; // Prevent double-close
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250); // Match the slideDown animation duration
  };

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
      const [importedRes, uploadedRes, aiRes] = await Promise.allSettled([
        // Imported recipes (from Instagram/TikTok)
        fetch(`${API_BASE_URL}/saved-recipes?filter=imported&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        // Uploaded recipes (manually added)
        fetch(`${API_BASE_URL}/saved-recipes?filter=uploaded&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        // AI recipes
        fetch(`${API_BASE_URL}/ai-recipes/history?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const newRecipes = {
        imported: [],
        uploaded: [],
        ai: []
      };

      // Process imported recipes
      if (importedRes.status === 'fulfilled' && importedRes.value.ok) {
        const data = await importedRes.value.json();
        newRecipes.imported = (data.recipes || []).map(r => ({
          ...r,
          source: 'imported'
        }));
      }

      // Process uploaded recipes
      if (uploadedRes.status === 'fulfilled' && uploadedRes.value.ok) {
        const data = await uploadedRes.value.json();
        newRecipes.uploaded = (data.recipes || []).map(r => ({
          ...r,
          source: 'uploaded'
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
      result = [...recipes.imported, ...recipes.uploaded, ...recipes.ai];
    } else if (activeTab === 'imported') {
      result = recipes.imported;
    } else if (activeTab === 'uploaded') {
      result = recipes.uploaded;
    } else if (activeTab === 'ai') {
      result = recipes.ai;
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
      imported: { label: 'Imported', className: 'recipe-picker-modal__badge--saved' },
      uploaded: { label: 'Uploaded', className: 'recipe-picker-modal__badge--suggestion' },
      ai: { label: 'AI', className: 'recipe-picker-modal__badge--ai' }
    };
    return badges[source] || badges.imported;
  };

  if (!isOpen) return null;

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="recipe-picker-modal__overlay" onClick={handleClose}>
      <div className={`recipe-picker-modal ${isClosing ? 'recipe-picker-modal--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="recipe-picker-modal__header">
          <button className="recipe-picker-modal__close-btn" onClick={handleClose}>
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
          {['all', 'imported', 'uploaded', 'ai'].map((tab) => (
            <button
              key={tab}
              className={`recipe-picker-modal__tab ${activeTab === tab ? 'recipe-picker-modal__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All' : tab === 'imported' ? 'Imported' : tab === 'uploaded' ? 'Uploaded' : 'AI'}
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
