import React, { useState, useEffect } from 'react';
import './IOSInstallModal.css';
import addToHomeIcon from '../assets/icons/Add to home screen.png';
import addToHomeScreenshot from '../assets/product mockup/Add to home screen.png';

const IOSInstallModal = ({ isOpen, onClose, onContinue }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to step 0 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleContinue = () => {
    onClose(); // Close the modal
    setCurrentStep(0); // Reset for next time
    if (onContinue) {
      onContinue(); // Navigate to onboarding
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        // Screen 1: Welcome
        return (
          <>
            <div className="ios-install-modal__header">
              <h2 className="ios-install-modal__title">Add Trackabite to your home screen</h2>
              <p className="ios-install-modal__subtitle">
                Get the full app experience with quick access from your home screen
              </p>
            </div>
            <button className="ios-install-modal__continue" onClick={handleNext}>
              Next
            </button>
          </>
        );

      case 1:
        // Screen 2: Step 1
        return (
          <>
            <div className="ios-install-modal__header">
              <span className="ios-install-modal__step-label">Step 1.</span>
              <h2 className="ios-install-modal__title">Tap the Share button</h2>
              <div className="ios-install-modal__icon-container">
                <img src={addToHomeIcon} alt="Add to home screen icon" className="ios-install-modal__share-icon" />
              </div>
              <p className="ios-install-modal__subtitle">
                Look for this icon at the bottom of Safari
              </p>
            </div>
            <button className="ios-install-modal__continue" onClick={handleNext}>
              Next
            </button>
          </>
        );

      case 2:
        // Screen 3: Step 2
        return (
          <>
            <div className="ios-install-modal__header">
              <span className="ios-install-modal__step-label">Step 2.</span>
              <h2 className="ios-install-modal__title">Scroll and tap<br />"Add to Home Screen"</h2>
              <p className="ios-install-modal__subtitle">
                You may need to scroll down in the share menu
              </p>
              <div className="ios-install-modal__screenshot-container">
                <img src={addToHomeScreenshot} alt="Add to home screen menu" className="ios-install-modal__screenshot" />
              </div>
            </div>
            <button className="ios-install-modal__continue" onClick={handleNext}>
              Next
            </button>
          </>
        );

      case 3:
        // Screen 4: Step 3
        return (
          <>
            <div className="ios-install-modal__header">
              <span className="ios-install-modal__step-label">Step 3.</span>
              <h2 className="ios-install-modal__title">Tap "Add"</h2>
              <p className="ios-install-modal__subtitle">
                Trackabite will appear on your home screen
              </p>
            </div>
            <button className="ios-install-modal__continue" onClick={handleNext}>
              Next
            </button>
          </>
        );

      case 4:
        // Screen 5: Final confirmation
        return (
          <>
            <div className="ios-install-modal__header">
              <h2 className="ios-install-modal__title">Perfect! Now add Trackabite to your screen to start tracking and creating your recipes</h2>
            </div>
            <button className="ios-install-modal__continue" onClick={onClose}>
              Done
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ios-install-modal__overlay" onClick={onClose}>
      <div className="ios-install-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="ios-install-modal__close" onClick={onClose}>
          ✕
        </button>

        {renderContent()}

        {/* Step indicator dots */}
        <div className="ios-install-modal__step-indicator">
          {[0, 1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`ios-install-modal__step-dot ${
                step === currentStep ? 'ios-install-modal__step-dot--active' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IOSInstallModal;
