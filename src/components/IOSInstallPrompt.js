import React from 'react';
import ReactDOM from 'react-dom';
import './IOSInstallPrompt.css';

const IOSInstallPrompt = ({ isVisible, onDismiss }) => {
  if (!isVisible) return null;

  const modalContent = (
    <div className="ios-install-prompt__overlay">
      <div className="ios-install-prompt__modal">
        <button
          className="ios-install-prompt__close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>

        <div className="ios-install-prompt__header">
          <div className="ios-install-prompt__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke="#333" strokeWidth="1.5"/>
              <line x1="9" y1="19" x2="15" y2="19" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="ios-install-prompt__title">Install Trackabite</h3>
        </div>

        <p className="ios-install-prompt__description">
          Add to your home screen for the best experience with quick access and offline support.
        </p>

        <div className="ios-install-prompt__instructions">
          <div className="ios-install-prompt__step">
            <span className="ios-install-prompt__step-number">1</span>
            <span className="ios-install-prompt__step-text">
              Tap the Share button
              <svg className="ios-install-prompt__share-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12M12 3l4 4M12 3L8 7" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12v8a1 1 0 001 1h14a1 1 0 001-1v-8" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          </div>
          <div className="ios-install-prompt__step">
            <span className="ios-install-prompt__step-number">2</span>
            <span className="ios-install-prompt__step-text">
              Select "Add to Home Screen"
            </span>
          </div>
        </div>

        <button
          className="ios-install-prompt__dismiss-btn"
          onClick={onDismiss}
        >
          Got it
        </button>
      </div>
    </div>
  );

  // Render using portal to ensure it appears above everything
  return ReactDOM.createPortal(modalContent, document.body);
};

export default IOSInstallPrompt;
