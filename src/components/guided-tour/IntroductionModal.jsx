import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * IntroductionModal - Simple centered modal for introducing new tour sections
 * Used between major milestones in the guided tour
 */
const IntroductionModal = ({ title, message, onContinue, continueLabel = 'Continue', emoji, onClose, skipLabel }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__celebration-card">
        {/* Emoji Icon (optional) */}
        {emoji && (
          <div className="guided-tour__intro-emoji">
            {emoji}
          </div>
        )}

        {/* Title */}
        {title && (
          <h2 className="guided-tour__intro-title">{title}</h2>
        )}

        {/* Message */}
        <p className="guided-tour__intro-message">{message}</p>

        {/* Continue Button */}
        <button
          className="guided-tour__celebration-button"
          onClick={onContinue}
        >
          {continueLabel}
        </button>

        {/* Skip Button - Text link below Continue button */}
        {onClose && skipLabel && (
          <button
            className="guided-tour__intro-skip"
            onClick={onClose}
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default IntroductionModal;
