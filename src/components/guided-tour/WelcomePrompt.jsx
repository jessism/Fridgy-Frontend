import React from 'react';
import ReactDOM from 'react-dom';
import FridgyLogo from '../../assets/images/Logo.png';
import './GuidedTour.css';

/**
 * WelcomePrompt - Initial welcome screen for guided tour
 * Simple welcome message with Next button to proceed to adventure choice
 */
const WelcomePrompt = ({ onNext }) => {
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

        {/* Single Next Button */}
        <div className="guided-tour__welcome-buttons">
          <button
            className="guided-tour__welcome-button guided-tour__welcome-button--primary"
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WelcomePrompt;
