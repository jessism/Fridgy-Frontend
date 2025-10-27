import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * ShortcutInstallModal - Swipeable carousel guiding iOS users through shortcut installation
 * Features: swipe gestures, button navigation, step-by-step instructions with images
 */
const ShortcutInstallModal = ({ onInstall, onSkip }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [currentModal, setCurrentModal] = useState(1); // 1 = token, 2 = instructions, 'skip-confirm' = skip warning, 'skip-final' = skip final message
  const [returnModal, setReturnModal] = useState(1); // Store which modal to return to if user clicks "No, Let's Do This"
  const [showCopyWarning, setShowCopyWarning] = useState(false);
  const [installTimerRef, setInstallTimerRef] = useState(null);

  const SHORTCUT_URL = process.env.REACT_APP_ICLOUD_SHORTCUT_URL || 'https://www.icloud.com/shortcuts/PLACEHOLDER';

  // Fetch user's shortcut token
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

          // Auto-copy token to clipboard when modal opens (silently, don't show message)
          try {
            await navigator.clipboard.writeText(data.token);
            console.log('[ShortcutInstall] Token auto-copied to clipboard');
            // Don't set tokenCopied to true here - only when user manually clicks
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
      // Don't reset tokenCopied - keep it true so they can proceed
    } catch (error) {
      console.error('[ShortcutInstall] Copy failed:', error);
      alert('Please copy the token manually');
    }
  };

  const handleNext = () => {
    if (!tokenCopied) {
      // Show warning if they haven't copied the token
      setShowCopyWarning(true);
      return;
    }
    setCurrentModal(2); // Move to instructions screen
  };

  const handleGoBack = () => {
    setCurrentModal(1); // Go back to token screen
  };

  const handleSkipClick = () => {
    // Cancel install timer if user starts skip flow
    if (installTimerRef) {
      clearTimeout(installTimerRef);
      setInstallTimerRef(null);
      console.log('[ShortcutInstall] Timer cancelled - user clicked skip');
    }

    // Store current modal to return to if user changes mind
    setReturnModal(currentModal);
    setCurrentModal('skip-confirm');
  };

  const handleNoLetsDoThis = () => {
    // Return to the modal they were on
    setCurrentModal(returnModal);
  };

  const handleYesStillSkip = () => {
    // Show final skip message
    setCurrentModal('skip-final');
  };

  const handleSkipFinal = () => {
    // Cancel install timer if user skips
    if (installTimerRef) {
      clearTimeout(installTimerRef);
      setInstallTimerRef(null);
    }
    // Actually skip the tour
    onSkip();
  };

  const handleInstall = () => {
    if (!token) {
      alert('Unable to load token. Please try again.');
      return;
    }

    // Open iCloud shortcut URL
    window.location.href = SHORTCUT_URL;

    // Wait 10 seconds before showing confirmation modal
    const timer = setTimeout(() => {
      onInstall(); // This advances to SHORTCUT_CONFIRMATION step
    }, 10000);

    // Store timer reference so we can cancel if user skips
    setInstallTimerRef(timer);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (installTimerRef) {
        clearTimeout(installTimerRef);
      }
    };
  }, [installTimerRef]);

  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__shortcut-card guided-tour__shortcut-card--simple">
        {currentModal === 1 ? (
          // Step 1: Show Token
          <>
            {/* Title */}
            <h2 className="guided-tour__shortcut-simple-title">Copy Your Magic Key</h2>

            {/* Description */}
            <p className="guided-tour__shortcut-simple-description">
              Quickly import online recipes to your Trackabite account. First, click the clipboard icon to copy your magic key.
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
                  <p className="guided-tour__token-copied">Token copied to clipboard!</p>
                )}
              </div>
            )}

            {/* Warning Message */}
            {showCopyWarning && !tokenCopied && (
              <p style={{ fontSize: '0.85rem', color: '#ff6b6b', margin: '0.75rem 0 0 0', textAlign: 'center' }}>
                Copy your magic key to continue
              </p>
            )}

            {/* Action Buttons */}
            <div className="guided-tour__shortcut-buttons">
              <button
                className={`guided-tour__celebration-button ${!tokenCopied ? 'guided-tour__button-disabled' : ''}`}
                onClick={handleNext}
                disabled={loading || !token || !tokenCopied}
              >
                {loading ? 'Loading...' : 'Next'}
              </button>
            </div>

            {/* Skip Text Link */}
            <button
              className="guided-tour__shortcut-text-link"
              onClick={handleSkipClick}
            >
              Skip for now
            </button>
          </>
        ) : currentModal === 2 ? (
          // Step 2: Show Instructions
          <>
            {/* Title */}
            <h2 className="guided-tour__shortcut-simple-title">Install the Shortcut</h2>

            {/* Instructions */}
            <div className="guided-tour__shortcut-instructions-simple">
              <ol className="guided-tour__shortcut-steps-numbered">
                <li>Tap "Install Shortcut" button below, then "Set Up Shortcut"</li>
                <li>When asked for token, paste the one you just copied and "Add Shortcut"</li>
                <li>Done!</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="guided-tour__shortcut-buttons">
              <button
                className="guided-tour__celebration-button"
                onClick={handleInstall}
              >
                Install Shortcut
              </button>
              <button
                className="guided-tour__shortcut-secondary-button"
                onClick={handleGoBack}
              >
                Go back to previous step
              </button>
            </div>

            {/* Skip Text Link */}
            <button
              className="guided-tour__shortcut-text-link"
              onClick={handleSkipClick}
            >
              Skip for now
            </button>
          </>
        ) : currentModal === 'skip-confirm' ? (
          // Skip Confirmation Modal
          <>
            {/* Title */}
            <h2 className="guided-tour__shortcut-simple-title">Are You Sure?</h2>

            {/* Message */}
            <p className="guided-tour__shortcut-simple-description">
              You won't be able to quickly import recipes from Instagram to your account. Do you still want to skip?
            </p>

            {/* Action Buttons */}
            <div className="guided-tour__shortcut-buttons">
              <button
                className="guided-tour__celebration-button"
                onClick={handleNoLetsDoThis}
              >
                No, Let's Do This
              </button>
              <button
                className="guided-tour__shortcut-skip"
                onClick={handleYesStillSkip}
              >
                Yes, I Still Want to Skip
              </button>
            </div>
          </>
        ) : (
          // Skip Final Message Modal
          <>
            {/* Title */}
            <h2 className="guided-tour__shortcut-simple-title">No Problem!</h2>

            {/* Message */}
            <p className="guided-tour__shortcut-simple-description">
              You can still install this shortcut later in your Import Recipes page.
            </p>

            {/* Action Button */}
            <div className="guided-tour__shortcut-buttons">
              <button
                className="guided-tour__celebration-button"
                onClick={handleSkipFinal}
              >
                Got It
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ShortcutInstallModal;
