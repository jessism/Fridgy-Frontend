import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import recipeCache from '../services/RecipeCache';
import { generateInventoryFingerprint, generateCacheKey, hasInventoryChanged } from '../utils/inventoryFingerprint';
import { safeJSONStringify } from '../utils/jsonSanitizer';
import useInventory from './useInventory';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useRecipes = () => {
  const { user } = useAuth();
  const { items: inventoryItems } = useInventory();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastFingerprint, setLastFingerprint] = useState(null);

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

    const { forceRefresh = false } = options;

    try {
      // Generate fingerprint from current inventory
      const currentFingerprint = generateInventoryFingerprint(inventoryItems);
      const cacheKey = generateCacheKey(user.id, currentFingerprint);
      
      console.log('🔍 Inventory fingerprint:', currentFingerprint);
      console.log('🔍 Cache key:', cacheKey);
      
      // Check if we can use cached data
      if (!forceRefresh && cacheKey) {
        const cachedData = recipeCache.get(cacheKey);
        
        if (cachedData && cachedData.recipes) {
          console.log('✨ Using cached recipes:', cachedData.recipes.length, 'recipes');
          console.log('📅 Cached at:', new Date(cachedData.timestamp).toLocaleString());
          
          setSuggestions(cachedData.recipes);
          setIsFromCache(true);
          setLastFingerprint(currentFingerprint);
          setLoading(false);
          setError(null);
          
          // Return cached recipes
          return cachedData.recipes;
        }
      }
      
      // No valid cache or force refresh - fetch from API
      console.log('🔄 ' + (forceRefresh ? 'Force refresh requested' : 'No cache found') + ', fetching from API...');
      
      setLoading(true);
      setError(null);
      setIsFromCache(false);
      
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
        
        const recipes = response.suggestions || [];
        setSuggestions(recipes);
        setLastFingerprint(currentFingerprint);
        
        // Cache the fresh results
        if (cacheKey && recipes.length > 0) {
          const cached = recipeCache.set(cacheKey, recipes, {
            inventoryCount: inventoryItems.length,
            fingerprint: currentFingerprint,
            fetchOptions: { limit, ranking, minMatch }
          });
          
          if (cached) {
            console.log('💾 Recipes cached successfully');
          }
        }
        
        return recipes;
      } else {
        throw new Error(response.error || 'Failed to fetch recipe suggestions');
      }
    } catch (err) {
      console.error('❌ Error fetching recipe suggestions:', err);
      console.error('❌ Error details:', err.message);
      setError(err.message);
      
      // Try to use stale cache as fallback
      if (!forceRefresh && lastFingerprint) {
        const fallbackKey = generateCacheKey(user.id, lastFingerprint);
        const staleCache = recipeCache.get(fallbackKey);
        
        if (staleCache && staleCache.recipes) {
          console.log('⚠️ Using stale cache as fallback');
          setSuggestions(staleCache.recipes);
          setIsFromCache(true);
          return staleCache.recipes;
        }
      }
      
      setSuggestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, inventoryItems, lastFingerprint]);

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
        body: safeJSONStringify({
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
    console.log('🔄 Force refreshing recipe suggestions...');
    return fetchSuggestions({ ...options, forceRefresh: true });
  }, [fetchSuggestions]);
  
  // Invalidate cache for current inventory
  const invalidateCache = useCallback(() => {
    if (!user || !inventoryItems) return;
    
    const fingerprint = generateInventoryFingerprint(inventoryItems);
    const cacheKey = generateCacheKey(user.id, fingerprint);
    
    if (cacheKey) {
      recipeCache.invalidate(cacheKey);
      console.log('🗑️ Recipe cache invalidated for current inventory');
    }
  }, [user, inventoryItems]);
  
  // Clear all cache for user
  const clearUserCache = useCallback(() => {
    if (!user) return;
    
    recipeCache.invalidateUser(user.id);
    console.log('🗑️ All recipe cache cleared for user');
  }, [user]);
  
  // Check if inventory has changed since last fetch
  useEffect(() => {
    if (!user || !inventoryItems || inventoryItems.length === 0) return;
    
    const currentFingerprint = generateInventoryFingerprint(inventoryItems);
    
    // If fingerprint changed, we'll fetch new recipes on next call
    if (lastFingerprint && hasInventoryChanged(lastFingerprint, currentFingerprint)) {
      console.log('📦 Inventory changed, recipes will refresh on next fetch');
      // Don't auto-fetch here, let the component decide when to fetch
    }
  }, [inventoryItems, lastFingerprint, user]);

  return {
    // Data
    suggestions,
    selectedRecipe,
    
    // Loading states
    loading,
    detailsLoading,
    error,
    isFromCache,
    
    // Core methods
    fetchSuggestions,
    fetchRecipeDetails,
    markRecipeCooked,
    refreshSuggestions,
    
    // Cache methods
    invalidateCache,
    clearUserCache,
    
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