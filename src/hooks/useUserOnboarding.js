import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { safeJSONStringify } from '../utils/jsonSanitizer';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useUserOnboarding = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState({
    primary_goal: '',
    household_size: 1,
    weekly_budget: null,
    budget_currency: 'USD',
    notification_preferences: {
      mealReminders: false,
      expirationAlerts: true,
      weeklyReports: false
    },
    onboarding_completed: false,
    onboarding_version: '1.0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasOnboardingData, setHasOnboardingData] = useState(false);
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

  // Fetch user onboarding data
  const fetchOnboardingData = useCallback(async () => {
    if (!user) {
      setOnboardingData({
        primary_goal: '',
        household_size: 1,
        weekly_budget: null,
        budget_currency: 'USD',
        notification_preferences: {
          mealReminders: false,
          expirationAlerts: true,
          weeklyReports: false
        },
        onboarding_completed: false,
        onboarding_version: '1.0'
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching user onboarding data for user:', user.id);

      const response = await apiRequest('/onboarding/user-onboarding');

      if (response.success) {
        console.log('✅ Onboarding data fetched successfully:', response.hasOnboardingData);

        if (response.hasOnboardingData && response.onboardingData) {
          setOnboardingData(response.onboardingData);
          setHasOnboardingData(true);
        } else {
          // No onboarding data found, use defaults
          setHasOnboardingData(false);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch onboarding data');
      }
    } catch (err) {
      console.error('❌ Error fetching onboarding data:', err);
      setError(err.message);
      setHasOnboardingData(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save user onboarding data
  const saveOnboardingData = async (newData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      console.log('🔄 Saving user onboarding data:', newData);

      const response = await apiRequest('/onboarding/complete', {
        method: 'POST',
        body: safeJSONStringify(newData),
      });

      if (response.success) {
        console.log('✅ Onboarding data saved successfully');
        setOnboardingData(response.data);
        setHasOnboardingData(true);
        setLastSaved(new Date());
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to save onboarding data');
      }
    } catch (err) {
      console.error('❌ Error saving onboarding data:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Update a specific onboarding field
  const updateOnboardingField = useCallback(async (field, value) => {
    const newData = {
      ...onboardingData,
      [field]: value
    };

    try {
      await saveOnboardingData(newData);
    } catch (error) {
      // Error is already handled in saveOnboardingData
      console.error('Failed to update onboarding field:', field, error);
    }
  }, [onboardingData]);

  // Update notification preferences
  const updateNotificationPreference = useCallback(async (prefKey, value) => {
    const newNotificationPrefs = {
      ...onboardingData.notification_preferences,
      [prefKey]: value
    };

    await updateOnboardingField('notification_preferences', newNotificationPrefs);
  }, [onboardingData.notification_preferences, updateOnboardingField]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if onboarding data has any meaningful content
  const hasAnyOnboardingData = useCallback(() => {
    return onboardingData.primary_goal !== '' ||
           onboardingData.household_size !== 1 ||
           onboardingData.weekly_budget !== null ||
           onboardingData.onboarding_completed;
  }, [onboardingData]);

  // Get formatted goal display text
  const getFormattedGoal = useCallback(() => {
    const goalMap = {
      'save_money': 'Save money',
      'reduce_waste': 'Reduce waste',
      'eat_healthy': 'Eat healthier',
      'save_time': 'Save time',
      'try_recipes': 'Try new recipes',
      'organize': 'Get organized',
      'skipped': 'Not specified'
    };
    return goalMap[onboardingData.primary_goal] || onboardingData.primary_goal;
  }, [onboardingData.primary_goal]);

  // Get formatted budget display text
  const getFormattedBudget = useCallback(() => {
    if (!onboardingData.weekly_budget) return 'Not specified';
    return `$${onboardingData.weekly_budget} ${onboardingData.budget_currency}/week`;
  }, [onboardingData.weekly_budget, onboardingData.budget_currency]);

  // Get formatted household size display text
  const getFormattedHouseholdSize = useCallback(() => {
    const size = onboardingData.household_size;
    return size === 1 ? '1 person' : `${size} people`;
  }, [onboardingData.household_size]);

  // Fetch onboarding data on mount and when user changes
  useEffect(() => {
    fetchOnboardingData();
  }, [fetchOnboardingData]);

  return {
    // Data
    onboardingData,
    hasOnboardingData,
    lastSaved,

    // States
    loading,
    saving,
    error,

    // Actions
    fetchOnboardingData,
    saveOnboardingData,
    updateOnboardingField,
    updateNotificationPreference,
    clearError,

    // Utilities
    hasAnyOnboardingData,
    getFormattedGoal,
    getFormattedBudget,
    getFormattedHouseholdSize
  };
};

export default useUserOnboarding;