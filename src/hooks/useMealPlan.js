import { useState, useCallback } from 'react';

// API base URL with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useMealPlan = () => {
  const [plans, setPlans] = useState([]);
  const [dailyMeals, setDailyMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null
  });
  const [weekCounts, setWeekCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('fridgy_token');

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Fetch meal plans for a date range
  const fetchPlans = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams();
      if (startDate) params.append('start_date', formatDate(startDate));
      if (endDate) params.append('end_date', formatDate(endDate));

      const response = await fetch(`${API_BASE_URL}/meal-plans?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meal plans');
      }

      const data = await response.json();
      setPlans(data.plans || []);
      return data.plans || [];
    } catch (err) {
      console.error('Error fetching meal plans:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch meal plans for a specific date
  const fetchDailyMeals = useCallback(async (date) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formattedDate = formatDate(date);
      const response = await fetch(`${API_BASE_URL}/meal-plans/date/${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch daily meals');
      }

      const data = await response.json();
      setDailyMeals(data.meals || {
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null
      });
      return data.meals;
    } catch (err) {
      console.error('Error fetching daily meals:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch week counts for calendar indicators
  const fetchWeekCounts = useCallback(async (startDate, endDate) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      });

      const response = await fetch(`${API_BASE_URL}/meal-plans/week-counts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch week counts');
      }

      const data = await response.json();
      setWeekCounts(data.counts || {});
      return data.counts || {};
    } catch (err) {
      console.error('Error fetching week counts:', err);
      return {};
    }
  }, []);

  // Add a recipe to a meal slot
  const addRecipeToSlot = useCallback(async (date, mealType, recipe, recipeSource = 'saved') => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create recipe snapshot for non-saved recipes (includes all fields for RecipeDetailModal)
      const recipeSnapshot = {
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        source_type: recipe.source_type || recipeSource,
        extendedIngredients: recipe.extendedIngredients || [],
        analyzedInstructions: recipe.analyzedInstructions || [],
        nutrition: recipe.nutrition || null,
        source_author: recipe.source_author || null,
        source_url: recipe.source_url || null,
        servings: recipe.servings || 1,
        summary: recipe.summary || null
      };

      const response = await fetch(`${API_BASE_URL}/meal-plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formatDate(date),
          meal_type: mealType,
          recipe_id: recipeSource === 'saved' ? recipe.id : null,
          recipe_source: recipeSource,
          recipe_snapshot: recipeSnapshot
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add recipe to slot');
      }

      const data = await response.json();

      // Update local state
      setDailyMeals(prev => ({
        ...prev,
        [mealType]: data.plan
      }));

      return data.plan;
    } catch (err) {
      console.error('Error adding recipe to slot:', err);
      throw err;
    }
  }, []);

  // Remove a recipe from a meal slot
  const removeFromSlot = useCallback(async (planId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/meal-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove meal plan');
      }

      // Update local state - find and remove the plan
      setDailyMeals(prev => {
        const updated = { ...prev };
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack']) {
          if (updated[mealType]?.id === planId) {
            updated[mealType] = null;
            break;
          }
        }
        return updated;
      });

      return true;
    } catch (err) {
      console.error('Error removing from slot:', err);
      throw err;
    }
  }, []);

  // Mark a meal as completed (cooked)
  const completeMeal = useCallback(async (planId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/meal-plans/${planId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to complete meal');
      }

      const data = await response.json();

      // Update local state
      setDailyMeals(prev => {
        const updated = { ...prev };
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack']) {
          if (updated[mealType]?.id === planId) {
            updated[mealType] = data.plan;
            break;
          }
        }
        return updated;
      });

      return data;
    } catch (err) {
      console.error('Error completing meal:', err);
      throw err;
    }
  }, []);

  // Swap recipe in a slot (convenience function)
  const swapRecipe = useCallback(async (date, mealType, newRecipe, recipeSource = 'saved') => {
    // Simply add the new recipe - the backend handles the upsert
    return addRecipeToSlot(date, mealType, newRecipe, recipeSource);
  }, [addRecipeToSlot]);

  // Update a meal's scheduled time
  const updateMealTime = useCallback(async (planId, scheduledTime) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/meal-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduled_time: scheduledTime })
      });

      if (!response.ok) {
        throw new Error('Failed to update meal time');
      }

      const data = await response.json();

      // Update local state
      setDailyMeals(prev => {
        const updated = { ...prev };
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack']) {
          if (updated[mealType]?.id === planId) {
            updated[mealType] = data.plan;
            break;
          }
        }
        return updated;
      });

      return data.plan;
    } catch (err) {
      console.error('Error updating meal time:', err);
      throw err;
    }
  }, []);

  return {
    // State
    plans,
    dailyMeals,
    weekCounts,
    loading,
    error,

    // Actions
    fetchPlans,
    fetchDailyMeals,
    fetchWeekCounts,
    addRecipeToSlot,
    removeFromSlot,
    completeMeal,
    swapRecipe,
    updateMealTime,

    // Utilities
    formatDate
  };
};

export default useMealPlan;
