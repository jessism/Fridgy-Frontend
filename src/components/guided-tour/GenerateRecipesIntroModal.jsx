import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * GenerateRecipesIntroModal - Introduction modal for AI recipe generation tour
 * Welcomes users to the personalized recipe generation feature
 */
const GenerateRecipesIntroModal = ({ onContinue, onSkip }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__celebration-card">
        {/* Icon */}
        <div className="guided-tour__intro-emoji">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#4fcf61" opacity="0.1"/>
            <path d="M32 12C20.9543 12 12 20.9543 12 32C12 43.0457 20.9543 52 32 52C43.0457 52 52 43.0457 52 32C52 20.9543 43.0457 12 32 12Z" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 20V32L38 38" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 26L26 30L34 22" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <h2 className="guided-tour__intro-title">Generate Personalized Recipes</h2>

        {/* Message */}
        <p className="guided-tour__intro-message">
          Now, let's generate your first personalized recipes. We'll guide you through using AI to create custom meals based on your preferences and what's in your fridge.
        </p>

        {/* Continue Button */}
        <button
          className="guided-tour__celebration-button"
          onClick={onContinue}
        >
          Show Me How
        </button>

        {/* Skip Button */}
        {onSkip && (
          <button
            className="guided-tour__intro-skip"
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

export default GenerateRecipesIntroModal;
