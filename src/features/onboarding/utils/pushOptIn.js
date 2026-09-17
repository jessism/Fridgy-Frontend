/*
 * Push opt-in, split in two halves.
 *
 * At step 15 we only ask the *browser* for permission — there is no account
 * yet, so there is no bearer token to register a subscription with. The
 * actual subscribe runs after signup, mirroring how the iOS app defers
 * registerPushToken when no auth token exists.
 */

import { requestNotificationPermission } from '../../../serviceWorkerRegistration';
import { STORAGE_KEYS } from '../constants/onboardingConstants';

const KEY = STORAGE_KEYS.PUSH_OPTIN_PENDING;

export const canUseWebPush = () =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

/** iOS Safari only allows notifications once the PWA is on the home screen. */
export const requiresHomeScreenInstall = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  return isIOS && !isStandalone;
};

/**
 * Must be called from inside a click handler — Chrome and Safari require a
 * user gesture, and prompting on mount silently fails (or worse, burns the
 * one prompt the user gets).
 *
 * Never throws: every branch resolves to a status the screen can act on.
 */
export const requestOnboardingPushPermission = async () => {
  if (!canUseWebPush()) return { status: 'unsupported' };
  if (requiresHomeScreenInstall()) return { status: 'requires_install' };

  try {
    const granted = await requestNotificationPermission();
    const status =
      granted || Notification.permission === 'granted' ? 'granted' : 'denied';

    if (status === 'granted') {
      try {
        localStorage.setItem(KEY, 'true');
      } catch (e) {
        // Private mode / blocked storage: the guided tour's own prompt
        // will still catch this user later.
      }
    }

    return { status };
  } catch (e) {
    return { status: 'denied' };
  }
};

export const hasPendingPushOptIn = () => {
  try {
    return localStorage.getItem(KEY) === 'true';
  } catch (e) {
    return false;
  }
};

export const clearPendingPushOptIn = () => {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    /* nothing to clean up if storage is unavailable */
  }
};
