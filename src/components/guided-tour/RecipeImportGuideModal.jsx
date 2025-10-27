import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * RecipeImportGuideModal - Shows detailed 5-step guide for importing recipes
 * Displays before opening Instagram
 */
const RecipeImportGuideModal = ({ onOpenInstagram, onBack }) => {
  const steps = [
    {
      number: 1,
      icon: '📱',
      title: 'Open the Instagram Post',
      description: 'We\'ll take you to the recipe post'
    },
    {
      number: 2,
      icon: '📤',
      title: 'Tap the Share Icon',
      description: 'Find the paper airplane at the bottom'
    },
    {
      number: 3,
      icon: '📜',
      title: 'Scroll Down',
      description: 'Scroll through the share menu options'
    },
    {
      number: 4,
      icon: '⭐',
      title: 'Select "Save to Trackabite"',
      description: 'Tap the shortcut you just installed'
    },
    {
      number: 5,
      icon: '✅',
      title: 'View Your Recipe',
      description: 'Wait 2-3 seconds, then check your imports!'
    }
  ];

  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__shortcut-card" style={{ maxWidth: '420px' }}>
        {/* Title */}
        <h2 className="guided-tour__shortcut-simple-title" style={{ marginBottom: '1.5rem' }}>
          How to Save Instagram Recipes
        </h2>

        {/* Steps List */}
        <div className="recipe-import-guide__steps">
          {steps.map((step) => (
            <div key={step.number} className="recipe-import-guide__step">
              <div className="recipe-import-guide__step-icon">
                {step.icon}
              </div>
              <div className="recipe-import-guide__step-content">
                <div className="recipe-import-guide__step-number">Step {step.number}</div>
                <h4 className="recipe-import-guide__step-title">{step.title}</h4>
                <p className="recipe-import-guide__step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="guided-tour__shortcut-buttons" style={{ marginTop: '1.5rem' }}>
          <button
            className="guided-tour__celebration-button"
            onClick={onOpenInstagram}
          >
            Open Instagram Recipe
          </button>
          {onBack && (
            <button
              className="guided-tour__shortcut-secondary-button"
              onClick={onBack}
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RecipeImportGuideModal;
