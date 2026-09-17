import React from 'react';
import { OnboardingLayout, OnboardingButton, NumberStepper } from '../shared';
import { HOUSEHOLD_MIN, HOUSEHOLD_MAX } from '../../constants/onboardingConstants';

const HouseholdSizeScreen = ({ data, updateData, onNext, onBack, progress }) => (
  <OnboardingLayout showBack onBack={onBack} progress={progress}>
    <div className="ob-header-block">
      <h1 className="ob-h1">How many people are in your household?</h1>
      <p className="ob-sub">
        This helps us calculate portions and budget recommendations
      </p>
    </div>

    <div className="ob-body-center">
      <NumberStepper
        value={data.householdSize}
        onChange={(householdSize) => updateData({ householdSize })}
        min={HOUSEHOLD_MIN}
        max={HOUSEHOLD_MAX}
      />
    </div>

    <div className="ob-footer">
      <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
    </div>
  </OnboardingLayout>
);

export default HouseholdSizeScreen;
