import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentSuccessAnimation } from '../PaymentSuccessAnimation';
import './CheckoutModal.css';

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Inner Payment Form Component
 * Uses Stripe hooks - must be inside Elements provider
 */
const PaymentForm = ({
  subscriptionId,
  requiresSetup,
  promoCode,
  promoDiscount,
  promoCodeInput,
  promoError,
  setPromoError,
  promoValidating,
  showPromoInput,
  setPromoCode,
  setShowPromoInput,
  validatePromoCode,
  onRemovePromo,
  onSuccess,
  onError,
  onPending
}) => {
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

        console.log('[PaymentForm] Backend response:', result);
        console.log('[PaymentForm] result.success:', result.success);
        console.log('[PaymentForm] result.requiresSupport:', result.requiresSupport);

        if (result.success) {
          console.log('[PaymentForm] ✅ Payment confirmed, waiting for webhook activation...');

          // Poll subscription status until user becomes premium
          let pollAttempts = 0;
          const maxAttempts = 15; // 30 seconds (poll every 2s)

          const pollInterval = setInterval(async () => {
            pollAttempts++;
            console.log(`[PaymentForm] Polling attempt ${pollAttempts}/${maxAttempts}...`);

            try {
              const token = localStorage.getItem('fridgy_token');
              const statusRes = await fetch(`${API_BASE_URL}/subscriptions/status`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!statusRes.ok) {
                console.warn('[PaymentForm] Status check failed:', statusRes.status);
                return;
              }

              const statusData = await statusRes.json();
              console.log('[PaymentForm] Status data:', statusData);

              // Check if user is now premium
              if (statusData.isPremium || statusData.subscription?.tier === 'premium') {
                clearInterval(pollInterval);
                console.log('[PaymentForm] ✅ User activated! Calling onSuccess()');
                onSuccess();
              } else if (pollAttempts >= maxAttempts) {
                // Timeout after 30 seconds
                clearInterval(pollInterval);
                console.error('[PaymentForm] ⏱️  Activation timeout');
                onError('Activation is taking longer than expected. Your subscription is being processed. Please refresh the page in a few moments.');
              }
            } catch (err) {
              console.error('[PaymentForm] Polling error:', err);
              if (pollAttempts >= maxAttempts) {
                clearInterval(pollInterval);
                onError('Could not verify subscription status. Please refresh the page to check your subscription.');
              }
            }
          }, 2000); // Poll every 2 seconds

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
      <p className="checkout-modal__subtitle">
        {promoDiscount ? (
          <span style={{ color: '#10B981', fontWeight: '600' }}>
            ✓ {promoDiscount} • Then $4.99/month • Cancel anytime
          </span>
        ) : (
          '$4.99/month after trial ends • Cancel anytime'
        )}
      </p>

      <div className="checkout-modal__payment-element">
        <PaymentElement
          options={{
            layout: 'tabs'
          }}
        />
      </div>

      {/* Promo Code Section - After payment element, before submit button */}
      <div className="checkout-modal__promo-section">
        {!showPromoInput && !promoCode ? (
          <button
            type="button"
            onClick={() => setShowPromoInput(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4fcf61',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'none'
            }}
          >
            Have a promo code?
          </button>
        ) : !promoCode ? (
          <>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#374151'
            }}>
              Promo code (optional)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    // Clear error when user starts typing again
                    if (promoError) setPromoError('');
                  }}
                  placeholder="Enter promo code"
                  disabled={promoValidating}
                  style={{
                    width: '100%',
                    padding: '11px 36px 11px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'white',
                    color: '#1a1a1a',
                    boxSizing: 'border-box'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (promoCodeInput) {
                        validatePromoCode(promoCodeInput);
                      }
                    }
                  }}
                />
                {promoCodeInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCode('');
                      setPromoError('');
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#4fcf61',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Clear promo code"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => validatePromoCode(promoCodeInput)}
                disabled={promoValidating || !promoCodeInput}
                style={{
                  padding: '10px 16px',
                  background: '#4fcf61',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: promoValidating || !promoCodeInput ? 'not-allowed' : 'pointer',
                  opacity: promoValidating || !promoCodeInput ? 0.5 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {promoValidating ? 'Checking...' : 'Apply'}
              </button>
            </div>

            {/* Error Message */}
            {promoError && (
              <div style={{
                color: '#DC2626',
                fontSize: '13px',
                marginTop: '8px'
              }}>
                {promoError}
              </div>
            )}
          </>
        ) : (
          /* Success Message */
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #10B981',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#10B981"/>
                <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ color: '#047857', fontSize: '13px', fontWeight: '500' }}>
                Promo code "{promoCode}" applied!
              </span>
            </div>
            <button
              type="button"
              onClick={onRemovePromo}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1
              }}
              title="Remove promo code"
            >
              ×
            </button>
          </div>
        )}
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
          disabled={isSubmitting || !stripe || !elements || promoError}
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

  // Promo code state
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);

  // Ref to prevent duplicate subscription creation from React Strict Mode
  const hasInitialized = useRef(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Create subscription intent on mount (with guard to prevent duplicates)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    createSubscriptionIntent();
  }, []);

  const validatePromoCode = async (code) => {
    if (!code || code.trim() === '') {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoValidating(true);
    setPromoError('');

    try {
      const token = localStorage.getItem('fridgy_token');

      // STEP 1: Validate promo code first
      const validateRes = await fetch(`${API_BASE_URL}/subscriptions/validate-promo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code.toUpperCase() })
      });

      const validateData = await validateRes.json();

      if (!validateRes.ok || !validateData.valid) {
        setPromoError(validateData.message || 'Invalid or expired promo code');
        setAppliedPromoCode(null);
        setPromoDiscount(null);
        setPromoValidating(false);
        return;
      }

      console.log('[CheckoutModal] Promo code validated:', validateData.promo);

      // STEP 2: Apply promo to existing subscription WITHOUT returning new clientSecret
      // This is critical - we don't want to clear the payment form!
      if (!subscriptionId) {
        setPromoError('Please wait for payment form to load before applying promo code');
        setPromoValidating(false);
        return;
      }

      const applyRes = await fetch(`${API_BASE_URL}/subscriptions/apply-promo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          subscriptionId: subscriptionId
        })
      });

      const applyData = await applyRes.json();

      if (!applyRes.ok || !applyData.success) {
        setPromoError(applyData.message || applyData.error || 'Failed to apply promo code');
        setAppliedPromoCode(null);
        setPromoDiscount(null);
        setPromoValidating(false);
        return;
      }

      // Success - set the applied promo code and discount text
      setAppliedPromoCode(code.toUpperCase());
      const discount = validateData.promo.discountType === 'percent'
        ? `${validateData.promo.discountValue}% off`
        : `$${validateData.promo.discountValue} off`;

      const duration = validateData.promo.duration === 'forever'
        ? 'forever'
        : validateData.promo.duration === 'repeating'
          ? `for ${validateData.promo.durationInMonths} month${validateData.promo.durationInMonths > 1 ? 's' : ''}`
          : 'first payment';

      setPromoDiscount(`${discount} ${duration}`);
      setPromoError('');

      console.log('[CheckoutModal] Promo code applied successfully - form preserved');
    } catch (error) {
      console.error('[CheckoutModal] Promo code error:', error);
      setPromoError('Failed to validate promo code');
      setAppliedPromoCode(null);
      setPromoDiscount(null);
    } finally {
      setPromoValidating(false);
    }
  };

  const handleRemovePromo = async () => {
    setAppliedPromoCode(null);
    setPromoDiscount(null);
    setPromoCode('');
    setShowPromoInput(false);
    setPromoError('');
    console.log('[CheckoutModal] Promo code removed from UI');
  };

  const createSubscriptionIntent = async (promoCodeToUse = null) => {
    try {
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('[CheckoutModal] Creating subscription intent...');

      // Detect user's timezone from browser
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('[CheckoutModal] User timezone:', userTimezone);

      const res = await fetch(`${API_BASE_URL}/subscriptions/create-subscription-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promoCode: promoCodeToUse || appliedPromoCode,
          timezone: userTimezone
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
    console.log('[CheckoutModal] Success complete, refreshing and reloading...');

    // Refresh subscription data first
    if (onSuccess) {
      onSuccess();
    }

    // Close modal
    onClose();

    // Navigate to home and reload to ensure premium features unlock
    navigate('/home', { replace: true });

    // Force reload after short delay to ensure navigation completes
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
                promoCode={appliedPromoCode}
                promoDiscount={promoDiscount}
                promoCodeInput={promoCode}
                promoError={promoError}
                setPromoError={setPromoError}
                promoValidating={promoValidating}
                showPromoInput={showPromoInput}
                setPromoCode={setPromoCode}
                setShowPromoInput={setShowPromoInput}
                validatePromoCode={validatePromoCode}
                onRemovePromo={handleRemovePromo}
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
