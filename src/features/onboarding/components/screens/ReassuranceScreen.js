import React from 'react';
import { Heart } from 'lucide-react';
import { OnboardingLayout, OnboardingButton } from '../shared';
import './ReassuranceScreen.css';

const ReassuranceScreen = ({ onNext, onBack, progress }) => (
  <OnboardingLayout showBack onBack={onBack} progress={progress}>
    <div className="ob-body-center">
      <Heart className="ob-reassure__icon" size={64} aria-hidden="true" />
      <h1 className="ob-h1 ob-reassure__title">
        {'Perfect.\nThat helps a lot.'}
      </h1>
      <p className="ob-sub">
        We've got a good sense of your kitchen and routine now.
      </p>
      <p className="ob-footnote">
        You can change this anytime in Profile &gt; Preferences.
      </p>
    </div>

    <div className="ob-footer">
      <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
    </div>
  </OnboardingLayout>
);

export default ReassuranceScreen;
