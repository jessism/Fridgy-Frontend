import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { safeJSONStringify } from '../utils/jsonSanitizer';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    allergies: [],
    custom_allergies: '',
    preferred_cuisines: [],
    cooking_time_preference: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

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

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences({
        dietary_restrictions: [],
        allergies: [],
        custom_allergies: '',
        preferred_cuisines: [],
        cooking_time_preference: ''
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching user preferences for user:', user.id);
      
      const response = await apiRequest('/user-preferences');
      
      if (response.success) {
        console.log('✅ Preferences fetched successfully:', response.hasPreferences);
        setPreferences(response.preferences);
        setHasPreferences(response.hasPreferences);
      } else {
        throw new Error(response.error || 'Failed to fetch preferences');
      }
    } catch (err) {
      console.error('❌ Error fetching preferences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save user preferences
  const savePreferences = async (newPreferences) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);
      
      console.log('🔄 Saving user preferences:', newPreferences);
      
      const response = await apiRequest('/user-preferences', {
        method: 'POST',
        body: safeJSONStringify(newPreferences),
      });

      if (response.success) {
        console.log('✅ Preferences saved successfully');
        setPreferences(response.preferences);
        setHasPreferences(true);
        setLastSaved(new Date());
        return response.preferences;
      } else {
        throw new Error(response.error || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('❌ Error saving preferences:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Update a specific preference field
  const updatePreference = useCallback(async (field, value) => {
    const newPreferences = {
      ...preferences,
      [field]: value
    };
    
    try {
      await savePreferences(newPreferences);
    } catch (error) {
      // Error is already handled in savePreferences
      console.error('Failed to update preference:', field, error);
    }
  }, [preferences]);

  // Add to array preference (for multi-select fields)
  const addToPreference = useCallback(async (field, value) => {
    if (!Array.isArray(preferences[field])) {
      console.error(`Field ${field} is not an array`);
      return;
    }

    const currentArray = preferences[field];
    if (!currentArray.includes(value)) {
      const newArray = [...currentArray, value];
      await updatePreference(field, newArray);
    }
  }, [preferences, updatePreference]);

  // Remove from array preference (for multi-select fields)
  const removeFromPreference = useCallback(async (field, value) => {
    if (!Array.isArray(preferences[field])) {
      console.error(`Field ${field} is not an array`);
      return;
    }

    const currentArray = preferences[field];
    const newArray = currentArray.filter(item => item !== value);
    await updatePreference(field, newArray);
  }, [preferences, updatePreference]);

  // Toggle array preference (add if not present, remove if present)
  const togglePreference = useCallback(async (field, value) => {
    if (!Array.isArray(preferences[field])) {
      console.error(`Field ${field} is not an array`);
      return;
    }

    const currentArray = preferences[field];
    if (currentArray.includes(value)) {
      await removeFromPreference(field, value);
    } else {
      await addToPreference(field, value);
    }
  }, [preferences, addToPreference, removeFromPreference]);

  // Delete all preferences
  const deletePreferences = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await apiRequest('/user-preferences', {
        method: 'DELETE',
      });

      if (response.success) {
        console.log('✅ Preferences deleted successfully');
        setPreferences({
          dietary_restrictions: [],
          allergies: [],
          custom_allergies: '',
          preferred_cuisines: [],
          cooking_time_preference: ''
        });
        setHasPreferences(false);
        setLastSaved(new Date());
      } else {
        throw new Error(response.error || 'Failed to delete preferences');
      }
    } catch (err) {
      console.error('❌ Error deleting preferences:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if preferences have any data
  const hasAnyPreferences = useCallback(() => {
    return preferences.dietary_restrictions.length > 0 ||
           preferences.allergies.length > 0 ||
           preferences.custom_allergies.trim() !== '' ||
           preferences.preferred_cuisines.length > 0 ||
           preferences.cooking_time_preference !== '';
  }, [preferences]);

  // Fetch preferences on mount and when user changes
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    // Data
    preferences,
    hasPreferences,
    lastSaved,
    
    // States
    loading,
    saving,
    error,
    
    // Actions
    fetchPreferences,
    savePreferences,
    updatePreference,
    addToPreference,
    removeFromPreference,
    togglePreference,
    deletePreferences,
    clearError,
    
    // Utilities
    hasAnyPreferences
  };
};

export default useUserPreferences;