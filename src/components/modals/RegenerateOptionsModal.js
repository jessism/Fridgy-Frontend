import React from 'react';
import './RegenerateOptionsModal.css';

const RegenerateOptionsModal = ({ isOpen, onClose, onStartFromBeginning, onKeepPreferences }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="regenerate-modal-overlay" onClick={handleOverlayClick}>
      <div className="regenerate-modal">
        {/* Close button */}
        <button
          className="regenerate-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Refresh icon */}
        <div className="regenerate-modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Modal content */}
        <div className="regenerate-modal-header">
          <h2>Generate New Recipes</h2>
          <p className="regenerate-modal-subtitle">
            How would you like to proceed?
          </p>
        </div>

        {/* Options */}
        <div className="regenerate-modal-options">
          <button
            className="regenerate-option-button"
            onClick={onKeepPreferences}
          >
            <div className="regenerate-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 11l3 3L22 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="regenerate-option-text">
              <h3>Keep my preferences</h3>
              <p>Use your previous answers to quickly generate new recipes</p>
            </div>
          </button>

          <button
            className="regenerate-option-button"
            onClick={onStartFromBeginning}
          >
            <div className="regenerate-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 3v5h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="regenerate-option-text">
              <h3>Start from beginning</h3>
              <p>Answer all questions again from scratch</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegenerateOptionsModal;
