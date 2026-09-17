import React from 'react';
import { OnboardingLayout, OnboardingButton, OptionPill, PillWrap } from '../shared';
import { ALLERGY_OPTIONS, NONE_ID } from '../../constants/onboardingConstants';
import { toggleWithNone } from '../../utils/selection';
import './AllergiesScreen.css';

const AllergiesScreen = ({ data, updateData, onNext, onBack, progress }) => {
  const onCustomChange = (customAllergies) => {
    // Typing a real allergy contradicts "None", so drop it.
    const hasText = customAllergies.trim().length > 0;
    const allergies =
      hasText && data.allergies?.includes(NONE_ID)
        ? data.allergies.filter((x) => x !== NONE_ID)
        : data.allergies;

    updateData({ customAllergies, allergies });
  };

  return (
    <OnboardingLayout showBack onBack={onBack} progress={progress}>
      <div className="ob-header-block">
        <h1 className="ob-h1">Any food allergies?</h1>
        <p className="ob-sub">
          We'll make sure to exclude recipes with these ingredients
        </p>
      </div>

      <PillWrap>
        {ALLERGY_OPTIONS.map(({ id, label }) => (
          <OptionPill
            key={id}
            label={label}
            selected={data.allergies?.includes(id)}
            onToggle={() =>
              updateData({ allergies: toggleWithNone(data.allergies, id) })
            }
          />
        ))}
      </PillWrap>

      <div className="ob-allergies__custom">
        <label className="ob-allergies__label" htmlFor="ob-other-allergies">
          Other allergies:
        </label>
        <textarea
          id="ob-other-allergies"
          className="ob-allergies__input"
          placeholder="e.g., Mustard, Celery, Lupin"
          value={data.customAllergies || ''}
          onChange={(e) => onCustomChange(e.target.value)}
          rows={3}
        />
      </div>

      <div className="ob-footer">
        {/* A custom allergy alone is a valid answer: typing one clears
            "None", which would otherwise leave the list empty and trap
            the user on this step. */}
        <OnboardingButton
          onClick={onNext}
          disabled={!data.allergies?.length && !data.customAllergies?.trim()}
        >
          Continue
        </OnboardingButton>
      </div>
    </OnboardingLayout>
  );
};

export default AllergiesScreen;
