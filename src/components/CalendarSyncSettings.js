/**
 * CalendarSyncSettings Component
 * Allows users to connect Google Calendar and configure meal sync preferences
 * Available to all users
 */

import React, { useState } from 'react';
import useCalendarSync from '../hooks/useCalendarSync';
import './CalendarSyncSettings.css';

const CalendarSyncSettings = () => {
  const {
    isConnected,
    connectedEmail,
    loading,
    syncing,
    error,
    preferences,
    connect,
    disconnect,
    updatePreferences,
    syncWeek,
    formatTimeDisplay,
    clearError
  } = useCalendarSync();

  const [localPrefs, setLocalPrefs] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);

  // Initialize local prefs from hook
  React.useEffect(() => {
    if (preferences && !localPrefs) {
      setLocalPrefs(preferences);
    }
  }, [preferences, localPrefs]);

  const handleConnect = async () => {
    clearError();
    await connect();
  };

  const handleDisconnect = async () => {
    if (window.confirm('Disconnect Google Calendar? Your synced events will remain in your calendar.')) {
      setDisconnecting(true);
      await disconnect();
      setDisconnecting(false);
    }
  };

  const handleTimeChange = (mealType, value) => {
    const key = `${mealType}_time`;
    setLocalPrefs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDurationChange = (value) => {
    setLocalPrefs(prev => ({
      ...prev,
      meal_duration_minutes: parseInt(value)
    }));
  };

  const handleAutoSyncToggle = () => {
    setLocalPrefs(prev => ({
      ...prev,
      auto_sync: !prev.auto_sync
    }));
  };

  const handleSavePreferences = async () => {
    if (!localPrefs) return;

    const success = await updatePreferences(localPrefs);
    if (success) {
      setSaveMessage('Preferences saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleSyncWeek = async () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const result = await syncWeek(formatDate(startOfWeek), formatDate(endOfWeek));
    if (result.success) {
      const syncedCount = (result.results?.synced || 0) + (result.results?.updated || 0);
      setSaveMessage(`Synced ${syncedCount} meals to calendar!`);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="calendar-sync-settings">
        <div className="calendar-sync-settings__loading">
          <div className="calendar-sync-settings__spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-sync-settings">
      {/* Connection Status Section */}
      <div className="calendar-sync-settings__section">
        <h3 className="calendar-sync-settings__section-title">Google Calendar</h3>

        {!isConnected ? (
          <div className="calendar-sync-settings__connect-card">
            <div className="calendar-sync-settings__google-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div className="calendar-sync-settings__connect-info">
              <p className="calendar-sync-settings__connect-text">
                Connect your Google Calendar to sync your meal plans
              </p>
            </div>
            <button
              className="calendar-sync-settings__connect-button"
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
        ) : (
          <div className="calendar-sync-settings__connected-card">
            <div className="calendar-sync-settings__connected-status">
              <div className="calendar-sync-settings__status-dot"></div>
              <span className="calendar-sync-settings__connected-text">Connected</span>
            </div>
            <p className="calendar-sync-settings__connected-email">{connectedEmail}</p>
            <button
              className="calendar-sync-settings__disconnect-button"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        )}

        {error && (
          <div className="calendar-sync-settings__error">
            {error}
          </div>
        )}
      </div>

      {/* Preferences Section - Only show when connected */}
      {isConnected && localPrefs && (
        <>
          <div className="calendar-sync-settings__section">
            <h3 className="calendar-sync-settings__section-title">Default Meal Times</h3>
            <p className="calendar-sync-settings__section-description">
              Set when each meal appears on your calendar
            </p>

            <div className="calendar-sync-settings__time-pickers">
              <div className="calendar-sync-settings__time-row">
                <span className="calendar-sync-settings__time-label">Breakfast</span>
                <input
                  type="time"
                  className="calendar-sync-settings__time-input"
                  value={localPrefs.breakfast_time || '08:00'}
                  onChange={(e) => handleTimeChange('breakfast', e.target.value)}
                />
              </div>

              <div className="calendar-sync-settings__time-row">
                <span className="calendar-sync-settings__time-label">Lunch</span>
                <input
                  type="time"
                  className="calendar-sync-settings__time-input"
                  value={localPrefs.lunch_time || '12:00'}
                  onChange={(e) => handleTimeChange('lunch', e.target.value)}
                />
              </div>

              <div className="calendar-sync-settings__time-row">
                <span className="calendar-sync-settings__time-label">Dinner</span>
                <input
                  type="time"
                  className="calendar-sync-settings__time-input"
                  value={localPrefs.dinner_time || '19:00'}
                  onChange={(e) => handleTimeChange('dinner', e.target.value)}
                />
              </div>

              <div className="calendar-sync-settings__time-row">
                <span className="calendar-sync-settings__time-label">Snack</span>
                <input
                  type="time"
                  className="calendar-sync-settings__time-input"
                  value={localPrefs.snack_time || '15:00'}
                  onChange={(e) => handleTimeChange('snack', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="calendar-sync-settings__section">
            <h3 className="calendar-sync-settings__section-title">Event Duration</h3>
            <div className="calendar-sync-settings__duration-row">
              <span className="calendar-sync-settings__duration-label">
                Calendar events will be
              </span>
              <select
                className="calendar-sync-settings__duration-select"
                value={localPrefs.meal_duration_minutes || 30}
                onChange={(e) => handleDurationChange(e.target.value)}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>

          <div className="calendar-sync-settings__section">
            <div className="calendar-sync-settings__toggle-row">
              <div className="calendar-sync-settings__toggle-info">
                <span className="calendar-sync-settings__toggle-label">Auto-sync new meals</span>
                <span className="calendar-sync-settings__toggle-description">
                  Automatically add meals to calendar when planned
                </span>
              </div>
              <label className="calendar-sync-settings__toggle">
                <input
                  type="checkbox"
                  checked={localPrefs.auto_sync || false}
                  onChange={handleAutoSyncToggle}
                />
                <span className="calendar-sync-settings__toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="calendar-sync-settings__actions">
            <button
              className="calendar-sync-settings__save-button"
              onClick={handleSavePreferences}
            >
              Save Preferences
            </button>

            <button
              className="calendar-sync-settings__sync-button"
              onClick={handleSyncWeek}
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync This Week'}
            </button>
          </div>

          {saveMessage && (
            <div className="calendar-sync-settings__success">
              {saveMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CalendarSyncSettings;
