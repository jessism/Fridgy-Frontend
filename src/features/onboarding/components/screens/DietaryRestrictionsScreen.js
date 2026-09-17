import React from 'react';
import { OnboardingLayout, OnboardingButton, OptionPill, PillWrap } from '../shared';
import { DIETARY_OPTIONS } from '../../constants/onboardingConstants';
import { toggleWithNone } from '../../utils/selection';

const DietaryRestrictionsScreen = ({ data, updateData, onNext, onBack, progress }) => (
  <OnboardingLayout showBack onBack={onBack} progress={progress}>
    <div className="ob-header-block">
      <h1 className="ob-h1">Do you have any dietary preferences?</h1>
      <p className="ob-sub">
        We'll filter recipes to match your diet. Select all that apply.
      </p>
    </div>

    <PillWrap>
      {DIETARY_OPTIONS.map(({ id, label }) => (
        <OptionPill
          key={id}
          label={label}
          selected={data.dietaryRestrictions?.includes(id)}
          onToggle={() =>
            updateData({
              dietaryRestrictions: toggleWithNone(data.dietaryRestrictions, id),
            })
          }
        />
      ))}
    </PillWrap>

    <div className="ob-footer">
      <OnboardingButton
        onClick={onNext}
        disabled={!data.dietaryRestrictions?.length}
      >
        Continue
      </OnboardingButton>
    </div>
  </OnboardingLayout>
);

export default DietaryRestrictionsScreen;
