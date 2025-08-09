import { useState, useCallback } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useRecipes = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('fridgy_token');
  };

  // API request helper with authentication
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  };

  // Fetch recipe suggestions based on user's inventory
  const fetchSuggestions = useCallback(async (options = {}) => {
    if (!user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching recipe suggestions for user:', user.id);
      console.log('🔄 Token available:', !!getToken());
      console.log('🔄 API URL:', `${API_BASE_URL}/recipes/suggestions`);

      const {
        limit = 12,
        ranking = 1, // 1 = maximize used ingredients, 2 = minimize missing ingredients
        minMatch = 0 // Minimum match percentage filter
      } = options;

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        ranking: ranking.toString(),
        minMatch: minMatch.toString()
      });
      
      const response = await apiRequest(`/recipes/suggestions?${queryParams}`);
      
      if (response.success) {
        console.log('✅ Recipe suggestions fetched successfully:', response.suggestions.length, 'recipes');
        setSuggestions(response.suggestions || []);
        return response.suggestions;
      } else {
        throw new Error(response.error || 'Failed to fetch recipe suggestions');
      }
    } catch (err) {
      console.error('❌ Error fetching recipe suggestions:', err);
      console.error('❌ Error details:', err.message);
      setError(err.message);
      setSuggestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch detailed recipe information
  const fetchRecipeDetails = async (recipeId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setDetailsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching recipe details for ID:', recipeId);
      
      const response = await apiRequest(`/recipes/${recipeId}`);
      
      if (response.success) {
        console.log('✅ Recipe details fetched successfully:', response.recipe.title);
        setSelectedRecipe(response.recipe);
        return response.recipe;
      } else {
        throw new Error(response.error || 'Failed to fetch recipe details');
      }
    } catch (err) {
      console.error('❌ Error fetching recipe details:', err);
      setError(err.message);
      throw err;
    } finally {
      setDetailsLoading(false);
    }
  };

  // Mark a recipe as cooked (will eventually update inventory)
  const markRecipeCooked = async (recipeId, usedIngredients = []) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      console.log('🔄 Marking recipe as cooked:', recipeId);
      
      const response = await apiRequest(`/recipes/${recipeId}/cook`, {
        method: 'POST',
        body: JSON.stringify({
          usedIngredients: usedIngredients
        }),
      });

      if (response.success) {
        console.log('✅ Recipe marked as cooked successfully');
        // TODO: Refresh inventory and suggestions after cooking
        return response;
      } else {
        throw new Error(response.error || 'Failed to mark recipe as cooked');
      }
    } catch (err) {
      console.error('❌ Error marking recipe as cooked:', err);
      setError(err.message);
      throw err;
    }
  };

  // Filter suggestions by match percentage
  const getHighMatchRecipes = useCallback((minMatch = 70) => {
    return suggestions.filter(recipe => recipe.matchPercentage >= minMatch);
  }, [suggestions]);

  // Get recipes that are marked as "in stock" (high ingredient availability)
  const getInStockRecipes = useCallback(() => {
    return suggestions.filter(recipe => recipe.inStock);
  }, [suggestions]);

  // Sort suggestions by different criteria
  const sortSuggestions = useCallback((sortBy = 'match') => {
    const sorted = [...suggestions];
    
    switch (sortBy) {
      case 'match':
        return sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
      case 'usedIngredients':
        return sorted.sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);
      case 'missingIngredients':
        return sorted.sort((a, b) => a.missedIngredientCount - b.missedIngredientCount);
      default:
        return sorted;
    }
  }, [suggestions]);

  // Check service health
  const checkServiceHealth = async () => {
    try {
      const response = await apiRequest('/recipes/health');
      return response;
    } catch (err) {
      console.error('❌ Error checking recipe service health:', err);
      throw err;
    }
  };

  // Clear current recipe details
  const clearSelectedRecipe = useCallback(() => {
    setSelectedRecipe(null);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh suggestions (convenience method)
  const refreshSuggestions = useCallback((options = {}) => {
    console.log('🔄 Refreshing recipe suggestions...');
    return fetchSuggestions(options);
  }, [fetchSuggestions]);

  return {
    // Data
    suggestions,
    selectedRecipe,
    
    // Loading states
    loading,
    detailsLoading,
    error,
    
    // Core methods
    fetchSuggestions,
    fetchRecipeDetails,
    markRecipeCooked,
    refreshSuggestions,
    
    // Utility methods
    getHighMatchRecipes,
    getInStockRecipes,
    sortSuggestions,
    clearSelectedRecipe,
    clearError,
    checkServiceHealth,
    
    // Computed properties
    hasError: !!error,
    hasSuggestions: suggestions.length > 0,
    highMatchCount: getHighMatchRecipes().length,
    inStockCount: getInStockRecipes().length
  };
};

export default useRecipes;