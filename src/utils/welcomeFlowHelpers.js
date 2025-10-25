/**
 * Welcome Flow Helpers
 * Utilities for detecting first-time users and persisting welcome flow state
 */

const WELCOME_FLOW_STORAGE_KEY = 'trackabite_welcome_flow';
const WELCOME_FLOW_VERSION = '1.0';

/**
 * Check if this is a PWA (Progressive Web App)
 */
export const isPWA = () => {
  // Check if running in standalone mode (iOS)
  const isIOSStandalone = window.navigator.standalone === true;

  // Check if running in standalone mode (Android/Desktop)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return isIOSStandalone || isStandalone;
};

/**
 * Check if user is on iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Check if this is the first time user is opening the app
 */
export const isFirstLaunch = () => {
  try {
    // Check if welcome flow has been completed
    const welcomeState = getWelcomeFlowState();
    if (welcomeState && welcomeState.completed) {
      return false;
    }

    // Check if user has any saved recipes (indicates they've used the app)
    const hasImportedRecipe = localStorage.getItem('has_imported_recipe') === 'true';
    if (hasImportedRecipe) {
      return false;
    }

    // Check if there's a token (user has signed up/in)
    const hasToken = !!localStorage.getItem('fridgy_token');

    // First launch if:
    // 1. No welcome flow completion AND
    // 2. No imported recipes AND
    // 3. User is authenticated (has token)
    return !welcomeState && !hasImportedRecipe && hasToken;
  } catch (error) {
    console.error('[WelcomeFlow] Error checking first launch:', error);
    return false;
  }
};

/**
 * Get current welcome flow state from localStorage
 */
export const getWelcomeFlowState = () => {
  try {
    const stateJson = localStorage.getItem(WELCOME_FLOW_STORAGE_KEY);
    if (!stateJson) return null;

    const state = JSON.parse(stateJson);

    // Check version compatibility
    if (state.version !== WELCOME_FLOW_VERSION) {
      console.log('[WelcomeFlow] Version mismatch, resetting state');
      return null;
    }

    return state;
  } catch (error) {
    console.error('[WelcomeFlow] Error reading state:', error);
    return null;
  }
};

/**
 * Save welcome flow state to localStorage
 */
export const saveWelcomeFlowState = (state) => {
  try {
    const stateToSave = {
      ...state,
      version: WELCOME_FLOW_VERSION,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(WELCOME_FLOW_STORAGE_KEY, JSON.stringify(stateToSave));
    console.log('[WelcomeFlow] State saved:', state.currentStep);
  } catch (error) {
    console.error('[WelcomeFlow] Error saving state:', error);
  }
};

/**
 * Mark welcome flow as completed
 */
export const markWelcomeFlowCompleted = () => {
  try {
    const state = getWelcomeFlowState() || {};
    state.completed = true;
    state.completedAt = new Date().toISOString();
    saveWelcomeFlowState(state);

    console.log('[WelcomeFlow] Flow marked as completed');
  } catch (error) {
    console.error('[WelcomeFlow] Error marking as completed:', error);
  }
};

/**
 * Mark welcome flow as skipped
 */
export const markWelcomeFlowSkipped = () => {
  try {
    const state = getWelcomeFlowState() || {};
    state.skipped = true;
    state.skippedAt = new Date().toISOString();
    state.completed = true; // Don't show again
    saveWelcomeFlowState(state);

    console.log('[WelcomeFlow] Flow marked as skipped');
  } catch (error) {
    console.error('[WelcomeFlow] Error marking as skipped:', error);
  }
};

/**
 * Reset welcome flow (for replay from settings)
 */
export const resetWelcomeFlow = () => {
  try {
    localStorage.removeItem(WELCOME_FLOW_STORAGE_KEY);
    console.log('[WelcomeFlow] State reset');
  } catch (error) {
    console.error('[WelcomeFlow] Error resetting:', error);
  }
};

/**
 * Check if user has unfinished welcome flow
 */
export const hasUnfinishedWelcomeFlow = () => {
  const state = getWelcomeFlowState();
  return state && !state.completed && !state.skipped;
};

/**
 * Get resume step for unfinished welcome flow
 */
export const getResumeStep = () => {
  const state = getWelcomeFlowState();
  if (!state) return 0;

  return state.currentStep || 0;
};

/**
 * Track analytics event (placeholder for future analytics integration)
 */
export const trackWelcomeFlowEvent = (eventName, properties = {}) => {
  console.log(`[WelcomeFlow Analytics] ${eventName}`, properties);

  // TODO: Integrate with analytics service (e.g., Mixpanel, Amplitude)
  // analytics.track(eventName, {
  //   ...properties,
  //   flow_version: WELCOME_FLOW_VERSION,
  //   is_pwa: isPWA(),
  //   is_ios: isIOS()
  // });
};

export default {
  isPWA,
  isIOS,
  isFirstLaunch,
  getWelcomeFlowState,
  saveWelcomeFlowState,
  markWelcomeFlowCompleted,
  markWelcomeFlowSkipped,
  resetWelcomeFlow,
  hasUnfinishedWelcomeFlow,
  getResumeStep,
  trackWelcomeFlowEvent
};
