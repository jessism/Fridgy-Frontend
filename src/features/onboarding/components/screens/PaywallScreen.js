import React from 'react';
import { Check } from 'lucide-react';
import { OnboardingLayout, OnboardingButton, OnboardingVideo } from '../shared';
import { usePrice } from '../../../../contexts/PriceContext';
import { trackPaymentChoice } from '../../../../utils/onboardingTracking';
import {
  PREMIUM_FEATURES,
  VIDEOS,
  STEPS,
  STORAGE_KEYS,
} from '../../constants/onboardingConstants';
import './PaywallScreen.css';

/**
 * Rebuilt to match the app's PremiumUpsellScreen: no back chevron, no
 * progress bar, only a top-right X.
 *
 * The app buys here via RevenueCat and goes straight to account creation.
 * On web the CTA hands off to the Stripe step instead; the X is the
 * free-tier path and skips it.
 */
const PaywallScreen = ({ jumpToStep }) => {
  const { formatted, loading } = usePrice();

  const onTrial = () => {
    trackPaymentChoice('trial');
    try {
      localStorage.setItem(STORAGE_KEYS.WANTS_TRIAL, 'true');
    } catch (e) {
      /* storage blocked; the Stripe session still carries the intent */
    }
    jumpToStep(STEPS.PAYMENT);
  };

  const onClose = () => {
    trackPaymentChoice('free');
    try {
      localStorage.removeItem(STORAGE_KEYS.WANTS_TRIAL);
    } catch (e) {
      /* nothing to clear */
    }
    jumpToStep(STEPS.CREATE_ACCOUNT);
  };

  return (
    <OnboardingLayout showClose onClose={onClose} className="ob-paywall">
      <div className="ob-paywall__body">
        <OnboardingVideo
          src={VIDEOS.reaffirm}
          className="ob-paywall__mascot"
          round
        />

        <h1 className="ob-h1--display ob-paywall__title">
          {'Plan your week\n'}
          <span className="ob-paywall__accent">in minutes</span>
        </h1>

        <ul className="ob-paywall__features">
          {PREMIUM_FEATURES.map(({ title, description }) => (
            <li key={title}>
              <span className="ob-paywall__check" aria-hidden="true">
                <Check size={16} strokeWidth={3} />
              </span>
              <span>
                <strong>{title}</strong>
                <span className="ob-paywall__feature-desc">{description}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="ob-paywall__card">
          <span className="ob-paywall__plan">MONTHLY PLAN</span>
          <div className="ob-paywall__price">
            <span className="ob-paywall__amount">
              {loading ? 'Loading...' : formatted}
            </span>
            {!loading && <span className="ob-paywall__interval">/mo</span>}
          </div>
          <span className="ob-paywall__badge">7 DAYS FREE TRIAL</span>
        </div>
      </div>

      <div className="ob-footer ob-paywall__footer">
        <OnboardingButton onClick={onTrial}>Try It Free</OnboardingButton>
        <p className="ob-footnote ob-paywall__fineprint">
          Cancel anytime • No commitment
        </p>
        <p className="ob-footnote ob-paywall__legal">
          <a href="/terms">Terms of Use</a>
          <span aria-hidden="true"> • </span>
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </OnboardingLayout>
  );
};

export default PaywallScreen;
