import React from 'react';
import { OnboardingLayout, OnboardingButton, OnboardingVideo } from '../shared';
import { VIDEOS } from '../../constants/onboardingConstants';
import './HowItHelpsScreen.css';

const HowItHelpsScreen = ({ onNext, onBack, progress }) => (
  <OnboardingLayout showBack onBack={onBack} progress={progress}>
    <div className="ob-header-block">
      <h1 className="ob-h1">
        Here's how Trackabite makes your meal planning wayyy easier.
      </h1>
    </div>

    <div className="ob-howithelps">
      {/* The app overscans this clip ~115% to crop its padding. */}
      <div className="ob-howithelps__frame">
        <OnboardingVideo
          src={VIDEOS.sorting}
          className="ob-howithelps__video"
        />
      </div>
    </div>

    <div className="ob-footer">
      <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
    </div>
  </OnboardingLayout>
);

export default HowItHelpsScreen;
