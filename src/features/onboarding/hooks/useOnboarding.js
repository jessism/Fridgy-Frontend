import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { usePushNotificationSetup } from '../../../hooks/usePushNotificationSetup';
import { safeJSONStringify } from '../../../utils/jsonSanitizer';
import {
  trackOnboardingStepCompleted,
  trackOnboardingCompleted,
} from '../../../utils/onboardingTracking';
import {
  STEPS,
  TOTAL_STEPS,
  BUDGET_DEFAULT,
  NONE_ID,
  STORAGE_KEYS,
} from '../constants/onboardingConstants';
import { hasPendingPushOptIn, clearPendingPushOptIn } from '../utils/pushOptIn';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// How long we are willing to wait for the push subscription before letting
// the user through. See the note in completeOnboarding.
const PUSH_SUBSCRIBE_TIMEOUT_MS = 8000;

/*
 * Defaults match the app's DEFAULT_ONBOARDING_DATA: budget pre-set to 100,
 * dietary/allergies pre-set to "None", all three notification preferences on.
 * Defined once — this object used to be duplicated in three places and the
 * copies had already drifted apart.
 */
const DEFAULT_ONBOARDING_DATA = {
  primaryGoal: null,
  householdSize: 1,
  weeklyBudget: BUDGET_DEFAULT,
  budgetCurrency: 'USD',
  dietaryRestrictions: [NONE_ID],
  allergies: [NONE_ID],
  customAllergies: '',
  cookingTimePreference: null,
  notificationPreferences: {
    mealReminders: true,
    expirationAlerts: true,
    weeklyReports: true,
  },
  pushPermission: 'default',
  paymentCompleted: false,
  accountData: {
    firstName: '',
    email: '',
    password: '',
  },
};

/*
 * Per-step analytics payloads, keyed by step number. A lookup rather than a
 * switch so it cannot silently drift out of step with the flow again.
 */
const STEP_EVENT_DATA = {
  [STEPS.GOAL]: (d) => ({ primary_goal: d.primaryGoal }),
  [STEPS.HOUSEHOLD]: (d) => ({ household_size: d.householdSize }),
  [STEPS.BUDGET]: (d) => ({
    weekly_budget: d.weeklyBudget,
    budget_currency: d.budgetCurrency,
  }),
  [STEPS.DIETARY]: (d) => ({
    dietary_restrictions: d.dietaryRestrictions,
    has_dietary_restrictions:
      d.dietaryRestrictions?.some((x) => x !== NONE_ID) || false,
  }),
  [STEPS.ALLERGIES]: (d) => ({
    allergies: d.allergies,
    custom_allergies: d.customAllergies,
    has_allergies:
      d.allergies?.some((x) => x !== NONE_ID) || Boolean(d.customAllergies),
  }),
  [STEPS.COOKING_TIME]: (d) => ({
    cooking_time_preference: d.cookingTimePreference,
  }),
  [STEPS.FEATURE_SHOPPING]: () => ({ watched_feature_tour: true }),
  [STEPS.PUSH_NOTIFICATIONS]: (d) => ({ push_permission: d.pushPermission }),
  [STEPS.CREATE_ACCOUNT]: (d) => ({
    email: d.accountData?.email,
    first_name: d.accountData?.firstName,
  }),
};

const useOnboarding = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { setupPushNotifications } = usePushNotificationSetup();

  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState(DEFAULT_ONBOARDING_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = TOTAL_STEPS;

  // Always start fresh. Note this means a mid-flow refresh restarts at step 1;
  // that is pre-existing behaviour, now spread over 19 steps instead of 14.
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEYS.DATA);
    localStorage.removeItem(STORAGE_KEYS.STEP);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    setCurrentStep(1);
    setOnboardingData(DEFAULT_ONBOARDING_DATA);
  }, []);

  const saveToLocalStorage = useCallback((data, step) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DATA, safeJSONStringify(data));
      localStorage.setItem(STORAGE_KEYS.STEP, step.toString());
    } catch (e) {
      console.error('Failed to save onboarding data:', e);
    }
  }, []);

  const updateData = useCallback(
    (updates) => {
      setOnboardingData((prev) => {
        const newData = { ...prev, ...updates };
        saveToLocalStorage(newData, currentStep);
        return newData;
      });
    },
    [currentStep, saveToLocalStorage]
  );

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const stepData = STEP_EVENT_DATA[currentStep]?.(onboardingData) ?? {};
      trackOnboardingStepCompleted(currentStep, stepData);

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveToLocalStorage(onboardingData, nextStep);
    }
  }, [currentStep, totalSteps, onboardingData, saveToLocalStorage]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveToLocalStorage(onboardingData, prevStep);
    }
  }, [currentStep, onboardingData, saveToLocalStorage]);

  const skipStep = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  const jumpToStep = useCallback(
    (step) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
        saveToLocalStorage(onboardingData, step);
      }
    },
    [totalSteps, onboardingData, saveToLocalStorage]
  );

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/onboarding/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: safeJSONStringify({ step: currentStep, data: onboardingData }),
      });

      if (!response.ok) {
        console.error('Failed to save onboarding progress');
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  /*
   * Registers the push subscription the user opted into back at step 15,
   * now that an account and bearer token exist.
   *
   * The timeout is not optional: src/index.js unregisters the service worker
   * in development, so navigator.serviceWorker.ready inside subscribeToPush
   * never resolves and this would otherwise hang the final click of the
   * funnel forever. Anyone missed here is picked up later by the guided
   * tour's own notification prompt.
   */
  const registerDeferredPush = async (token) => {
    if (!hasPendingPushOptIn()) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      clearPendingPushOptIn();
      return;
    }

    try {
      await Promise.race([
        setupPushNotifications(token),
        new Promise((resolve) =>
          setTimeout(() => resolve({ timeout: true }), PUSH_SUBSCRIBE_TIMEOUT_MS)
        ),
      ]);
    } catch (e) {
      console.warn('[Onboarding] Push subscription failed:', e);
    } finally {
      clearPendingPushOptIn();
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      const { accountData, ...preferences } = onboardingData;

      trackOnboardingCompleted(onboardingData);

      // Links a pre-signup Stripe subscription to the new account.
      const onboardingSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

      const user = await signUp({ ...accountData, onboardingSessionId });

      if (user) {
        const token = localStorage.getItem('fridgy_token');

        await fetch(`${API_BASE_URL}/user-preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: safeJSONStringify({
            dietary_restrictions: preferences.dietaryRestrictions,
            allergies: preferences.allergies,
            custom_allergies: preferences.customAllergies,
            cooking_time_preference: preferences.cookingTimePreference,
            cuisine_cooking_time: {
              cookingTime: preferences.cookingTimePreference,
            },
            onboarding_source: 'onboarding_flow',
          }),
        });

        const onboardingResponse = await fetch(`${API_BASE_URL}/onboarding/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: safeJSONStringify({
            primary_goal: preferences.primaryGoal,
            household_size: preferences.householdSize,
            weekly_budget: preferences.weeklyBudget,
            budget_currency: preferences.budgetCurrency,
            notification_preferences: preferences.notificationPreferences,
            onboarding_completed: true,
            onboarding_version: '1.0',
          }),
        });

        if (!onboardingResponse.ok) {
          console.error('Failed to save onboarding data, but account was created');
        }

        localStorage.removeItem(STORAGE_KEYS.DATA);
        localStorage.removeItem(STORAGE_KEYS.STEP);

        const paymentCompleted =
          localStorage.getItem(STORAGE_KEYS.PAYMENT_COMPLETED) === 'true' ||
          onboardingData.paymentCompleted === true;

        if (paymentCompleted) {
          const subscriptionId = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_ID);
          if (subscriptionId) {
            try {
              await fetch(`${API_BASE_URL}/subscriptions/link-to-account`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: safeJSONStringify({ subscriptionId }),
              });
            } catch (linkError) {
              console.error('[Onboarding] Error linking subscription:', linkError);
            }
          }

          localStorage.removeItem(STORAGE_KEYS.PAYMENT_COMPLETED);
          localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_ID);
          localStorage.removeItem(STORAGE_KEYS.WANTS_TRIAL);
        } else {
          localStorage.removeItem(STORAGE_KEYS.WANTS_TRIAL);
        }

        await registerDeferredPush(token);

        navigate(paymentCompleted ? '/home?welcome=trial' : '/home');
      }
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const exitOnboarding = () => {
    const confirmExit = window.confirm(
      'Are you sure you want to exit? Your progress will be saved.'
    );

    if (confirmExit) {
      saveProgress();
      navigate('/');
    }
  };

  const clearOnboardingData = () => {
    localStorage.removeItem(STORAGE_KEYS.DATA);
    localStorage.removeItem(STORAGE_KEYS.STEP);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    setOnboardingData(DEFAULT_ONBOARDING_DATA);
    setCurrentStep(1);
  };

  return {
    currentStep,
    totalSteps,
    onboardingData,
    loading,
    error,
    updateData,
    goToNextStep,
    goToPreviousStep,
    skipStep,
    saveProgress,
    completeOnboarding,
    exitOnboarding,
    clearOnboardingData,
    setError,
    jumpToStep,
  };
};

export default useOnboarding;
