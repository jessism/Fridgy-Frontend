import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useGoogleDrive = () => {
  const getAuthToken = () => localStorage.getItem('fridgy_token');

  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState(null);
  const [autoSync, setAutoSync] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState(null);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/drive/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConnected(data.connected || false);
      setEmail(data.email || null);
      setAutoSync(data.autoSync || false);
    } catch (err) {
      console.error('Failed to check Drive status:', err);
      setError('Failed to check connection status');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSyncStats = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !connected) return;

    try {
      const response = await fetch(`${API_BASE_URL}/drive/sync-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSyncStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch sync stats:', err);
    }
  }, [connected]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (connected) {
      fetchSyncStats();
    }
  }, [connected, fetchSyncStats]);

  const connect = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Please log in first');
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/drive/auth-url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { url, error: apiError } = await response.json();
      if (apiError) {
        setError(apiError);
        return;
      }
      window.location.href = url;
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      setError('Failed to connect to Google Drive');
    }
  };

  const disconnect = async () => {
    const token = getAuthToken();
    if (!token) return;

    setError(null);
    try {
      await fetch(`${API_BASE_URL}/drive/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConnected(false);
      setEmail(null);
      setAutoSync(false);
      setSyncStats(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError('Failed to disconnect from Google Drive');
    }
  };

  const toggleAutoSync = async () => {
    const token = getAuthToken();
    if (!token) return;

    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/drive/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ autoSync: !autoSync })
      });
      const data = await response.json();
      setAutoSync(data.autoSync);
    } catch (err) {
      console.error('Failed to toggle auto-sync:', err);
      setError('Failed to update auto-sync setting');
    }
  };

  const syncRecipe = async (recipeId) => {
    const token = getAuthToken();
    if (!token) {
      setError('Please log in first');
      return;
    }

    setError(null);
    try {
      setSyncing(true);
      const response = await fetch(`${API_BASE_URL}/drive/sync/${recipeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync recipe');
      }
      await fetchSyncStats();
      return result;
    } catch (err) {
      console.error('Failed to sync recipe:', err);
      setError(err.message || 'Failed to sync recipe');
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Please log in first');
      return;
    }

    setError(null);
    try {
      setSyncing(true);
      const response = await fetch(`${API_BASE_URL}/drive/sync-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync recipes');
      }
      await fetchSyncStats();
      return result;
    } catch (err) {
      console.error('Failed to sync all:', err);
      setError(err.message || 'Failed to sync recipes');
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  const clearError = () => setError(null);

  return {
    connected,
    email,
    autoSync,
    loading,
    syncing,
    syncStats,
    error,
    connect,
    disconnect,
    toggleAutoSync,
    syncRecipe,
    syncAll,
    refresh: checkStatus,
    clearError
  };
};

export default useGoogleDrive;
