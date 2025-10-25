import React, { useCallback } from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './CheckoutModal.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SKtYdPxciP71bVE1Y1v0hT56aelWLNmMOyFEP7ubIdFt0Aq88HdN4vzVUwKCHlegMMui7dxPlyzit7cfdUyyyFd0045RlcApx');

export const CheckoutModal = ({ clientSecret, onClose }) => {
  console.log('[CheckoutModal] RENDERING - clientSecret:', clientSecret ? 'Present' : 'Missing');

  // Callback for when checkout completes
  const handleComplete = useCallback(() => {
    console.log('[CheckoutModal] Checkout completed!');
    // Modal will auto-close and user will be redirected via return_url
  }, []);

  if (!clientSecret) {
    console.log('[CheckoutModal] No clientSecret, returning null');
    return null;
  }

  console.log('[CheckoutModal] Rendering embedded checkout...');

  return (
    <div className="checkout-modal__overlay">
      {/* Stripe Embedded Checkout */}
      <div className="checkout-modal__stripe-wrapper">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret, onComplete: handleComplete }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      {/* Close Button - Rendered last to be on top */}
      <button
        className="checkout-modal__close-btn"
        onClick={onClose}
        aria-label="Close checkout"
      >
        ×
      </button>
    </div>
  );
};
