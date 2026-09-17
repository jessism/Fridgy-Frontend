import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout, OnboardingButton, OnboardingVideo } from '../shared';
import { VIDEOS } from '../../constants/onboardingConstants';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onNext }) => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout>
      <div className="ob-welcome">
        <OnboardingVideo
          src={VIDEOS.wave}
          className="ob-welcome__mascot"
          round
        />
        <h1 className="ob-h1--display ob-welcome__title">
          Welcome to Trackabite
        </h1>
        <p className="ob-sub">Eat smarter. Feel better.</p>
      </div>

      <div className="ob-footer">
        <OnboardingButton onClick={onNext}>Get Started</OnboardingButton>
        <OnboardingButton variant="ghost" onClick={() => navigate('/signin')}>
          I have an account
        </OnboardingButton>
      </div>
    </OnboardingLayout>
  );
};

export default WelcomeScreen;
