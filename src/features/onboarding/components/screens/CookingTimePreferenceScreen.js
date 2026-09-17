import React from 'react';
import { OnboardingLayout, OnboardingButton, OptionCard, OptionGrid } from '../shared';
import { COOKING_TIME_OPTIONS } from '../../constants/onboardingConstants';

const CookingTimePreferenceScreen = ({ data, updateData, onNext, onBack, progress }) => (
  <OnboardingLayout showBack onBack={onBack} progress={progress}>
    <div className="ob-header-block">
      <h1 className="ob-h1">How much time do you like to spend cooking?</h1>
      <p className="ob-sub">We'll suggest recipes that fit your schedule</p>
    </div>

    <OptionGrid label="Cooking time preference">
      {COOKING_TIME_OPTIONS.map(({ id, label, Icon }) => (
        <OptionCard
          key={id}
          label={label}
          Icon={Icon}
          selected={data.cookingTimePreference === id}
          onSelect={() => updateData({ cookingTimePreference: id })}
        />
      ))}
    </OptionGrid>

    <div className="ob-footer">
      <OnboardingButton onClick={onNext} disabled={!data.cookingTimePreference}>
        Continue
      </OnboardingButton>
    </div>
  </OnboardingLayout>
);

export default CookingTimePreferenceScreen;
