/**
 * GoogleDriveSyncSettings Component
 * Allows users to connect Google Drive and sync recipes as PDFs
 */

import React, { useState } from 'react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import './GoogleDriveSyncSettings.css';

const GoogleDriveSyncSettings = () => {
  const {
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
    syncAll,
    clearError
  } = useGoogleDrive();

  const [disconnecting, setDisconnecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleConnect = async () => {
    clearError();
    await connect();
  };

  const handleDisconnect = async () => {
    if (window.confirm('Disconnect Google Drive? Your synced PDFs will remain in your Drive.')) {
      setDisconnecting(true);
      await disconnect();
      setDisconnecting(false);
    }
  };

  const handleSyncAll = async () => {
    clearError();
    try {
      const result = await syncAll();
      if (result.success) {
        const { synced = 0, failed = 0 } = result.results || {};
        setSuccessMessage(`Synced ${synced} recipe${synced !== 1 ? 's' : ''} to Google Drive!${failed > 0 ? ` (${failed} failed)` : ''}`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleToggleAutoSync = async () => {
    clearError();
    await toggleAutoSync();
  };

  // Loading state
  if (loading) {
    return (
      <div className="google-drive-sync-settings">
        <div className="google-drive-sync-settings__loading">
          <div className="google-drive-sync-settings__spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="google-drive-sync-settings">
      {/* Info Section */}
      <div className="google-drive-sync-settings__section">
        <h3 className="google-drive-sync-settings__section-title">Recipe Backup</h3>
        <p className="google-drive-sync-settings__description">
          Save your recipes as beautifully formatted PDFs in your Google Drive.
          They'll be stored in a "Trackabite Recipes" folder.
        </p>
      </div>

      {/* Connection Status Section */}
      <div className="google-drive-sync-settings__section">
        {!connected ? (
          /* Not Connected - Show Connect Button */
          <div className="google-drive-sync-settings__connect-section">
            <button
              className="google-drive-sync-settings__connect-button"
              onClick={handleConnect}
            >
              <svg className="google-drive-sync-settings__drive-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Connect Google Drive</span>
            </button>
          </div>
        ) : (
          /* Connected - Show Status and Actions */
          <div className="google-drive-sync-settings__connected-card">
            <div className="google-drive-sync-settings__connected-header">
              <div className="google-drive-sync-settings__connected-status">
                <div className="google-drive-sync-settings__status-dot"></div>
                <span className="google-drive-sync-settings__connected-text">Connected</span>
              </div>
              <p className="google-drive-sync-settings__connected-email">{email}</p>
            </div>

            {/* Sync Stats */}
            {syncStats && (
              <div className="google-drive-sync-settings__stats">
                <div className="google-drive-sync-settings__stat">
                  <span className="google-drive-sync-settings__stat-value">{syncStats.synced || 0}</span>
                  <span className="google-drive-sync-settings__stat-label">Synced</span>
                </div>
                <div className="google-drive-sync-settings__stat">
                  <span className="google-drive-sync-settings__stat-value">{syncStats.pending || 0}</span>
                  <span className="google-drive-sync-settings__stat-label">Pending</span>
                </div>
                <div className="google-drive-sync-settings__stat">
                  <span className="google-drive-sync-settings__stat-value">{syncStats.total || 0}</span>
                  <span className="google-drive-sync-settings__stat-label">Total</span>
                </div>
              </div>
            )}

            {/* Auto-sync Toggle */}
            <div className="google-drive-sync-settings__toggle-row">
              <div className="google-drive-sync-settings__toggle-info">
                <span className="google-drive-sync-settings__toggle-label">Auto-sync new recipes</span>
                <span className="google-drive-sync-settings__toggle-description">
                  Automatically save new recipes to Drive
                </span>
              </div>
              <label className="google-drive-sync-settings__toggle">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={handleToggleAutoSync}
                />
                <span className="google-drive-sync-settings__toggle-slider"></span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="google-drive-sync-settings__actions">
              <button
                className="google-drive-sync-settings__sync-button"
                onClick={handleSyncAll}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <div className="google-drive-sync-settings__button-spinner"></div>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <span>Sync All Recipes</span>
                )}
              </button>
              <button
                className="google-drive-sync-settings__disconnect-button"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="google-drive-sync-settings__error">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="google-drive-sync-settings__success">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveSyncSettings;
