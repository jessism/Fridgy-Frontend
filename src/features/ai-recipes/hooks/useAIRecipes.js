import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { safeJSONStringify } from '../../../utils/jsonSanitizer';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useAIRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, completed, failed

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

  // Check for cached recipes
  const checkCachedRecipes = useCallback(async () => {
    if (!user) return null;

    try {
      console.log('🔍 Checking for cached AI recipes...');
      
      const response = await apiRequest('/ai-recipes/cached');
      
      if (response.success && response.data) {
        console.log('✅ Found cached recipes:', response.data.recipes.length);
        return response.data;
      }
      
      console.log('🚫 No cached recipes found');
      return null;

    } catch (err) {
      console.error('❌ Error checking cached recipes:', err);
      return null; // Don't throw error for cache check
    }
  }, [user]);

  // Generate new AI recipes with questionnaire data
  const generateRecipes = useCallback(async (questionnaireData = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      setGenerationStatus('generating');
      
      console.log('🤖 Starting AI recipe generation...');
      console.log('📋 Questionnaire data:', questionnaireData);
      
      const response = await apiRequest('/ai-recipes/generate', {
        method: 'POST',
        body: safeJSONStringify(questionnaireData)
      });

      if (response.success && response.data) {
        console.log('✅ AI recipes generated successfully:', response.data.recipes.length);
        setRecipes(response.data.recipes);
        setGenerationStatus('completed');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to generate recipes');
      }

    } catch (err) {
      console.error('❌ Error generating recipes:', err);
      setError(err.message);
      setGenerationStatus('failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load recipes (cached first, then generate if needed)
  const loadRecipes = useCallback(async (forceRegenerate = false, questionnaireData = {}) => {
    if (!user) {
      setError('Please log in to generate recipes');
      return;
    }

    try {
      setError(null);
      
      // Always generate new recipes when questionnaire data is provided
      const hasQuestionnaireData = Object.keys(questionnaireData).length > 0;
      
      // Check cache first unless forced regeneration or questionnaire data provided
      if (!forceRegenerate && !hasQuestionnaireData) {
        setLoading(true);
        const cachedData = await checkCachedRecipes();
        
        if (cachedData) {
          console.log('⚡ Using cached recipes');
          setRecipes(cachedData.recipes);
          setGenerationStatus('completed');
          setLoading(false);
          return cachedData;
        }
      }

      // Generate new recipes if no cache, forced, or questionnaire data provided
      console.log(forceRegenerate ? '🔄 Forcing recipe regeneration...' : 
                  hasQuestionnaireData ? '🚀 Generating recipes with questionnaire data...' :
                  '🚀 No cache found, generating new recipes...');
      return await generateRecipes(questionnaireData);

    } catch (error) {
      console.error('❌ Error loading recipes:', error);
      setError(error.message);
      setGenerationStatus('failed');
      setLoading(false);
    }
  }, [user, checkCachedRecipes, generateRecipes]);

  // Clear cache and regenerate
  const regenerateRecipes = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🗑️ Clearing recipe cache...');
      
      // Clear cache on server
      await apiRequest('/ai-recipes/cache', {
        method: 'DELETE'
      });

      console.log('✅ Cache cleared, generating new recipes...');
      
      // Generate new recipes
      return await loadRecipes(true);

    } catch (err) {
      console.error('❌ Error regenerating recipes:', err);
      setError(err.message);
      throw err;
    }
  }, [user, loadRecipes]);

  // Get analytics (for debugging/admin)
  const getAnalytics = useCallback(async () => {
    if (!user) return null;

    try {
      const response = await apiRequest('/ai-recipes/analytics');
      return response.data;
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      return null;
    }
  }, [user]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // Clear recipes state
  const clearRecipes = useCallback(() => {
    setRecipes([]);
    setGenerationStatus('idle');
    setError(null);
  }, []);

  // Check if we have valid recipes
  const hasRecipes = recipes.length > 0;

  // Check if recipes are fresh (less than 12 hours old)
  const areRecipesFresh = useCallback(() => {
    if (!hasRecipes) return false;
    
    // This would need to be tracked in state when recipes are loaded
    // For now, assume they're fresh if we have them
    return true;
  }, [hasRecipes]);

  return {
    // Data
    recipes,
    hasRecipes,
    
    // State
    loading,
    error,
    generationStatus, // idle, generating, completed, failed
    
    // Actions
    loadRecipes,
    generateRecipes,
    regenerateRecipes,
    checkCachedRecipes,
    clearRecipes,
    clearError,
    
    // Utilities
    areRecipesFresh,
    getAnalytics
  };
};

export default useAIRecipes;