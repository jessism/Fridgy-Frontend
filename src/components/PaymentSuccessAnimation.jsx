import React, { useEffect, useState } from 'react';
import confettiIcon from '../assets/icons/Confetti.png';
import './PaymentSuccessAnimation.css';

/**
 * PaymentSuccessAnimation Component
 * Displays 4 possible states during payment processing:
 * - processing: Verifying payment with webhook
 * - success: Payment confirmed, premium activated
 * - error: Payment failed or verification error
 * - pending: Webhook delayed, still processing
 */
export const PaymentSuccessAnimation = ({ status, onComplete }) => {
  const [animationStage, setAnimationStage] = useState('enter');

  useEffect(() => {
    // Animation stages: enter -> show
    const timer1 = setTimeout(() => setAnimationStage('show'), 300);

    // Don't auto-close on success - user clicks button manually
    // Only auto-close for processing state (if needed)

    return () => clearTimeout(timer1);
  }, [status, onComplete]);

  return (
    <div className={`payment-success ${animationStage} payment-success--${status}`}>
      <div className="payment-success__content">

        {/* PROCESSING STATE */}
        {status === 'processing' && (
          <>
            <div className="payment-success__spinner" />
            <h2>Processing Payment...</h2>
            <p>Verifying your subscription</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <>
            <div className="payment-success__confetti">
              <img src={confettiIcon} alt="Success" />
            </div>

            <div className="payment-success__headline">
              <p className="payment-success__welcome">Welcome to</p>
              <h1 className="payment-success__brand">Trackabite Pro</h1>
            </div>

            <ul className="payment-success__features">
              <li>
                <svg className="feature-check" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                  <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Unlimited inventory tracking</span>
              </li>
              <li>
                <svg className="feature-check" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                  <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Unlimited recipe imports & uploads</span>
              </li>
              <li>
                <svg className="feature-check" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                  <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>AI-powered recipe recommendations</span>
              </li>
              <li>
                <svg className="feature-check" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                  <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Advanced analytics & insights</span>
              </li>
            </ul>

            <p className="payment-success__trial-description">
              Your FREE week has started. You won't be charged until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
            </p>

            <button
              className="payment-success__button payment-success__button--success"
              onClick={onComplete}
            >
              Enjoy Trackabite Pro
            </button>
          </>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <>
            <div className="payment-success__error-icon">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" stroke="#e74c3c" strokeWidth="2"/>
                <path fill="none" stroke="#e74c3c" strokeWidth="3" d="M16 16 L36 36 M36 16 L16 36"/>
              </svg>
            </div>
            <h2>Payment Issue</h2>
            <p>We couldn't complete your payment</p>
            <p className="payment-success__error-text">
              Please try again or contact support if the problem persists.
            </p>
            <button
              className="payment-success__button payment-success__button--error"
              onClick={onComplete}
            >
              Close
            </button>
          </>
        )}

        {/* PENDING STATE (webhook delayed) */}
        {status === 'pending' && (
          <>
            <div className="payment-success__pending-icon">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" stroke="#f39c12" strokeWidth="2"/>
                <text x="26" y="32" fontSize="24" textAnchor="middle" fill="#f39c12">i</text>
              </svg>
            </div>
            <h2>Almost There!</h2>
            <p>Your payment was processed successfully</p>
            <p className="payment-success__pending-text">
              Your premium features are activating. This usually takes just a few seconds. If features aren't unlocked within 5 minutes, please refresh the page or contact support.
            </p>
            <button
              className="payment-success__button payment-success__button--pending"
              onClick={onComplete}
            >
              Continue to App
            </button>
          </>
        )}
      </div>
    </div>
  );
};
