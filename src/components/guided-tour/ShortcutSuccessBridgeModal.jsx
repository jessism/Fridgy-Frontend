import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * ShortcutSuccessBridgeModal - Celebrates shortcut installation and bridges to recipe import
 * Shows after user confirms they installed the shortcut
 */
const ShortcutSuccessBridgeModal = ({ onLetsGo }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__celebration-card">
        {/* Success Icon */}
        <div className="guided-tour__celebration-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="guided-tour__celebration-message">
          Awesome!
        </h2>

        {/* Description */}
        <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6', margin: '0 0 2rem 0', maxWidth: '340px' }}>
          Now let's import your first recipe using the shortcut you just installed.
        </p>

        {/* Button */}
        <button
          className="guided-tour__celebration-button"
          onClick={onLetsGo}
        >
          Let's Go
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ShortcutSuccessBridgeModal;
