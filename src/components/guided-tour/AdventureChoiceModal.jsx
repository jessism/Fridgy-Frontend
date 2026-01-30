import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * AdventureChoiceModal - Let users choose their first onboarding adventure
 * Two paths: Add groceries or Import a recipe
 */
const AdventureChoiceModal = ({ onChooseGroceries, onChooseRecipe }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__welcome-overlay">
      <div className="guided-tour__adventure-card">
        {/* Title */}
        <h2 className="guided-tour__adventure-title">
          Choose your first adventure
        </h2>

        {/* Subtitle */}
        <p className="guided-tour__adventure-subtitle">
          Based on your immediate need
        </p>

        {/* Adventure Options */}
        <div className="guided-tour__adventure-options">
          {/* Groceries Option */}
          <button
            className="guided-tour__adventure-option"
            onClick={onChooseGroceries}
          >
            <div className="guided-tour__adventure-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7V5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 7H4L5.5 19C5.5 19.5523 5.94772 20 6.5 20H17.5C18.0523 20 18.5 19.5523 18.5 19L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 11V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="guided-tour__adventure-label">Add my first groceries</span>
          </button>

          {/* Recipe Option */}
          <button
            className="guided-tour__adventure-option"
            onClick={onChooseRecipe}
          >
            <div className="guided-tour__adventure-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19V5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="guided-tour__adventure-label">Add my first recipe</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdventureChoiceModal;
