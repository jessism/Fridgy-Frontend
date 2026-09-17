import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { OnboardingLayout, OnboardingButton, OnboardingVideo } from '../shared';
import {
  GOAL_CONFIRMATION_MESSAGES,
  VIDEOS,
  STEPS,
} from '../../constants/onboardingConstants';
import './GoalConfirmationScreen.css';

const GoalConfirmationScreen = ({ data, onNext, onBack, progress, jumpToStep }) => {
  const copy = GOAL_CONFIRMATION_MESSAGES[data.primaryGoal];

  // Reachable by a manual jump or a stale draft; send them back to pick one.
  useEffect(() => {
    if (!copy && jumpToStep) jumpToStep(STEPS.GOAL);
  }, [copy, jumpToStep]);

  if (!copy) return null;

  return (
    <OnboardingLayout showBack onBack={onBack} progress={progress}>
      <div className="ob-confirm">
        <div className="ob-confirm__badge">
          <CheckCircle2 size={24} aria-hidden="true" />
          <span>{'This is exactly what\nTrackabite is built for.'}</span>
        </div>

        <OnboardingVideo
          src={VIDEOS.reaffirm}
          className="ob-confirm__mascot"
          round
        />

        <h1 className="ob-h1--display ob-confirm__title">{copy.title}</h1>
        <p className="ob-sub">{copy.message}</p>
      </div>

      <div className="ob-footer">
        <OnboardingButton onClick={onNext}>Let's do this!</OnboardingButton>
      </div>
    </OnboardingLayout>
  );
};

export default GoalConfirmationScreen;
