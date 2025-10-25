import React from 'react';
import ReactDOM from 'react-dom';
import FridgyLogo from '../../assets/images/Logo.png';
import './GuidedTour.css';

/**
 * WelcomePrompt - Initial welcome screen for guided tour
 * Gives users option to start or skip the tour
 */
const WelcomePrompt = ({ onStart, onSkip }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__welcome-overlay">
      <div className="guided-tour__welcome-card">
        {/* Logo */}
        <img
          src={FridgyLogo}
          alt="Trackabite"
          className="guided-tour__welcome-logo"
        />

        {/* Title */}
        <h2 className="guided-tour__welcome-title">
          Welcome to Trackabite!
        </h2>

        {/* Description */}
        <p className="guided-tour__welcome-text">
          Let me give you a quick tour of the app and help you get started.
        </p>

        {/* Buttons */}
        <div className="guided-tour__welcome-buttons">
          <button
            className="guided-tour__welcome-button guided-tour__welcome-button--primary"
            onClick={onStart}
          >
            Start Tour
          </button>
          <button
            className="guided-tour__welcome-button guided-tour__welcome-button--secondary"
            onClick={onSkip}
          >
            Skip
          </button>
        </div>

        {/* Hint */}
        <p className="guided-tour__welcome-hint">
          Takes about 2 minutes
        </p>
      </div>
    </div>,
    document.body
  );
};

export default WelcomePrompt;
