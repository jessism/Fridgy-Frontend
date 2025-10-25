import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * CelebrationModal - Shows success message in center of screen
 * Used for milestone celebrations in the guided tour
 */
const CelebrationModal = ({ message, onContinue, continueLabel = 'Continue' }) => {
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

        {/* Message */}
        <p className="guided-tour__celebration-message">{message}</p>

        {/* Continue Button */}
        <button
          className="guided-tour__celebration-button"
          onClick={onContinue}
        >
          {continueLabel}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default CelebrationModal;
