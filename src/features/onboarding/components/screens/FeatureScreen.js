import React from 'react';
import { OnboardingLayout, OnboardingButton, PhoneMock } from '../shared';
import { getFeatureSlide } from '../../constants/onboardingConstants';
import './FeatureScreen.css';

/**
 * One component for steps 11-14. The app splits these into four dedicated
 * screens (they were a single carousel before the Feb 10 redesign), so the
 * web mirrors that rather than reusing the old FeatureTourScreen carousel.
 */
const FeatureScreen = ({ featureId, onNext, onBack, progress }) => {
  const slide = getFeatureSlide(featureId);
  if (!slide) return null;

  const { title, description, highlightText, descriptionAfter, video } = slide;

  return (
    <OnboardingLayout showBack onBack={onBack} progress={progress}>
      <div className="ob-feature">
        <PhoneMock src={video} />

        <div className="ob-feature__copy">
          <h1 className="ob-h1--feature">{title}</h1>
          <p className="ob-sub ob-feature__desc">
            {description}
            {highlightText && (
              <span className="ob-highlight">{highlightText}</span>
            )}
            {descriptionAfter}
          </p>
        </div>
      </div>

      <div className="ob-footer">
        <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
      </div>
    </OnboardingLayout>
  );
};

export default FeatureScreen;
