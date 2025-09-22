import React, { useState, useEffect } from 'react';
import './IOSInstallPrompt.css';

const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if it's iOS Safari and not installed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true;
    const hasSeenPrompt = localStorage.getItem('ios_install_prompt_seen');

    // Show prompt if:
    // 1. It's iOS Safari
    // 2. Not already installed as standalone app
    // 3. User hasn't dismissed it before (or hasn't seen it in 7 days)
    if (isIOS && !isStandalone && !hasSeenPrompt) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('ios_install_prompt_seen', expiryDate.toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="ios-install-prompt">
      <div className="ios-install-prompt__content">
        <div className="ios-install-prompt__icon">📱</div>
        <div className="ios-install-prompt__text">
          <h4>Install Trackabite</h4>
          <p>Add to home screen to enable notifications and offline access</p>
        </div>
        <button
          className="ios-install-prompt__close"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="ios-install-prompt__instructions">
        <span>Tap</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3v10M6 9l4 4 4-4M4 15h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>then "Add to Home Screen"</span>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;