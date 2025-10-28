import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentSuccessAnimation } from '../PaymentSuccessAnimation';
import './CheckoutModal.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SKtYdPxciP71bVE1Y1v0hT56aelWLNmMOyFEP7ubIdFt0Aq88HdN4vzVUwKCHlegMMui7dxPlyzit7cfdUyyyFd0045RlcApx');

export const CheckoutModal = ({ clientSecret, onClose, onSuccess, pollForUpgrade }) => {
  console.log('[CheckoutModal] RENDERING - clientSecret:', clientSecret ? 'Present' : 'Missing');

  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'processing' | 'success' | 'error' | 'pending'
  const pollingRef = useRef(false); // Prevent duplicate polling

  // Start polling for webhook confirmation
  const startPolling = useCallback(async () => {
    if (pollingRef.current) {
      console.log('[CheckoutModal] ⚠️ Polling already in progress, skipping...');
      return;
    }

    pollingRef.current = true;

    console.log('[CheckoutModal] 🔄 Starting webhook polling...');

    try {
      if (!pollForUpgrade) {
        console.error('[CheckoutModal] ❌ pollForUpgrade function not provided!');
        setPaymentStatus('error');
        return;
      }

      const result = await pollForUpgrade(15, 2000); // Poll for 30 seconds max

      if (result.upgraded) {
        console.log('[CheckoutModal] ✅ Webhook confirmed - Premium activated!');
        setPaymentStatus('success');
      } else if (result.failed) {
        console.log('[CheckoutModal] ❌ Payment verification failed');
        setPaymentStatus('error');
      } else if (result.pending) {
        console.log('[CheckoutModal] ⏰ Webhook delayed - showing pending state');
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('[CheckoutModal] ❌ Polling error:', error);
      setPaymentStatus('error');
    } finally {
      pollingRef.current = false;
      // Clear pending session marker
      localStorage.removeItem('fridgy_pending_checkout');
    }
  }, [pollForUpgrade]);

  // Network reconnection handler
  useEffect(() => {
    const handleOnline = () => {
      console.log('[CheckoutModal] 🌐 Network reconnected');
      // If we were processing payment when offline, retry polling
      if (paymentStatus === 'processing' && !pollingRef.current) {
        console.log('[CheckoutModal] 🔄 Retrying polling after reconnection...');
        startPolling();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [paymentStatus, startPolling]);

  // Session recovery: Check if there's a pending checkout
  useEffect(() => {
    const pendingSession = localStorage.getItem('fridgy_pending_checkout');
    if (pendingSession && clientSecret) {
      console.log('[CheckoutModal] 🔄 Recovering pending checkout session');
      // Optionally resume checking status
    }
  }, [clientSecret]);

  // Callback for when Stripe checkout completes
  const handleComplete = useCallback(() => {
    console.log('[CheckoutModal] ✅ Stripe onComplete fired - payment submitted!');

    // Store pending session for recovery
    localStorage.setItem('fridgy_pending_checkout', clientSecret);

    // Show processing state immediately
    setPaymentStatus('processing');

    // Start polling for webhook confirmation
    startPolling();
  }, [clientSecret, startPolling]);

  // Callback for when success animation completes
  const handleSuccessComplete = useCallback(() => {
    console.log('[CheckoutModal] 🎉 Success animation complete, navigating home...');

    // Close modal
    onClose();

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    // Navigate to home using React Router (NO page reload!)
    navigate('/home', { replace: true });
  }, [onClose, onSuccess, navigate]);

  // Handle error/pending completion (user clicks button)
  const handleErrorOrPendingComplete = useCallback(() => {
    console.log('[CheckoutModal] Closing modal after error/pending state');

    // Close modal
    onClose();

    // Navigate to home or billing depending on state
    if (paymentStatus === 'pending') {
      navigate('/home', { replace: true });
    } else {
      // Error state - stay on current page
    }
  }, [onClose, navigate, paymentStatus]);

  if (!clientSecret) {
    console.log('[CheckoutModal] No clientSecret, returning null');
    return null;
  }

  console.log('[CheckoutModal] Rendering -', paymentStatus || 'checkout');

  return (
    <div className="checkout-modal__overlay">
      {!paymentStatus ? (
        <>
          {/* Stripe Embedded Checkout */}
          <div className="checkout-modal__stripe-wrapper">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret, onComplete: handleComplete }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          {/* Close Button */}
          <button
            className="checkout-modal__close-btn"
            onClick={onClose}
            aria-label="Close checkout"
          >
            ×
          </button>
        </>
      ) : (
        /* Payment Processing/Success/Error/Pending Animation */
        <PaymentSuccessAnimation
          status={paymentStatus}
          onComplete={
            paymentStatus === 'success'
              ? handleSuccessComplete
              : handleErrorOrPendingComplete
          }
        />
      )}
    </div>
  );
};
