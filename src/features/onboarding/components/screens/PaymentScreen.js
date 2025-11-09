import React, { useState, useEffect, useRef } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './ScreenStyles.css';

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SKtYdPxciP71bVE1Y1v0hT56aelWLNmMOyFEP7ubIdFt0Aq88HdN4vzVUwKCHlegMMui7dxPlyzit7cfdUyyyFd0045RlcApx');

/**
 * Inner Payment Form Component for Onboarding
 */
const PaymentForm = ({ subscriptionId, requiresSetup, onSuccess, onError, onPending, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || submittingRef.current) {
      console.warn('[PaymentScreen] Payment already in progress');
      return;
    }

    if (!stripe || !elements) {
      console.warn('[PaymentScreen] Stripe not ready');
      return;
    }

    setIsSubmitting(true);
    submittingRef.current = true;
    setErrorMessage('');

    try {
      let confirmResult;

      if (requiresSetup) {
        // TRIAL: Confirm SetupIntent (card verification, no charge)
        console.log('[PaymentScreen] Confirming setup for trial subscription...');

        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
          confirmParams: {
            // NO return_url - stays in app
          }
        });

        if (error) {
          console.error('[PaymentScreen] Setup error:', error);
          setErrorMessage(error.message);
          onError(error.message);
          setIsSubmitting(false);
          submittingRef.current = false;
          return;
        }

        confirmResult = { type: 'setup', id: setupIntent.id, status: setupIntent.status };
      } else {
        // NON-TRIAL: Confirm PaymentIntent (immediate charge)
        console.log('[PaymentScreen] Confirming payment for non-trial subscription...');

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
          confirmParams: {
            // NO return_url - stays in app
          }
        });

        if (error) {
          console.error('[PaymentScreen] Payment error:', error);
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
        console.log(`[PaymentScreen] ✅ ${confirmResult.type === 'setup' ? 'Setup' : 'Payment'} succeeded! Confirming with backend...`);

        // Call backend to confirm payment (public endpoint)
        const sessionId = localStorage.getItem('fridgy_onboarding_session_id');
        const confirmRes = await fetch(`${API_BASE_URL}/onboarding/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // No Authorization header needed - this is a public endpoint
          },
          body: JSON.stringify({
            sessionId: sessionId,
            paymentIntentId: confirmResult.id,
            subscriptionId: subscriptionId
          })
        });

        const result = await confirmRes.json();

        console.log('[PaymentScreen] Backend response:', result);

        if (result.success) {
          console.log('[PaymentScreen] ✅ Subscription activated! Calling onSuccess()');
          onSuccess();
        } else if (result.requiresSupport) {
          console.warn('[PaymentScreen] ⚠️ Setup succeeded but verification pending');
          onPending(result.message);
        } else {
          console.error('[PaymentScreen] ❌ Activation failed:', result.error);
          onError(result.error || 'Activation failed');
        }
      }
    } catch (error) {
      console.error('[PaymentScreen] Error:', error);
      onError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="onboarding-screen onboarding-screen--payment">
      <div className="onboarding-screen__content" style={{ position: 'relative', paddingTop: '0' }}>
        <button
          onClick={onBack}
          type="button"
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '6px',
            color: '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          ✕
        </button>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '24px',
          marginTop: '30px',
          textAlign: 'center',
          lineHeight: '1.3'
        }}>
          Start Your<br />7-Day Free Trial
        </h2>

        <div style={{
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <PaymentElement
            options={{
              layout: 'tabs'
            }}
          />
        </div>

        {errorMessage && (
          <div style={{
            maxWidth: '400px',
            margin: '16px auto',
            padding: '12px',
            background: '#fee',
            color: '#c00',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#4fcf61',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '18px' }}>✓</span>
            No payment due now
          </div>
        </div>

        <div className="onboarding-screen__actions" style={{ marginBottom: '0' }}>
          <button
            onClick={handleSubmit}
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            disabled={isSubmitting || !stripe || !elements}
          >
            {isSubmitting ? 'Processing...' : 'Start Free Trial'}
          </button>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '8px auto 0',
          lineHeight: '1.5'
        }}>
          $4.99/month after trial ends. Your trial starts immediately and you can cancel anytime during the 7-day trial period.
        </p>
      </div>
    </div>
  );
};

/**
 * Main PaymentScreen Component for Onboarding
 */
const PaymentScreen = ({ data, updateData, jumpToStep, onBack }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Create subscription intent on mount
  useEffect(() => {
    createSubscriptionIntent();
  }, []);

  const getOrCreateSessionId = async () => {
    // Check if we already have a session ID
    let sessionId = localStorage.getItem('fridgy_onboarding_session_id');

    if (!sessionId) {
      // Create a new session
      console.log('[PaymentScreen] Creating new onboarding session...');

      const response = await fetch(`${API_BASE_URL}/onboarding/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.sessionId) {
        sessionId = result.sessionId;
        localStorage.setItem('fridgy_onboarding_session_id', sessionId);
        console.log('[PaymentScreen] Session created:', sessionId);
      } else {
        throw new Error('Failed to create onboarding session');
      }
    }

    return sessionId;
  };

  const createSubscriptionIntent = async () => {
    try {
      // Get or create session ID
      const sessionId = await getOrCreateSessionId();

      console.log('[PaymentScreen] Creating payment intent for session:', sessionId);

      const response = await fetch(`${API_BASE_URL}/onboarding/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header needed - this is a public endpoint
        },
        body: JSON.stringify({
          sessionId: sessionId,
          isOnboarding: true // Flag to indicate this is from onboarding
          // priceId will default to backend's STRIPE_PRICE_ID from .env
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      console.log('[PaymentScreen] Subscription intent created:', result);

      setClientSecret(result.clientSecret);
      setSubscriptionId(result.subscriptionId);
      setRequiresSetup(result.requiresSetup);
      setPaymentStatus('ready');
    } catch (error) {
      console.error('[PaymentScreen] Error creating subscription intent:', error);
      setErrorMessage(error.message);
      setPaymentStatus('error');
    }
  };

  const handleSuccess = () => {
    console.log('[PaymentScreen] Payment successful!');

    // Store payment completion flag
    localStorage.setItem('fridgy_payment_completed', 'true');
    localStorage.setItem('fridgy_subscription_id', subscriptionId);

    // Update onboarding data
    if (updateData) {
      updateData({
        paymentCompleted: true,
        subscriptionId: subscriptionId
      });
    }

    // Show success animation
    setShowSuccess(true);

    // Navigate to account creation after brief delay
    setTimeout(() => {
      jumpToStep(13); // Go to account creation
    }, 2000);
  };

  const handleError = (error) => {
    console.error('[PaymentScreen] Payment error:', error);
    setErrorMessage(error);
    setPaymentStatus('error');
  };

  const handlePending = (message) => {
    console.log('[PaymentScreen] Payment pending:', message);
    setErrorMessage(message || 'Your payment is being verified. Please wait...');
    setPaymentStatus('pending');
  };

  const handleBack = () => {
    // Skip payment and go to account creation
    jumpToStep(13);
  };

  // Show success animation
  if (showSuccess) {
    return (
      <div className="onboarding-screen">
        <div className="onboarding-screen__content">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '24px',
              animation: 'bounce 0.5s ease'
            }}>
              ✅
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '8px'
            }}>
              Payment Successful!
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Your trial has been activated. Let's create your account...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (paymentStatus === 'loading') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4fcf61 0%, #3ab54a 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center'
        }}>
          Trackabite
        </div>

        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'white',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0s'
          }} />
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'white',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0.2s'
          }} />
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'white',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0.4s'
          }} />
        </div>

        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '500'
        }}>
          Preparing your trial...
        </p>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Show error state
  if (paymentStatus === 'error' && !clientSecret) {
    return (
      <div className="onboarding-screen">
        <div className="onboarding-screen__content">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '24px'
            }}>
              ⚠️
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#c00',
              marginBottom: '8px'
            }}>
              Unable to load payment form
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '24px'
            }}>
              {errorMessage || 'Please try again later'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="onboarding-btn onboarding-btn--secondary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render payment form when ready
  if (clientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#4fcf61',
              borderRadius: '8px'
            }
          }
        }}
      >
        <PaymentForm
          subscriptionId={subscriptionId}
          requiresSetup={requiresSetup}
          onSuccess={handleSuccess}
          onError={handleError}
          onPending={handlePending}
          onBack={handleBack}
        />
      </Elements>
    );
  }

  return null;
};

export default PaymentScreen;