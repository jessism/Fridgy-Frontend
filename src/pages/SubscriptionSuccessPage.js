/**
 * SubscriptionSuccessPage Component
 * Confirmation page shown after successful Stripe checkout
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import './SubscriptionSuccessPage.css';

function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useSubscription();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh subscription status to get updated tier
    refresh();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refresh, navigate]);

  const sessionId = searchParams.get('session_id');

  return (
    <div className="subscription-success">
      <div className="subscription-success__container">
        <div className="subscription-success__icon">🎉</div>

        <h1 className="subscription-success__title">
          Welcome to Premium!
        </h1>

        <p className="subscription-success__message">
          Your 7-day free trial has started. You now have unlimited access to
          all Fridgy features!
        </p>

        <div className="subscription-success__features">
          <div className="subscription-success__feature">
            <span className="subscription-success__checkmark">✅</span>
            <span>Unlimited inventory tracking</span>
          </div>
          <div className="subscription-success__feature">
            <span className="subscription-success__checkmark">✅</span>
            <span>Unlimited recipe imports & uploads</span>
          </div>
          <div className="subscription-success__feature">
            <span className="subscription-success__checkmark">✅</span>
            <span>AI-powered recipe recommendations</span>
          </div>
          <div className="subscription-success__feature">
            <span className="subscription-success__checkmark">✅</span>
            <span>Advanced analytics & insights</span>
          </div>
        </div>

        <div className="subscription-success__trial-info">
          <p>
            <strong>Your trial ends:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="subscription-success__billing-note">
            You'll be charged $4.99/month after your trial ends. Cancel anytime
            from your billing page.
          </p>
        </div>

        <div className="subscription-success__actions">
          <button
            className="subscription-success__cta"
            onClick={() => navigate('/home')}
          >
            Get Started
          </button>

          <button
            className="subscription-success__secondary"
            onClick={() => navigate('/billing')}
          >
            View Billing Details
          </button>
        </div>

        <p className="subscription-success__redirect">
          Redirecting to dashboard in {countdown} seconds...
        </p>

        {sessionId && (
          <p className="subscription-success__session-id">
            Session ID: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default SubscriptionSuccessPage;
