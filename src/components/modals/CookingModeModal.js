import React, { useState, useEffect, useCallback } from 'react';
import './CookingModeModal.css';
import { highlightInstructions } from '../../utils/highlightInstructions';

const CookingModeModal = ({ isOpen, onClose, steps, recipeName, ingredients }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Wake Lock API - keep screen awake while cooking
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isOpen) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('[CookingMode] Screen wake lock acquired');
        } catch (err) {
          console.log('[CookingMode] Wake Lock not supported or denied:', err.message);
        }
      }
    };

    if (isOpen) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
        console.log('[CookingMode] Screen wake lock released');
      }
    };
  }, [isOpen]);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousStep();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNextStep, goToPreviousStep, onClose]);

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe distance of 50px
    if (diff > 50) {
      goToNextStep(); // Swipe left = next
    } else if (diff < -50) {
      goToPreviousStep(); // Swipe right = previous
    }

    setTouchStart(null);
  };

  // Handle completion
  const handleDone = () => {
    onClose();
  };

  if (!isOpen || !steps || steps.length === 0) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div
      className="cooking-mode__overlay"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="cooking-mode__header">
        <button
          className="cooking-mode__close-button"
          onClick={onClose}
          aria-label="Close cooking mode"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="cooking-mode__step-indicator">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Recipe name (subtle) */}
      <div className="cooking-mode__recipe-name">{recipeName}</div>

      {/* Main step content */}
      <div className="cooking-mode__content">
        <div className="cooking-mode__step-number">
          Step {currentStep + 1}
        </div>
        <div className="cooking-mode__step-text">
          {highlightInstructions(
            // Remove "Step X:" prefix from instruction text since we show it above
            steps[currentStep]?.replace(/^Step\s*\d+\s*[:.]\s*/i, '') || steps[currentStep],
            ingredients
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="cooking-mode__progress">
        {steps.map((_, index) => (
          <button
            key={index}
            className={`cooking-mode__progress-dot ${index === currentStep ? 'cooking-mode__progress-dot--active' : ''}`}
            onClick={() => setCurrentStep(index)}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="cooking-mode__navigation">
        <button
          className={`cooking-mode__nav-button cooking-mode__nav-button--prev ${isFirstStep ? 'cooking-mode__nav-button--disabled' : ''}`}
          onClick={goToPreviousStep}
          disabled={isFirstStep}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </button>

        {isLastStep ? (
          <button
            className="cooking-mode__nav-button cooking-mode__nav-button--done"
            onClick={handleDone}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Done
          </button>
        ) : (
          <button
            className="cooking-mode__nav-button cooking-mode__nav-button--next"
            onClick={goToNextStep}
          >
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Swipe hint (shows briefly on mobile) */}
      <div className="cooking-mode__swipe-hint">
        Swipe to navigate
      </div>
    </div>
  );
};

export default CookingModeModal;
