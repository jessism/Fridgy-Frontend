import React from 'react';
import './OnboardingProgress.css';

const OnboardingProgress = ({ currentStep, totalSteps, onBack, showBack = true }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="onboarding-progress">
      <div className="onboarding-progress__header">
        <div className="onboarding-progress__left">
          {showBack && currentStep > 1 && (
            <button 
              className="onboarding-progress__back-btn"
              onClick={onBack}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className="onboarding-progress__bar">
            <div 
              className="onboarding-progress__bar-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;