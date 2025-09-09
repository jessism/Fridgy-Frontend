import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import useInventory from './useInventory';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useEdamamTest = () => {
  const { user } = useAuth();
  const { items: inventoryItems } = useInventory();
  const [edamamSuggestions, setEdamamSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEdamamSuggestions = useCallback(async (options = {}) => {
    if (!user || !inventoryItems || inventoryItems.length === 0) {
      console.log('🧪 Skipping Edamam test - no user or inventory');
      setEdamamSuggestions([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('fridgy_token');
      const limit = options.limit || 8;
      
      const response = await fetch(
        `${API_BASE_URL}/recipes/edamam-test/suggestions?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        console.log('🧪 Edamam test results:', {
          count: data.suggestions.length,
          source: data.source
        });
        
        setEdamamSuggestions(data.suggestions || []);
      } else {
        throw new Error(data.error || 'Failed to fetch Edamam recipes');
      }
    } catch (err) {
      console.error('🧪 Edamam test error:', err);
      setError(err.message);
      setEdamamSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [user, inventoryItems]);

  // Auto-fetch when inventory changes
  useEffect(() => {
    if (inventoryItems?.length > 0) {
      fetchEdamamSuggestions();
    }
  }, [inventoryItems, fetchEdamamSuggestions]);

  const clearError = () => setError(null);

  const refreshSuggestions = () => {
    fetchEdamamSuggestions({ limit: 8 });
  };

  // Get high-match recipes (similar to useRecipes)
  const getHighMatchRecipes = (threshold = 30) => {
    return edamamSuggestions.filter(recipe => recipe.matchPercentage >= threshold);
  };

  return {
    suggestions: edamamSuggestions,
    loading,
    error,
    fetchSuggestions: fetchEdamamSuggestions,
    getHighMatchRecipes,
    clearError,
    refreshSuggestions
  };
};

export default useEdamamTest;