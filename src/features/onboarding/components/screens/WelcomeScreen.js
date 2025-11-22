import React, { useEffect } from 'react';
import fridgyLogo from '../../../../assets/images/Logo.png';
import { trackOnboardingStepViewed } from '../../../../utils/onboardingTracking';
import './ScreenStyles.css';

const WelcomeScreen = ({ onNext, onExit }) => {
  useEffect(() => {
    trackOnboardingStepViewed(1);
  }, []);
  return (
    <div className="onboarding-screen onboarding-screen--welcome">
      <div className="onboarding-screen__content">
        <div className="welcome-logo">
          <img src={fridgyLogo} alt="Fridgy Logo" className="welcome-logo__image" />
        </div>
        
        <h1 className="onboarding-screen__title">
          Welcome to Trackabite!
        </h1>
        
        <p className="onboarding-screen__subtitle">
          Eat better, waste less, and start saving more—all from your fridge.
        </p>
        
        <div className="onboarding-screen__actions">
          <button 
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            onClick={onNext}
          >
            Let's Get Started
          </button>
          <button 
            className="onboarding-btn onboarding-btn--outline onboarding-btn--large"
            onClick={() => window.location.href = '/signin'}
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;