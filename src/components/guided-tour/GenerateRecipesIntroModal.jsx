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
        {/* Icon - Fork & Knife with Sparkles */}
        <div className="guided-tour__intro-emoji">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="40" cy="40" r="38" fill="#4fcf61" opacity="0.08"/>

            {/* Fork */}
            <g transform="translate(32, 40)">
              {/* Fork handle */}
              <rect x="-2" y="-8" width="4" height="30" fill="#4fcf61" rx="2"/>
              {/* Fork prongs */}
              <rect x="-6" y="-20" width="2" height="12" fill="#4fcf61" rx="1"/>
              <rect x="-2" y="-20" width="2" height="12" fill="#4fcf61" rx="1"/>
              <rect x="2" y="-20" width="2" height="12" fill="#4fcf61" rx="1"/>
              <rect x="6" y="-20" width="2" height="12" fill="#4fcf61" rx="1"/>
              {/* Fork connector */}
              <rect x="-8" y="-10" width="16" height="3" fill="#4fcf61" rx="1"/>
            </g>

            {/* Knife */}
            <g transform="translate(48, 40)">
              {/* Knife handle */}
              <rect x="-2" y="-8" width="4" height="30" fill="#4fcf61" rx="2"/>
              {/* Knife blade */}
              <path d="M-4 -20 L-4 -10 L6 -10 Q6 -15 4 -20 Z" fill="#4fcf61"/>
            </g>

            {/* Large sparkle top center */}
            <g transform="translate(40, 16)" className="sparkle-1">
              <path d="M0 -5 L1.2 0 L0 5 L-1.2 0 Z M-5 0 L0 -1.2 L5 0 L0 1.2 Z" fill="#ffd700" opacity="0.9"/>
            </g>

            {/* Medium sparkle left */}
            <g transform="translate(20, 25)" className="sparkle-2">
              <path d="M0 -3 L0.8 0 L0 3 L-0.8 0 Z M-3 0 L0 -0.8 L3 0 L0 0.8 Z" fill="#ffeb3b" opacity="0.8"/>
            </g>

            {/* Medium sparkle right */}
            <g transform="translate(60, 25)" className="sparkle-3">
              <path d="M0 -3 L0.8 0 L0 3 L-0.8 0 Z M-3 0 L0 -0.8 L3 0 L0 0.8 Z" fill="#ffeb3b" opacity="0.8"/>
            </g>

            {/* Small dots for magic dust */}
            <circle cx="25" cy="40" r="2" fill="#ffd700" opacity="0.6" className="sparkle-4"/>
            <circle cx="55" cy="42" r="1.5" fill="#ffeb3b" opacity="0.5" className="sparkle-5"/>
            <circle cx="40" cy="60" r="1.5" fill="#fff59d" opacity="0.6" className="sparkle-6"/>
            <circle cx="18" cy="55" r="1" fill="#ffd700" opacity="0.5" className="sparkle-7"/>
            <circle cx="62" cy="55" r="1" fill="#ffeb3b" opacity="0.5" className="sparkle-8"/>
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
