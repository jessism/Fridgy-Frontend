/**
 * useCalendarSync Hook
 * Manages Google Calendar connection and meal sync state
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useCalendarSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState(null);
  const [preferences, setPreferences] = useState({
    breakfast_time: '08:00',
    lunch_time: '12:00',
    dinner_time: '19:00',
    snack_time: '15:00',
    meal_duration_minutes: 30,
    auto_sync: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem('fridgy_token');

  /**
   * Check if calendar is connected
   */
  const checkStatus = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/calendar/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
        setConnectedEmail(data.email || null);
      }
    } catch (err) {
      console.error('[CalendarSync] Error checking status:', err);
      setError('Failed to check calendar status');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user's meal time preferences
   */
  const fetchPreferences = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/calendar/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPreferences(prev => ({
            ...prev,
            ...data.preferences
          }));
        }
      }
    } catch (err) {
      console.error('[CalendarSync] Error fetching preferences:', err);
    }
  }, []);

  /**
   * Initiate Google Calendar connection (redirect to OAuth)
   */
  const connect = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Please log in first');
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/calendar/auth-url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to get authorization URL');
      }

      const data = await res.json();

      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (err) {
      console.error('[CalendarSync] Error connecting:', err);
      setError(err.message || 'Failed to connect to Google Calendar');
    }
  };

  /**
   * Disconnect Google Calendar
   */
  const disconnect = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/calendar/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setIsConnected(false);
        setConnectedEmail(null);
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (err) {
      console.error('[CalendarSync] Error disconnecting:', err);
      setError('Failed to disconnect calendar');
    }
  };

  /**
   * Update meal time preferences
   */
  const updatePreferences = async (newPrefs) => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/calendar/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPrefs)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
        return true;
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (err) {
      console.error('[CalendarSync] Error updating preferences:', err);
      setError('Failed to save preferences');
      return false;
    }
  };

  /**
   * Sync a single meal to calendar
   */
  const syncMeal = async (mealPlanId) => {
    const token = getAuthToken();
    if (!token || !isConnected) return false;

    try {
      setSyncing(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/calendar/sync/${mealPlanId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Sync failed');
      }

      return true;
    } catch (err) {
      console.error('[CalendarSync] Error syncing meal:', err);
      setError(err.message || 'Failed to sync meal');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Sync all meals for a date range
   */
  const syncWeek = async (startDate, endDate) => {
    const token = getAuthToken();
    if (!token || !isConnected) return { success: false };

    try {
      setSyncing(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/calendar/sync-week`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Sync failed');
      }

      const data = await res.json();
      return { success: true, results: data.results };
    } catch (err) {
      console.error('[CalendarSync] Error syncing week:', err);
      setError(err.message || 'Failed to sync meals');
      return { success: false };
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Remove a meal from calendar
   */
  const unsyncMeal = async (mealPlanId) => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      setError(null);

      const res = await fetch(`${API_BASE_URL}/calendar/sync/${mealPlanId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return res.ok;
    } catch (err) {
      console.error('[CalendarSync] Error unsyncing meal:', err);
      setError('Failed to remove from calendar');
      return false;
    }
  };

  /**
   * Format time for display (e.g., "08:00" -> "8:00 AM")
   */
  const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  /**
   * Get default time for a meal type
   */
  const getDefaultTimeForMeal = (mealType) => {
    const timeMap = {
      breakfast: preferences.breakfast_time,
      lunch: preferences.lunch_time,
      dinner: preferences.dinner_time,
      snack: preferences.snack_time
    };
    return timeMap[mealType] || '12:00';
  };

  // Check connection status on mount and after OAuth redirect
  useEffect(() => {
    checkStatus();
    fetchPreferences();

    // Check for OAuth callback results in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar_connected') === 'true') {
      // Remove query params from URL
      window.history.replaceState({}, '', window.location.pathname);
      checkStatus();
    } else if (params.get('calendar_error')) {
      const errorType = params.get('calendar_error');
      const errorMessages = {
        access_denied: 'Calendar access was denied',
        missing_params: 'Invalid OAuth response',
        invalid_state: 'Session expired, please try again',
        storage_failed: 'Failed to save connection',
        connection_failed: 'Connection failed, please try again'
      };
      setError(errorMessages[errorType] || 'Connection failed');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkStatus, fetchPreferences]);

  return {
    // Connection state
    isConnected,
    connectedEmail,
    loading,
    syncing,
    error,

    // Preferences
    preferences,

    // Actions
    connect,
    disconnect,
    updatePreferences,
    syncMeal,
    syncWeek,
    unsyncMeal,

    // Helpers
    formatTimeDisplay,
    getDefaultTimeForMeal,
    refresh: checkStatus,
    clearError: () => setError(null)
  };
};

export default useCalendarSync;
