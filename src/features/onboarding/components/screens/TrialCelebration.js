import React, { useEffect, useRef, useState } from 'react';
import { OnboardingVideo } from '../shared';
import { VIDEOS } from '../../constants/onboardingConstants';
import '../../styles/onboarding-theme.css';
import './TrialCelebration.css';

// react-native-confetti-cannon's default palette, so the burst reads the
// same as the app's.
const CONFETTI_COLORS = [
  '#e67e22', '#2ecc71', '#3498db', '#84aac2', '#e6d68d', '#f67933',
  '#42a858', '#4f50a2', '#a86bb7', '#e74c3c', '#1abc9c',
];
const PIECES_PER_BURST = 60;
// The app fires two cannons, 300ms and 1000ms after the modal opens.
const BURST_DELAYS_MS = [300, 1000];

const makeConfetti = () =>
  BURST_DELAYS_MS.flatMap((burstDelay, burst) =>
    Array.from({ length: PIECES_PER_BURST }, (_, i) => ({
      key: `${burst}-${i}`,
      style: {
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        animationDelay: `${burstDelay + Math.random() * 400}ms`,
        animationDuration: `${2400 + Math.random() * 1400}ms`,
        '--ob-confetti-drift': `${Math.random() * 160 - 80}px`,
        '--ob-confetti-spin': `${Math.random() * 1080 - 540}deg`,
      },
    }))
  );

const trialEndLabel = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/**
 * The web counterpart of the app's ProUpgradeCelebrationModal: dimmed
 * backdrop, a card that springs in, the big-win mascot in a circle, two
 * confetti bursts and one button.
 *
 * The charge-date line is web-only. On the app Apple states the terms on
 * its own sheet; here Stripe does not, so we do.
 */
const TrialCelebration = ({ onContinue }) => {
  const [confetti] = useState(makeConfetti);
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="ob-root ob-celebrate">
      <div className="ob-celebrate__confetti" aria-hidden="true">
        {confetti.map(({ key, style }) => (
          <span key={key} className="ob-celebrate__piece" style={style} />
        ))}
      </div>

      <div
        className="ob-celebrate__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ob-celebrate-title"
      >
        <div className="ob-celebrate__mascot">
          <OnboardingVideo
            src={VIDEOS.bigWin}
            className="ob-celebrate__video"
            objectFit="cover"
          />
        </div>

        <h1 id="ob-celebrate-title" className="ob-celebrate__title">
          Welcome to Trackabite Pro!
        </h1>
        <p className="ob-celebrate__message">
          Your subscription is now active. Enjoy unlimited access to all premium features!
        </p>

        <button
          ref={buttonRef}
          type="button"
          className="ob-celebrate__button"
          onClick={onContinue}
        >
          Let's go!
        </button>

        <p className="ob-celebrate__terms">
          Your free week has started. You won't be charged until {trialEndLabel()}.
        </p>
      </div>
    </div>
  );
};

export default TrialCelebration;
