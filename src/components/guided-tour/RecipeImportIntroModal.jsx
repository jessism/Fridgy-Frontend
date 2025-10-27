import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * RecipeImportIntroModal - Initial modal for recipe import tutorial
 * Introduces the user to importing recipes from Instagram
 */
const RecipeImportIntroModal = ({ onShowMeHow, onSkip }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__celebration-card">
        {/* Title */}
        <h2 className="guided-tour__celebration-message" style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          Let's Import Your First Recipe!
        </h2>

        {/* Description */}
        <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6', margin: '0 0 2rem 0', maxWidth: '340px' }}>
          We'll show you how to save Instagram recipes to Trackabite using the shortcut you just set up.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <button
            className="guided-tour__celebration-button"
            onClick={onShowMeHow}
          >
            Show Me How
          </button>
          {onSkip && (
            <button
              className="guided-tour__shortcut-text-link"
              onClick={onSkip}
              style={{ marginTop: '0.5rem' }}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RecipeImportIntroModal;
