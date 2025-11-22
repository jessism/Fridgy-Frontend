/**
 * Onboarding Tracking Utility
 *
 * Centralized PostHog event tracking for the onboarding flow.
 * Handles production-only tracking with development fallbacks.
 */

import posthog from 'posthog-js';

/**
 * Step name mapping for consistent event tracking
 */
const STEP_NAMES = {
  1: 'welcome',
  2: 'goal_selection',
  3: 'household_size',
  4: 'weekly_budget',
  5: 'dietary_restrictions',
  6: 'allergies',
  7: 'cooking_time_preference',
  8: 'feature_tour',
  9: 'premium_upsell',
  10: 'payment',
  11: 'account_creation'
};

/**
 * Check if PostHog is initialized and ready
 */
const isPostHogReady = () => {
  return posthog && posthog.__loaded;
};

/**
 * Log event to console in development mode
 */
const logToConsole = (eventName, properties) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[PostHog Event - DEV MODE]:`, eventName, properties);
  }
};

/**
 * Track when a user views an onboarding step
 *
 * @param {number} stepNumber - The step number (1-11)
 */
export const trackOnboardingStepViewed = (stepNumber) => {
  const properties = {
    step_number: stepNumber,
    step_name: STEP_NAMES[stepNumber] || `step_${stepNumber}`,
    timestamp: new Date().toISOString()
  };

  if (isPostHogReady()) {
    posthog.capture('onboarding_step_viewed', properties);
  }

  logToConsole('onboarding_step_viewed', properties);
};

/**
 * Track when a user completes an onboarding step
 *
 * @param {number} stepNumber - The step number (1-11)
 * @param {object} selections - User selections made on this step
 */
export const trackOnboardingStepCompleted = (stepNumber, selections = {}) => {
  const properties = {
    step_number: stepNumber,
    step_name: STEP_NAMES[stepNumber] || `step_${stepNumber}`,
    timestamp: new Date().toISOString(),
    ...selections
  };

  if (isPostHogReady()) {
    posthog.capture('onboarding_step_completed', properties);
  }

  logToConsole('onboarding_step_completed', properties);
};

/**
 * Track when a user makes a choice at the premium paywall
 *
 * @param {string} choice - 'trial' or 'free'
 */
export const trackPaymentChoice = (choice) => {
  const properties = {
    choice,
    step_name: 'premium_upsell',
    timestamp: new Date().toISOString()
  };

  if (isPostHogReady()) {
    posthog.capture('onboarding_payment_choice', properties);
  }

  logToConsole('onboarding_payment_choice', properties);
};

/**
 * Track when a user completes the entire onboarding flow
 *
 * @param {object} onboardingData - All collected onboarding data
 */
export const trackOnboardingCompleted = (onboardingData) => {
  const properties = {
    timestamp: new Date().toISOString(),
    primary_goal: onboardingData.primaryGoal,
    household_size: onboardingData.householdSize,
    weekly_budget: onboardingData.weeklyBudget,
    has_dietary_restrictions: onboardingData.dietaryRestrictions?.length > 0,
    dietary_restrictions: onboardingData.dietaryRestrictions,
    has_allergies: onboardingData.allergies?.length > 0 || Boolean(onboardingData.customAllergies),
    allergies: onboardingData.allergies,
    custom_allergies: onboardingData.customAllergies,
    cooking_time_preference: onboardingData.cookingTimePreference,
    watched_feature_tour: onboardingData.showFeatureTour,
    email: onboardingData.accountData?.email,
    first_name: onboardingData.accountData?.firstName
  };

  if (isPostHogReady()) {
    posthog.capture('onboarding_completed', properties);
  }

  logToConsole('onboarding_completed', properties);
};

/**
 * Track when payment is initiated (user clicks payment button)
 */
export const trackPaymentInitiated = () => {
  const properties = {
    step_name: 'payment',
    timestamp: new Date().toISOString()
  };

  if (isPostHogReady()) {
    posthog.capture('onboarding_payment_initiated', properties);
  }

  logToConsole('onboarding_payment_initiated', properties);
};

/**
 * Track when payment is successfully completed
 *
 * @param {string} sessionId - The payment session ID
 */
export const trackPaymentCompleted = (sessionId) => {
  const properties = {
    session_id: sessionId,
    timestamp: new Date().toISOString()
  };

  if (isPostHogReady()) {
    posthog.capture('onboarding_payment_completed', properties);
  }

  logToConsole('onboarding_payment_completed', properties);
};
