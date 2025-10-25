import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * ShortcutInstallModal - Prompts iOS users to install the shortcut
 * Fetches user token and guides through installation
 */
const ShortcutInstallModal = ({ onInstall, onSkip }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenCopied, setTokenCopied] = useState(false);

  const SHORTCUT_URL = process.env.REACT_APP_ICLOUD_SHORTCUT_URL || 'https://www.icloud.com/shortcuts/PLACEHOLDER';

  // Fetch user's shortcut token and auto-copy it
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const authToken = localStorage.getItem('fridgy_token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

        const response = await fetch(`${apiUrl}/shortcuts/setup`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.token);

          // Auto-copy token to clipboard when modal opens
          try {
            await navigator.clipboard.writeText(data.token);
            setTokenCopied(true);
            console.log('[ShortcutInstall] Token auto-copied to clipboard');
          } catch (clipError) {
            console.log('[ShortcutInstall] Auto-copy failed, user can copy manually');
          }
        }
      } catch (error) {
        console.error('[ShortcutInstall] Error fetching token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const handleCopyToken = async () => {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (error) {
      console.error('[ShortcutInstall] Copy failed:', error);
      alert('Please copy the token manually');
    }
  };

  const handleInstall = () => {
    if (!token) {
      alert('Unable to load token. Please try again.');
      return;
    }

    // Open iCloud shortcut URL
    window.location.href = SHORTCUT_URL;
    onInstall();
  };

  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__shortcut-card">
        {/* Title */}
        <h2 className="guided-tour__shortcut-title">Install iOS Shortcut</h2>

        {/* Description */}
        <p className="guided-tour__shortcut-description">
          Save recipes from Instagram in just one tap!
        </p>

        {/* Token Display */}
        {!loading && token && (
          <div className="guided-tour__token-section">
            <p className="guided-tour__token-label">Your Token:</p>
            <div className="guided-tour__token-box">
              <code className="guided-tour__token-code">{token}</code>
              <button
                className="guided-tour__token-copy-btn"
                onClick={handleCopyToken}
                title="Copy token"
              >
                {tokenCopied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {tokenCopied && (
              <p className="guided-tour__token-copied">✅ Token copied to clipboard!</p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="guided-tour__shortcut-instructions">
          <ol className="guided-tour__shortcut-steps-list">
            <li>Tap "Install Shortcut" button below</li>
            <li>On the Shortcuts page, tap "Add Shortcut"</li>
            <li>When prompted for token, paste it (already copied!)</li>
            <li>Done! Share Instagram recipes to Trackabite</li>
          </ol>
        </div>

        {/* Buttons */}
        <div className="guided-tour__shortcut-buttons">
          <button
            className="guided-tour__celebration-button"
            onClick={handleInstall}
            disabled={loading || !token}
          >
            {loading ? 'Loading...' : 'Install Shortcut'}
          </button>
          <button
            className="guided-tour__shortcut-skip"
            onClick={onSkip}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShortcutInstallModal;
