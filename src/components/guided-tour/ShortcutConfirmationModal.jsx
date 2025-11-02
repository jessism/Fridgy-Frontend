import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * ShortcutConfirmationModal - Asks user if they successfully installed the shortcut
 * Shows after 20-second delay
 */
const ShortcutConfirmationModal = ({ onYes, onNo, onSkip }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__shortcut-card guided-tour__shortcut-card--simple">
        {/* Title */}
        <h2 className="guided-tour__shortcut-simple-title">
          Have You Successfully Installed Your Shortcut?
        </h2>

        {/* Description */}
        <p className="guided-tour__shortcut-simple-description">
          Check your Shortcuts app to see if "Save to Trackabite" appears in your library.
        </p>

        {/* Buttons */}
        <div className="guided-tour__shortcut-buttons">
          <button
            className="guided-tour__celebration-button"
            onClick={onYes}
          >
            Yes, I Installed It ✓
          </button>
          <button
            className="guided-tour__shortcut-secondary-button"
            onClick={onNo}
          >
            Not yet. Help me install.
          </button>
        </div>

        {/* Skip Text Link */}
        {onSkip && (
          <button
            className="guided-tour__shortcut-text-link"
            onClick={onSkip}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ShortcutConfirmationModal;
