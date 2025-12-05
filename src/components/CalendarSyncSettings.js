/**
 * CalendarSyncSettings Component
 * Allows users to connect Google Calendar or Apple Calendar (ICS) and configure meal sync preferences
 * Available to all users
 */

import React, { useState } from 'react';
import useCalendarSync from '../hooks/useCalendarSync';
import './CalendarSyncSettings.css';

const CalendarSyncSettings = () => {
  const {
    isConnected,
    provider,
    connectedEmail,
    webcalUrl,
    loading,
    syncing,
    error,
    preferences,
    // ICS Modal state
    showICSModal,
    pendingWebcalUrl,
    // Connection actions
    connectGoogle,
    connectICS,
    confirmICSConnection,
    cancelICSModal,
    downloadICS,
    disconnect,
    updatePreferences,
    syncWeek,
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

  const handleConnectGoogle = async () => {
    clearError();
    await connectGoogle();
  };

  const handleConnectICS = async () => {
    clearError();
    await connectICS();
  };

  const handleDownloadICS = async () => {
    clearError();
    await downloadICS();
  };

  const handleDisconnect = async () => {
    const message = provider === 'google'
      ? 'Disconnect Google Calendar? Your synced events will remain in your calendar.'
      : 'Disconnect Apple Calendar? You may need to manually remove the subscription from your calendar app.';

    if (window.confirm(message)) {
      setDisconnecting(true);
      await disconnect();
      setDisconnecting(false);
    }
  };

  const handleReAddToCalendar = () => {
    // Re-open the webcal URL for re-subscribing
    if (webcalUrl) {
      window.location.href = webcalUrl;
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
      {/* ICS Subscription Confirmation Modal */}
      {showICSModal && (
        <div className="calendar-sync-settings__modal-overlay" onClick={cancelICSModal}>
          <div className="calendar-sync-settings__modal calendar-sync-settings__modal--simple" onClick={(e) => e.stopPropagation()}>
            <button className="calendar-sync-settings__modal-close" onClick={cancelICSModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="calendar-sync-settings__modal-content calendar-sync-settings__modal-content--centered">
              <div className="calendar-sync-settings__modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>

              <h3 className="calendar-sync-settings__modal-title--centered">
                Did you add the calendar?
              </h3>

              <p className="calendar-sync-settings__modal-subtitle">
                Click "Done" after you've subscribed in your calendar app.
              </p>

              <button
                className="calendar-sync-settings__modal-done-button calendar-sync-settings__modal-done-button--full"
                onClick={confirmICSConnection}
              >
                Done
              </button>

              <button
                className="calendar-sync-settings__modal-cancel-button calendar-sync-settings__modal-cancel-button--text"
                onClick={cancelICSModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Section */}
      <div className="calendar-sync-settings__section">
        <h3 className="calendar-sync-settings__section-title">Calendar Sync</h3>

        {!isConnected ? (
          /* Not Connected - Show Provider Options */
          <div className="calendar-sync-settings__provider-options">
            <p className="calendar-sync-settings__provider-description">
              Sync your meals to your calendar:
            </p>

            {/* Google Calendar Option */}
            <button
              className="calendar-sync-settings__provider-button calendar-sync-settings__provider-button--google"
              onClick={handleConnectGoogle}
            >
              <div className="calendar-sync-settings__provider-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="calendar-sync-settings__provider-info">
                <span className="calendar-sync-settings__provider-name">Connect Google Calendar</span>
                <span className="calendar-sync-settings__provider-subtitle">Real-time sync</span>
              </div>
            </button>

            {/* Apple Calendar Option */}
            <button
              className="calendar-sync-settings__provider-button calendar-sync-settings__provider-button--apple"
              onClick={handleConnectICS}
            >
              <div className="calendar-sync-settings__provider-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000"/>
                </svg>
              </div>
              <div className="calendar-sync-settings__provider-info">
                <span className="calendar-sync-settings__provider-name">Add to Apple Calendar</span>
                <span className="calendar-sync-settings__provider-subtitle">Also works with Outlook</span>
              </div>
            </button>

            {/* Download Option */}
            <button
              className="calendar-sync-settings__provider-button calendar-sync-settings__provider-button--download"
              onClick={handleDownloadICS}
            >
              <div className="calendar-sync-settings__provider-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div className="calendar-sync-settings__provider-info">
                <span className="calendar-sync-settings__provider-name">Download Calendar File</span>
                <span className="calendar-sync-settings__provider-subtitle">Import to any calendar app</span>
              </div>
            </button>
          </div>
        ) : provider === 'google' ? (
          /* Google Calendar Connected */
          <div className="calendar-sync-settings__connected-card">
            <div className="calendar-sync-settings__connected-header">
              <div className="calendar-sync-settings__connected-status">
                <div className="calendar-sync-settings__status-dot"></div>
                <span className="calendar-sync-settings__connected-text">Connected to Google Calendar</span>
              </div>
              <p className="calendar-sync-settings__connected-email">{connectedEmail}</p>
            </div>
            <div className="calendar-sync-settings__connected-actions">
              <button
                className="calendar-sync-settings__disconnect-button"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
              <button
                className="calendar-sync-settings__sync-button"
                onClick={handleSyncWeek}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Sync This Week'}
              </button>
            </div>
          </div>
        ) : provider === 'ics' ? (
          /* ICS Calendar Connected */
          <div className="calendar-sync-settings__connected-card calendar-sync-settings__connected-card--ics">
            <div className="calendar-sync-settings__connected-header">
              <div className="calendar-sync-settings__connected-status">
                <div className="calendar-sync-settings__status-dot"></div>
                <span className="calendar-sync-settings__connected-text">Syncing with Apple Calendar</span>
              </div>
              <p className="calendar-sync-settings__ics-info">Meals refresh automatically</p>
            </div>
            <div className="calendar-sync-settings__connected-actions">
              <button
                className="calendar-sync-settings__disconnect-button"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
              <button
                className="calendar-sync-settings__readd-button"
                onClick={handleReAddToCalendar}
              >
                Re-add to Calendar
              </button>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="calendar-sync-settings__error">
            {error}
          </div>
        )}
      </div>

      {/* Preferences Section - Show when connected */}
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

          {/* Auto-sync only for Google Calendar */}
          {provider === 'google' && (
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
          )}

          <div className="calendar-sync-settings__actions">
            <button
              className="calendar-sync-settings__save-button"
              onClick={handleSavePreferences}
            >
              Save Preferences
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
