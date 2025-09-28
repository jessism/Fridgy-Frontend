import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './RecipeCreationModal.css';

const RecipeCreationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleScanRecipe = () => {
    onClose();
    navigate('/recipe-scanner');
  };

  const handleManualEntry = () => {
    onClose();
    navigate('/recipes/manual');
  };

  const modalContent = (
    <div className="recipe-creation-overlay" onClick={handleOverlayClick}>
      <div className="recipe-creation-content">
        {/* Handle bar */}
        <div className="recipe-creation-header">
          <div className="recipe-creation-handle"></div>
        </div>

        {/* Title and close button */}
        <div className="recipe-creation-title-row">
          <h2 className="recipe-creation-title">Create Recipe</h2>
          <button
            className="recipe-creation-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="recipe-creation-options">
          <button className="recipe-creation-option" onClick={handleScanRecipe}>
            <div className="recipe-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="recipe-option-label">Scan recipe</span>
          </button>

          <button className="recipe-creation-option" onClick={handleManualEntry}>
            <div className="recipe-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="recipe-option-label">Manual entry</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RecipeCreationModal;