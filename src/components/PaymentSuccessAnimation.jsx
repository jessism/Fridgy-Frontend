import React, { useEffect, useState } from 'react';
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
    // Animation stages: enter -> show -> closing
    const timer1 = setTimeout(() => setAnimationStage('show'), 300);

    // If showing success, auto-close after 2.5 seconds
    if (status === 'success') {
      const timer2 = setTimeout(() => {
        setAnimationStage('closing');
        setTimeout(() => onComplete && onComplete(), 300);
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

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
            <div className="payment-success__checkmark">
              <svg viewBox="0 0 52 52">
                <circle className="payment-success__checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="payment-success__checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2>Premium Activated!</h2>
            <p>Welcome to Trackabite Premium</p>
            <ul className="payment-success__features">
              <li>✓ Unlimited inventory items</li>
              <li>✓ Unlimited recipes</li>
              <li>✓ AI recipe generation</li>
              <li>✓ Advanced analytics</li>
            </ul>
            <p className="payment-success__note">
              7-day free trial • $4.99/month after
            </p>
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
            <h2>Taking Longer Than Usual</h2>
            <p>Your payment was received successfully!</p>
            <p className="payment-success__pending-text">
              Premium features will activate within 5 minutes. You'll receive an email confirmation shortly.
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
