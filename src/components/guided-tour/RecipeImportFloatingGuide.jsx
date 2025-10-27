import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * RecipeImportFloatingGuide - Persistent guide shown while user imports recipe
 * Collapsible, shows current step and checklist
 */
const RecipeImportFloatingGuide = ({ currentStep, onStepComplete, onDone, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const steps = [
    { number: 1, title: 'Open Instagram post', completed: currentStep > 1 },
    { number: 2, title: 'Tap Share icon', completed: currentStep > 2 },
    { number: 3, title: 'Scroll down share menu', completed: currentStep > 3 },
    { number: 4, title: 'Select "Save to Trackabite"', completed: currentStep > 4 },
    { number: 5, title: 'View your recipe', completed: currentStep > 5 }
  ];

  const currentStepData = steps[currentStep - 1];

  if (isExpanded) {
    return ReactDOM.createPortal(
      <div className="floating-guide floating-guide--expanded">
        {/* Header */}
        <div className="floating-guide__header">
          <h3 className="floating-guide__title">Recipe Import Guide</h3>
          <button
            className="floating-guide__toggle"
            onClick={() => setIsExpanded(false)}
            aria-label="Minimize guide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="floating-guide__close"
            onClick={onClose}
            aria-label="Close guide"
          >
            ×
          </button>
        </div>

        {/* Steps Checklist */}
        <div className="floating-guide__steps">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`floating-guide__step ${
                step.completed
                  ? 'floating-guide__step--completed'
                  : step.number === currentStep
                  ? 'floating-guide__step--current'
                  : ''
              }`}
            >
              <div className="floating-guide__step-indicator">
                {step.completed ? '✓' : step.number}
              </div>
              <span className="floating-guide__step-text">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Current Step Detail */}
        {currentStepData && !currentStepData.completed && (
          <div className="floating-guide__current-detail">
            <p className="floating-guide__current-text">
              {currentStep === 2 && 'Find the paper airplane icon at the bottom of the post and tap it.'}
              {currentStep === 3 && 'Scroll through the share menu to see more options.'}
              {currentStep === 4 && 'Look for "Save to Trackabite" in the shortcuts section.'}
              {currentStep === 5 && 'Your recipe is being imported... (2-3 seconds)'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="floating-guide__actions">
          {currentStep < 5 && (
            <button
              className="floating-guide__button floating-guide__button--secondary"
              onClick={onStepComplete}
            >
              Next Step →
            </button>
          )}
          {currentStep === 5 && (
            <button
              className="floating-guide__button floating-guide__button--primary"
              onClick={onDone}
            >
              I'm done! Check if it worked →
            </button>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // Minimized state
  return ReactDOM.createPortal(
    <div className="floating-guide floating-guide--minimized" onClick={() => setIsExpanded(true)}>
      <div className="floating-guide__minimized-content">
        <span className="floating-guide__minimized-icon">📖</span>
        <span className="floating-guide__minimized-text">
          Step {currentStep}/5: {currentStepData?.title}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 15l-7-7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>,
    document.body
  );
};

export default RecipeImportFloatingGuide;
