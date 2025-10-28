import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentSuccessAnimation } from '../PaymentSuccessAnimation';
import './CheckoutModal.css';

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SKtYdPxciP71bVE1Y1v0hT56aelWLNmMOyFEP7ubIdFt0Aq88HdN4vzVUwKCHlegMMui7dxPlyzit7cfdUyyyFd0045RlcApx');

/**
 * Inner Payment Form Component
 * Uses Stripe hooks - must be inside Elements provider
 */
const PaymentForm = ({ subscriptionId, requiresSetup, onSuccess, onError, onPending }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Race condition guard
    if (isSubmitting || submittingRef.current) {
      console.warn('[PaymentForm] Payment already in progress');
      return;
    }

    if (!stripe || !elements) {
      console.warn('[PaymentForm] Stripe not ready');
      return;
    }

    setIsSubmitting(true);
    submittingRef.current = true;
    setErrorMessage('');

    try {
      let confirmResult;

      if (requiresSetup) {
        // TRIAL: Confirm SetupIntent (card verification, no charge)
        console.log('[PaymentForm] Confirming setup for trial subscription...');

        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
          confirmParams: {
            // NO return_url - stays in PWA!
          }
        });

        if (error) {
          console.error('[PaymentForm] Setup error:', error);
          setErrorMessage(error.message);
          onError(error.message);
          setIsSubmitting(false);
          submittingRef.current = false;
          return;
        }

        confirmResult = { type: 'setup', id: setupIntent.id, status: setupIntent.status };
      } else {
        // NON-TRIAL: Confirm PaymentIntent (immediate charge)
        console.log('[PaymentForm] Confirming payment for non-trial subscription...');

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
          confirmParams: {
            // NO return_url - stays in PWA!
          }
        });

        if (error) {
          console.error('[PaymentForm] Payment error:', error);
          setErrorMessage(error.message);
          onError(error.message);
          setIsSubmitting(false);
          submittingRef.current = false;
          return;
        }

        confirmResult = { type: 'payment', id: paymentIntent.id, status: paymentIntent.status };
      }

      // Check if confirmation succeeded
      if (confirmResult && confirmResult.status === 'succeeded') {
        console.log(`[PaymentForm] ✅ ${confirmResult.type === 'setup' ? 'Setup' : 'Payment'} succeeded! Activating subscription...`);

        // Call backend to IMMEDIATELY activate
        const token = localStorage.getItem('fridgy_token');
        const confirmRes = await fetch(`${API_BASE_URL}/subscriptions/confirm-subscription`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentIntentId: confirmResult.id, // Could be setupIntentId or paymentIntentId
            subscriptionId: subscriptionId
          })
        });

        const result = await confirmRes.json();

        if (result.success) {
          console.log('[PaymentForm] ✅ Subscription activated!');
          onSuccess();
        } else if (result.requiresSupport) {
          console.warn('[PaymentForm] ⚠️ Setup succeeded but verification pending');
          onPending(result.message);
        } else {
          console.error('[PaymentForm] ❌ Activation failed:', result.error);
          onError(result.error || 'Activation failed');
        }
      }
    } catch (error) {
      console.error('[PaymentForm] Error:', error);
      onError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Start Your 7-Day Free Trial</h2>
      <p className="checkout-modal__subtitle">$4.99/month after trial ends • Cancel anytime</p>

      <div className="checkout-modal__payment-element">
        <PaymentElement
          options={{
            layout: 'tabs'
          }}
        />
      </div>

      {errorMessage && (
        <div className="checkout-modal__error">
          {errorMessage}
        </div>
      )}

      <div className="checkout-modal__actions">
        <button
          type="submit"
          className="checkout-modal__submit-btn"
          disabled={isSubmitting || !stripe || !elements}
        >
          {isSubmitting ? 'Processing...' : 'Start Free Trial'}
        </button>
      </div>

      <p className="checkout-modal__trial-info">
        You won't be charged today. Your trial starts immediately and you can cancel anytime during the 7-day trial period.
      </p>
    </form>
  );
};

/**
 * Main CheckoutModal Component
 * Wraps PaymentForm in Elements provider
 */
export const CheckoutModal = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Create subscription intent on mount
  useEffect(() => {
    createSubscriptionIntent();
  }, []);

  const createSubscriptionIntent = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('[CheckoutModal] Creating subscription intent...');

      const res = await fetch(`${API_BASE_URL}/subscriptions/create-subscription-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promoCode: null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create subscription');
      }

      const data = await res.json();

      console.log('[CheckoutModal] Server response:', data);

      if (!data.clientSecret || !data.subscriptionId) {
        throw new Error(data.message || 'Invalid response from server');
      }

      console.log('[CheckoutModal] ✅ Subscription intent created');
      console.log('[CheckoutModal] Requires setup (trial):', data.requiresSetup);

      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);
      setRequiresSetup(data.requiresSetup || false);
      setPaymentStatus('form');
    } catch (error) {
      console.error('[CheckoutModal] Error creating subscription intent:', error);
      console.error('[CheckoutModal] Error details:', error.message);
      setErrorMessage(error.message || 'Failed to start checkout');
      setPaymentStatus('error');
    }
  };

  const handleSuccess = () => {
    setPaymentStatus('success');
  };

  const handleError = (message) => {
    setErrorMessage(message);
    setPaymentStatus('error');
  };

  const handlePending = (message) => {
    setErrorMessage(message);
    setPaymentStatus('pending');
  };

  const handleSuccessComplete = () => {
    console.log('[CheckoutModal] Success complete, closing and navigating...');

    if (onSuccess) {
      onSuccess();
    }

    onClose();
    navigate('/home', { replace: true });
  };

  const handleErrorComplete = () => {
    onClose();
  };

  return (
    <div className="checkout-modal__overlay">
      <div className="checkout-modal__content">
        {paymentStatus === 'loading' && (
          <div className="checkout-modal__loading">
            <div className="spinner"></div>
            <p>Loading checkout...</p>
          </div>
        )}

        {paymentStatus === 'form' && clientSecret && (
          <div className="checkout-modal__form">
            <button
              className="checkout-modal__close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                subscriptionId={subscriptionId}
                requiresSetup={requiresSetup}
                onSuccess={handleSuccess}
                onError={handleError}
                onPending={handlePending}
              />
            </Elements>
          </div>
        )}

        {paymentStatus === 'processing' && (
          <PaymentSuccessAnimation status="processing" />
        )}

        {paymentStatus === 'success' && (
          <PaymentSuccessAnimation status="success" onComplete={handleSuccessComplete} />
        )}

        {(paymentStatus === 'error' || paymentStatus === 'pending') && (
          <>
            <button
              className="checkout-modal__close-btn"
              onClick={handleErrorComplete}
              aria-label="Close"
            >
              ×
            </button>
            <PaymentSuccessAnimation
              status={paymentStatus}
              onComplete={handleErrorComplete}
            />
          </>
        )}
      </div>
    </div>
  );
};
