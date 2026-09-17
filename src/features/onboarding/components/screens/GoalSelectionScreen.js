import React from 'react';
import { OnboardingLayout, OnboardingButton, OptionCard, OptionGrid } from '../shared';
import { GOAL_OPTIONS } from '../../constants/onboardingConstants';

const GoalSelectionScreen = ({ data, updateData, onNext, onBack, progress }) => (
  <OnboardingLayout showBack onBack={onBack} progress={progress}>
    <div className="ob-header-block">
      <h1 className="ob-h1--display">What's your main goal?</h1>
      <p className="ob-sub">This helps us personalize your experience</p>
    </div>

    <OptionGrid label="Main goal">
      {GOAL_OPTIONS.map(({ id, label, Icon }) => (
        <OptionCard
          key={id}
          label={label}
          Icon={Icon}
          selected={data.primaryGoal === id}
          onSelect={() => updateData({ primaryGoal: id })}
        />
      ))}
    </OptionGrid>

    <div className="ob-footer">
      <OnboardingButton onClick={onNext} disabled={!data.primaryGoal}>
        Continue
      </OnboardingButton>
    </div>
  </OnboardingLayout>
);

export default GoalSelectionScreen;
