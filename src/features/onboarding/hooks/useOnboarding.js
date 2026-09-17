import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { usePushNotificationSetup } from '../../../hooks/usePushNotificationSetup';
import { safeJSONStringify, safeJSONParse } from '../../../utils/jsonSanitizer';
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

// A saved draft older than this is dropped. Matches the 24h expiry of the
// backend onboarding session a Stripe attempt is tied to.
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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

/*
 * "None" is a UI choice, not a value. The backend's recipe prompt treats
 * anything in these arrays as a real allergen or restriction, so an empty
 * array is how "none" has to be sent.
 */
const withoutNone = (ids = []) => ids.filter((id) => id !== NONE_ID);

/*
 * Restores a draft after a refresh, like the app's AsyncStorage draft.
 * Returns null when there is nothing usable, which means a clean start.
 *
 * Never resumes into the Stripe step: re-entering a live intent is how
 * duplicate subscriptions get created, so that lands on the paywall instead.
 */
const loadDraft = () => {
  try {
    const saved = safeJSONParse(localStorage.getItem(STORAGE_KEYS.DATA));
    const step = parseInt(localStorage.getItem(STORAGE_KEYS.STEP), 10);

    const isFresh = saved?.savedAt && Date.now() - saved.savedAt < DRAFT_MAX_AGE_MS;
    if (!isFresh || !(step > STEPS.WELCOME && step <= TOTAL_STEPS)) return null;

    const { savedAt, ...data } = saved;
    return {
      step: step === STEPS.PAYMENT ? STEPS.PAYWALL : step,
      data: {
        ...DEFAULT_ONBOARDING_DATA,
        ...data,
        accountData: { ...DEFAULT_ONBOARDING_DATA.accountData, ...data.accountData },
      },
    };
  } catch (e) {
    return null;
  }
};

const useOnboarding = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { setupPushNotifications } = usePushNotificationSetup();

  const [draft] = useState(loadDraft);
  const [currentStep, setCurrentStep] = useState(draft?.step ?? STEPS.WELCOME);
  const [onboardingData, setOnboardingData] = useState(
    draft?.data ?? DEFAULT_ONBOARDING_DATA
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = TOTAL_STEPS;

  // With no draft to resume, clear whatever an older attempt left behind —
  // including its Stripe session, which a resumed draft has to keep.
  useEffect(() => {
    if (draft) return;
    localStorage.removeItem(STORAGE_KEYS.DATA);
    localStorage.removeItem(STORAGE_KEYS.STEP);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  }, [draft]);

  const saveToLocalStorage = useCallback((data, step) => {
    try {
      // The password stays in memory only; it is never written to storage.
      const persisted = {
        ...data,
        accountData: { ...data.accountData, password: '' },
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.DATA, safeJSONStringify(persisted));
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

  const jumpToStep = useCallback(
    (step) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
        saveToLocalStorage(onboardingData, step);
      }
    },
    [totalSteps, onboardingData, saveToLocalStorage]
  );

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

        const preferencesResponse = await fetch(`${API_BASE_URL}/user-preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: safeJSONStringify({
            dietary_restrictions: withoutNone(preferences.dietaryRestrictions),
            allergies: withoutNone(preferences.allergies),
            custom_allergies: preferences.customAllergies,
            cooking_time_preference: preferences.cookingTimePreference,
            cuisine_cooking_time: {
              cookingTime: preferences.cookingTimePreference,
            },
            onboarding_source: 'onboarding_flow',
          }),
        });

        if (!preferencesResponse.ok) {
          console.error('Failed to save dietary preferences, but account was created');
        }

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

        navigate('/home');
      }
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
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
    completeOnboarding,
    setError,
    jumpToStep,
  };
};

export default useOnboarding;
