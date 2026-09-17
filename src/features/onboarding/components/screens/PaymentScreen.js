import React, { useState, useEffect, useRef } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { usePrice } from '../../../../contexts/PriceContext';
import { Check, X } from 'lucide-react';
import { OnboardingLayout, OnboardingButton, OnboardingVideoPreloader } from '../shared';
import { STEPS, VIDEOS } from '../../constants/onboardingConstants';
import TrialCelebration from './TrialCelebration';
import './PaymentScreen.css';

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Inner Payment Form Component for Onboarding
 */
const PaymentForm = ({
  subscriptionId,
  requiresSetup,
  promoCode,
  promoDiscount,
  promoCodeInput,
  promoError,
  promoValidating,
  showPromoInput,
  setPromoCode,
  setShowPromoInput,
  validatePromoCode,
  onRemovePromo,
  onSuccess,
  onError,
  onPending,
  onBack
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { formattedWithInterval } = usePrice();
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
    <OnboardingLayout showClose onClose={onBack} className="ob-pay">
      {/* Warm the 1.5MB celebration clip while the card details are typed. */}
      <OnboardingVideoPreloader active videos={[VIDEOS.bigWin]} />

      <h1 className="ob-h1 ob-pay__title">{'Start Your\n7-Day Free Trial'}</h1>

      <div className="ob-pay__card">
        <PaymentElement options={{ layout: 'tabs' }} />

        {/* Promo code — collapsed until asked for */}
        <div className="ob-pay__promo">
          {!showPromoInput && !promoCode ? (
            <button
              type="button"
              className="ob-pay__promo-link"
              onClick={() => setShowPromoInput(true)}
            >
              Have a promo code?
            </button>
          ) : (
            <>
              <label className="ob-pay__promo-label" htmlFor="ob-pay-promo">
                Promo code (optional)
              </label>
              <div className="ob-pay__promo-row">
                <input
                  id="ob-pay-promo"
                  type="text"
                  className="ob-pay__promo-input"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  disabled={!!promoCode || promoValidating}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!promoCode && promoCodeInput) {
                        validatePromoCode(promoCodeInput);
                      }
                    }
                  }}
                />
                {!promoCode && (
                  <button
                    type="button"
                    className="ob-pay__promo-apply"
                    onClick={() => validatePromoCode(promoCodeInput)}
                    disabled={promoValidating || !promoCodeInput}
                  >
                    {promoValidating ? 'Checking...' : 'Apply'}
                  </button>
                )}
              </div>

              {promoCode && (
                <div className="ob-pay__promo-applied">
                  <span className="ob-pay__promo-applied-text">
                    <span className="ob-pay__check" aria-hidden="true">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    Promo code "{promoCode}" applied!
                  </span>
                  <button
                    type="button"
                    className="ob-pay__promo-remove"
                    onClick={onRemovePromo}
                    aria-label="Remove promo code"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {promoError && !promoCode && (
                <p className="ob-pay__promo-error">{promoError}</p>
              )}
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="ob-pay__error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="ob-footer">
        <p className="ob-pay__reassure">
          <span className="ob-pay__check" aria-hidden="true">
            <Check size={12} strokeWidth={3} />
          </span>
          No payment due now
        </p>

        <OnboardingButton
          onClick={handleSubmit}
          disabled={isSubmitting || !stripe || !elements || Boolean(promoError)}
        >
          {isSubmitting ? 'Processing...' : 'Start Free Trial'}
        </OnboardingButton>

        <p className="ob-footnote ob-pay__fineprint">
          {promoDiscount
            ? promoDiscount
            : `${formattedWithInterval} after trial ends. Your trial starts immediately and you can cancel anytime during the 7-day trial period.`
          }
        </p>
      </div>
    </OnboardingLayout>
  );
};

/**
 * Main PaymentScreen Component for Onboarding
 */
const PaymentScreen = ({ updateData, jumpToStep, onBack }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Promo code state
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);

  // Duplicate prevention guard (prevents React Strict Mode from creating multiple subscriptions)
  const hasInitialized = useRef(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Create subscription intent on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

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

  const validatePromoCode = async (code) => {
    if (!code || code.trim() === '') {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoValidating(true);
    setPromoError('');

    try {
      // STEP 1: Validate promo code against database first
      console.log('[PaymentScreen] Validating promo code against database:', code.toUpperCase());
      const validateRes = await fetch(`${API_BASE_URL}/onboarding/validate-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code.toUpperCase() })
      });

      const validateData = await validateRes.json();

      // If code is invalid, show error and stop
      if (!validateRes.ok || !validateData.valid) {
        console.error('[PaymentScreen] Promo code validation failed:', validateData.message);
        setPromoError(validateData.message || 'Invalid or expired promo code');
        setAppliedPromoCode(null);
        setPromoDiscount(null);
        setPromoValidating(false);
        return;
      }

      console.log('[PaymentScreen] Promo code is valid:', validateData.promo);

      // STEP 2: Apply promo to existing subscription (NO clientSecret update to preserve form)
      const sessionId = localStorage.getItem('fridgy_onboarding_session_id');

      if (!sessionId || !subscriptionId) {
        console.error('[PaymentScreen] Missing session or subscription ID for promo application');
        setPromoError('Please wait for payment form to load before applying promo code');
        setPromoValidating(false);
        return;
      }

      const applyRes = await fetch(`${API_BASE_URL}/onboarding/apply-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId,
          subscriptionId: subscriptionId,
          promoCode: code.toUpperCase()
        })
      });

      const applyData = await applyRes.json();

      if (!applyRes.ok || !applyData.success) {
        console.error('[PaymentScreen] Failed to apply promo:', applyData.message || applyData.error);
        setPromoError(applyData.error || 'Failed to apply promo code. Please try again.');
        setAppliedPromoCode(null);
        setPromoDiscount(null);
        setPromoValidating(false);
        return;
      }

      // Set applied code (WITHOUT updating clientSecret - form stays intact)
      setAppliedPromoCode(code.toUpperCase());

      // Build discount text from validated promo details
      const promo = validateData.promo;
      const discount = promo.discountType === 'percent'
        ? `${promo.discountValue}% off`
        : `$${promo.discountValue} off`;

      const duration = promo.duration === 'forever'
        ? 'forever'
        : promo.duration === 'repeating'
          ? `for ${promo.durationInMonths} month${promo.durationInMonths > 1 ? 's' : ''}`
          : 'first payment';

      setPromoDiscount(`${discount} ${duration}`);
      setPromoError('');
      console.log('[PaymentScreen] Promo code applied successfully');

    } catch (error) {
      console.error('[PaymentScreen] Promo code error:', error);
      setPromoError('Failed to validate promo code. Please try again.');
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

    // Remove discount from subscription without clearing form
    try {
      const sessionId = localStorage.getItem('fridgy_onboarding_session_id');
      if (sessionId && subscriptionId) {
        // Call apply-promo with empty code to clear discount
        // For now, just clear the UI state - the subscription will be updated when form is submitted
        console.log('[PaymentScreen] Promo code removed from UI');
      }
    } catch (error) {
      console.error('[PaymentScreen] Error removing promo:', error);
    }
  };

  const createSubscriptionIntent = async (promoCodeToUse = null) => {
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
          isOnboarding: true, // Flag to indicate this is from onboarding
          promoCode: promoCodeToUse || appliedPromoCode
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

    // Show success screen (user will click button to continue)
    setShowSuccess(true);
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

  const handleRetry = () => {
    setErrorMessage('');
    setPaymentStatus('loading');
    createSubscriptionIntent();
  };

  // Show success screen - "Welcome to Trackabite Pro"
  if (showSuccess) {
    return (
      <TrialCelebration
        // Was jumpToStep(13), which is the paywall — a successful trial
        // dropped the user back onto the upsell instead of the signup form.
        onContinue={() => jumpToStep(STEPS.CREATE_ACCOUNT)}
      />
    );
  }

  // Show loading state
  if (paymentStatus === 'loading') {
    return (
      <OnboardingLayout showClose onClose={onBack}>
        <div className="ob-body-center" role="status">
          <span className="ob-pay__spinner" aria-hidden="true" />
          <p className="ob-sub">Preparing your trial...</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Show error state
  if (paymentStatus === 'error' && !clientSecret) {
    return (
      <OnboardingLayout showClose onClose={onBack}>
        <div className="ob-body-center">
          <h1 className="ob-h1">Unable to load payment form</h1>
          <p className="ob-sub">{errorMessage || 'Please try again later'}</p>
        </div>
        <div className="ob-footer">
          <OnboardingButton variant="secondary" onClick={handleRetry}>
            Retry
          </OnboardingButton>
        </div>
      </OnboardingLayout>
    );
  }

  // Render payment form when ready
  if (clientSecret) {
    return (
      <Elements
        key={clientSecret}
        stripe={stripePromise}
        options={{
          clientSecret: clientSecret,
          // Stripe renders in an iframe, so it has to be handed Manrope itself.
          fonts: [
            { cssSrc: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&display=swap' }
          ],
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#4c6400',
              colorText: '#2e2f2b',
              colorDanger: '#ef4444',
              fontFamily: "'Manrope', system-ui, sans-serif",
              borderRadius: '12px'
            }
          }
        }}
      >
        <PaymentForm
          subscriptionId={subscriptionId}
          requiresSetup={requiresSetup}
          promoCode={appliedPromoCode}
          promoDiscount={promoDiscount}
          promoCodeInput={promoCode}
          promoError={promoError}
          promoValidating={promoValidating}
          showPromoInput={showPromoInput}
          setPromoCode={setPromoCode}
          setShowPromoInput={setShowPromoInput}
          validatePromoCode={validatePromoCode}
          onRemovePromo={handleRemovePromo}
          onSuccess={handleSuccess}
          onError={handleError}
          onPending={handlePending}
          onBack={onBack}
        />
      </Elements>
    );
  }

  return null;
};

export default PaymentScreen;