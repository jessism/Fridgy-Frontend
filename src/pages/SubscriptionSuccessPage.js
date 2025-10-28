/**
 * SubscriptionSuccessPage Component
 * Confirmation page shown after successful Stripe checkout
 * Handles both PWA (in-app) and Safari (external redirect) contexts
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './SubscriptionSuccessPage.css';

function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [isInPWA, setIsInPWA] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Check if this is a fallback redirect (shouldn't happen in normal flow)
  const isFallback = searchParams.get('fallback') === 'true';
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Detect if we're in PWA or Safari
    const checkPWAMode = () => {
      // Check display mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSPWA = window.navigator.standalone === true;
      const isPWA = isStandalone || isIOSPWA;

      console.log('[SubscriptionSuccess] Display mode check:', {
        isStandalone,
        isIOSPWA,
        isPWA,
        isAuthenticated,
        hasUser: !!user
      });

      setIsInPWA(isPWA);
      return isPWA;
    };

    const inPWA = checkPWAMode();

    // If in PWA and authenticated, auto-redirect after countdown
    if (inPWA && isAuthenticated) {
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
    }
  }, [navigate, isAuthenticated, user]);

  // Get app URL from env or use current origin
  const appURL = process.env.REACT_APP_PWA_URL || window.location.origin;

  // SAFARI MODE: Show "Return to App" prompt
  if (!isInPWA || !isAuthenticated) {
    return (
      <div className="subscription-success">
        <div className="subscription-success__container">
          {/* Fallback notice - shouldn't happen in normal flow */}
          {isFallback && (
            <div className="subscription-success__fallback-notice">
              <p>⚠️ You've reached this page unexpectedly.</p>
              <p>This is a fallback route that should only activate if the in-app checkout flow fails.</p>
              <p>Your payment was successful - please return to the app to continue.</p>
            </div>
          )}

          <div className="subscription-success__icon">🎉</div>

          <h1 className="subscription-success__title">
            Welcome to Trackabite Pro!
          </h1>

          <p className="subscription-success__message">
            Your 7-day free trial has started. You now have unlimited access to
            all premium features!
          </p>

          <div className="subscription-success__features">
            <div className="subscription-success__feature">
              <span className="subscription-success__checkmark">✅</span>
              <span>Unlimited inventory tracking</span>
            </div>
            <div className="subscription-success__feature">
              <span className="subscription-success__checkmark">✅</span>
              <span>Unlimited recipe imports</span>
            </div>
            <div className="subscription-success__feature">
              <span className="subscription-success__checkmark">✅</span>
              <span>AI-powered recommendations</span>
            </div>
            <div className="subscription-success__feature">
              <span className="subscription-success__checkmark">✅</span>
              <span>Advanced analytics</span>
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
              You'll be charged $4.99/month after your trial ends. Cancel anytime.
            </p>
          </div>

          {/* RETURN TO APP BUTTON */}
          <div className="subscription-success__actions">
            <a
              href={appURL}
              className="subscription-success__cta subscription-success__cta--primary"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
                textAlign: 'center'
              }}
            >
              🚀 Open Trackabite App
            </a>

            <p className="subscription-success__helper-text">
              Tap above to return to your app and start using your Pro features!
            </p>
          </div>

          {sessionId && (
            <p className="subscription-success__session-id">
              Session: {sessionId.substring(0, 15)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  // PWA MODE: Show normal success flow with auto-redirect
  return (
    <div className="subscription-success">
      <div className="subscription-success__container">
        <div className="subscription-success__icon">🎉</div>

        <h1 className="subscription-success__title">
          Welcome to Premium!
        </h1>

        <p className="subscription-success__message">
          Your 7-day free trial has started. You now have unlimited access to
          all Trackabite features!
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
