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
        {/* Icon - Chef Hat with Star Dust */}
        <div className="guided-tour__intro-emoji">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="40" cy="40" r="38" fill="#4fcf61" opacity="0.08"/>

            {/* Chef Hat */}
            <g transform="translate(40, 38)">
              {/* Hat band */}
              <rect x="-14" y="8" width="28" height="6" fill="#4fcf61" rx="1"/>

              {/* Hat puff */}
              <path d="M-12 8 Q-12 -8 0 -8 Q12 -8 12 8 Z" fill="#4fcf61" opacity="0.9"/>
              <path d="M-12 8 Q-12 -8 0 -8 Q12 -8 12 8" stroke="#4fcf61" strokeWidth="2" fill="none"/>

              {/* Hat pleat lines */}
              <line x1="-6" y1="-6" x2="-6" y2="6" stroke="#81e053" strokeWidth="1" opacity="0.6"/>
              <line x1="0" y1="-7" x2="0" y2="6" stroke="#81e053" strokeWidth="1" opacity="0.6"/>
              <line x1="6" y1="-6" x2="6" y2="6" stroke="#81e053" strokeWidth="1" opacity="0.6"/>
            </g>

            {/* Sparkles and star dust */}
            {/* Large sparkle top left */}
            <g transform="translate(20, 20)" className="sparkle-1">
              <path d="M0 -4 L1 0 L0 4 L-1 0 Z M-4 0 L0 -1 L4 0 L0 1 Z" fill="#ffd700" opacity="0.8"/>
            </g>

            {/* Medium sparkle top right */}
            <g transform="translate(60, 22)" className="sparkle-2">
              <path d="M0 -3 L0.7 0 L0 3 L-0.7 0 Z M-3 0 L0 -0.7 L3 0 L0 0.7 Z" fill="#ffeb3b" opacity="0.7"/>
            </g>

            {/* Small sparkle bottom left */}
            <g transform="translate(18, 55)" className="sparkle-3">
              <circle cx="0" cy="0" r="2" fill="#fff59d" opacity="0.8"/>
            </g>

            {/* Star top */}
            <g transform="translate(40, 15)" className="sparkle-4">
              <path d="M0,-3 L0.9,-0.9 L3,0 L0.9,0.9 L0,3 L-0.9,0.9 L-3,0 L-0.9,-0.9 Z" fill="#ffd700" opacity="0.6"/>
            </g>

            {/* Small dots for dust effect */}
            <circle cx="25" cy="35" r="1.5" fill="#ffeb3b" opacity="0.5" className="sparkle-5"/>
            <circle cx="55" cy="38" r="1" fill="#ffd700" opacity="0.6" className="sparkle-6"/>
            <circle cx="62" cy="50" r="1.5" fill="#fff59d" opacity="0.5" className="sparkle-7"/>
            <circle cx="22" cy="48" r="1" fill="#ffeb3b" opacity="0.6" className="sparkle-8"/>

            {/* Tiny accent stars */}
            <g transform="translate(52, 30)" className="sparkle-9">
              <path d="M0 -2 L0.5 0 L0 2 L-0.5 0 Z M-2 0 L0 -0.5 L2 0 L0 0.5 Z" fill="#fff" opacity="0.7"/>
            </g>

            <g transform="translate(28, 28)" className="sparkle-10">
              <path d="M0 -1.5 L0.4 0 L0 1.5 L-0.4 0 Z M-1.5 0 L0 -0.4 L1.5 0 L0 0.4 Z" fill="#fff" opacity="0.6"/>
            </g>
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
