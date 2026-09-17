import React from 'react';
import { OnboardingLayout, OnboardingButton } from '../shared';

const ReadyRoutineScreen = ({ onNext, onBack, progress }) => (
  <OnboardingLayout showBack onBack={onBack} progress={progress}>
    <div className="ob-body-center">
      <h1 className="ob-h1">{'Ready to make\nweeknights easier?'}</h1>
    </div>

    <div className="ob-footer">
      <OnboardingButton onClick={onNext}>Let's do it</OnboardingButton>
    </div>
  </OnboardingLayout>
);

export default ReadyRoutineScreen;
