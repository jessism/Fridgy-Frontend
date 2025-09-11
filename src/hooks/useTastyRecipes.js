import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import useInventory from './useInventory';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useTastyRecipes = () => {
  const { user } = useAuth();
  const { items: inventoryItems } = useInventory();
  const [tastySuggestions, setTastySuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTastySuggestions = useCallback(async (options = {}) => {
    if (!user || !inventoryItems || inventoryItems.length === 0) {
      console.log('🍳 Skipping Tasty test - no user or inventory');
      setTastySuggestions([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('fridgy_token');
      const limit = options.limit || 8;
      
      const response = await fetch(
        `${API_BASE_URL}/recipes/tasty-test/suggestions?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        console.log('🍳 Tasty test results:', {
          count: data.suggestions.length,
          source: data.source,
          hasVideos: data.suggestions.some(s => s.video_url)
        });
        
        setTastySuggestions(data.suggestions || []);
      } else {
        throw new Error(data.error || 'Failed to fetch Tasty recipes');
      }
    } catch (err) {
      console.error('🍳 Tasty test error:', err);
      setError(err.message);
      setTastySuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [user, inventoryItems]);

  // Auto-fetch when inventory changes
  useEffect(() => {
    if (inventoryItems?.length > 0) {
      fetchTastySuggestions();
    }
  }, [inventoryItems, fetchTastySuggestions]);

  const clearError = () => setError(null);

  const refreshSuggestions = () => {
    fetchTastySuggestions({ limit: 8 });
  };

  // Get high-match recipes (similar to useRecipes)
  const getHighMatchRecipes = (threshold = 30) => {
    return tastySuggestions.filter(recipe => recipe.matchPercentage >= threshold);
  };

  // Get recipes with videos (unique to Tasty!)
  const getRecipesWithVideos = () => {
    return tastySuggestions.filter(recipe => recipe.video_url);
  };

  return {
    suggestions: tastySuggestions,
    loading,
    error,
    fetchSuggestions: fetchTastySuggestions,
    getHighMatchRecipes,
    getRecipesWithVideos,
    clearError,
    refreshSuggestions
  };
};

export default useTastyRecipes;