import { useState, useEffect } from 'react';

/**
 * Hook for detecting PWA installation and first-time launches
 * @returns {Object} PWA detection state and methods
 */
export const usePWADetection = () => {
  // Storage keys
  const PWA_FIRST_LAUNCH_KEY = 'pwa_first_launch_complete';
  const PWA_NOTIFICATION_PROMPT_SHOWN_KEY = 'pwa_notification_prompt_shown';
  const PWA_NOTIFICATION_PROMPT_DISMISSED_KEY = 'pwa_notification_prompt_dismissed';
  const PWA_NOTIFICATION_PROMPT_DISMISSED_TIME_KEY = 'pwa_notification_prompt_dismissed_time';

  // State
  const [isPWA, setIsPWA] = useState(false);
  const [isFirstPWALaunch, setIsFirstPWALaunch] = useState(false);
  const [shouldShowNotificationPrompt, setShouldShowNotificationPrompt] = useState(false);
  const [platform, setPlatform] = useState('web');

  /**
   * Detect if the app is running in PWA/standalone mode
   */
  const detectPWAMode = () => {
    // Check multiple indicators for PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

    return isStandalone || isIOSStandalone || isAndroidApp || isFullscreen || isMinimalUI;
  };

  /**
   * Detect the platform (iOS, Android, Desktop)
   */
  const detectPlatform = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      return 'ios';
    } else if (/android/i.test(ua)) {
      return 'android';
    } else if (/Macintosh|Windows|Linux/.test(ua)) {
      return 'desktop';
    }
    return 'unknown';
  };

  /**
   * Check if this is the first time the PWA is launched
   */
  const checkFirstPWALaunch = () => {
    const isPWAMode = detectPWAMode();

    if (!isPWAMode) {
      return false;
    }

    // Check if we've already marked the first launch as complete
    const firstLaunchComplete = localStorage.getItem(PWA_FIRST_LAUNCH_KEY);
    return !firstLaunchComplete;
  };

  /**
   * Check if we should show the notification prompt
   */
  const checkShouldShowNotificationPrompt = () => {
    // Don't show if not in PWA mode
    if (!detectPWAMode()) {
      return false;
    }

    // Don't show if we've already shown it
    const promptShown = localStorage.getItem(PWA_NOTIFICATION_PROMPT_SHOWN_KEY);
    if (promptShown === 'true') {
      return false;
    }

    // Check if user dismissed it recently (within 7 days)
    const dismissedTime = localStorage.getItem(PWA_NOTIFICATION_PROMPT_DISMISSED_TIME_KEY);
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return false;
      }
    }

    // Check if notifications are already enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      // Mark as shown since notifications are already enabled
      localStorage.setItem(PWA_NOTIFICATION_PROMPT_SHOWN_KEY, 'true');
      return false;
    }

    return true;
  };

  /**
   * Mark the first PWA launch as complete
   */
  const markFirstLaunchComplete = () => {
    localStorage.setItem(PWA_FIRST_LAUNCH_KEY, 'true');
    setIsFirstPWALaunch(false);
  };

  /**
   * Mark that the notification prompt has been shown
   */
  const markNotificationPromptShown = () => {
    localStorage.setItem(PWA_NOTIFICATION_PROMPT_SHOWN_KEY, 'true');
    setShouldShowNotificationPrompt(false);
  };

  /**
   * Mark that the user dismissed the notification prompt
   */
  const markNotificationPromptDismissed = () => {
    localStorage.setItem(PWA_NOTIFICATION_PROMPT_DISMISSED_KEY, 'true');
    localStorage.setItem(PWA_NOTIFICATION_PROMPT_DISMISSED_TIME_KEY, Date.now().toString());
    setShouldShowNotificationPrompt(false);
  };

  /**
   * Reset all PWA-related flags (useful for testing)
   */
  const resetPWAFlags = () => {
    localStorage.removeItem(PWA_FIRST_LAUNCH_KEY);
    localStorage.removeItem(PWA_NOTIFICATION_PROMPT_SHOWN_KEY);
    localStorage.removeItem(PWA_NOTIFICATION_PROMPT_DISMISSED_KEY);
    localStorage.removeItem(PWA_NOTIFICATION_PROMPT_DISMISSED_TIME_KEY);

    // Re-check states
    setIsPWA(detectPWAMode());
    setIsFirstPWALaunch(checkFirstPWALaunch());
    setShouldShowNotificationPrompt(checkShouldShowNotificationPrompt());
  };

  /**
   * Get debug information about PWA state
   */
  const getDebugInfo = () => {
    return {
      isPWA: detectPWAMode(),
      platform: detectPlatform(),
      isFirstLaunch: checkFirstPWALaunch(),
      shouldShowNotificationPrompt: checkShouldShowNotificationPrompt(),
      localStorage: {
        firstLaunchComplete: localStorage.getItem(PWA_FIRST_LAUNCH_KEY),
        notificationPromptShown: localStorage.getItem(PWA_NOTIFICATION_PROMPT_SHOWN_KEY),
        notificationPromptDismissed: localStorage.getItem(PWA_NOTIFICATION_PROMPT_DISMISSED_KEY),
        notificationPromptDismissedTime: localStorage.getItem(PWA_NOTIFICATION_PROMPT_DISMISSED_TIME_KEY)
      },
      notificationPermission: 'Notification' in window ? Notification.permission : 'not-supported',
      displayMode: {
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        fullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
        minimalUI: window.matchMedia('(display-mode: minimal-ui)').matches,
        browser: window.matchMedia('(display-mode: browser)').matches
      },
      navigatorStandalone: window.navigator.standalone
    };
  };

  // Initialize on mount
  useEffect(() => {
    const pwaMode = detectPWAMode();
    const platformType = detectPlatform();
    const firstLaunch = checkFirstPWALaunch();
    const showPrompt = checkShouldShowNotificationPrompt();

    setIsPWA(pwaMode);
    setPlatform(platformType);
    setIsFirstPWALaunch(firstLaunch);
    setShouldShowNotificationPrompt(showPrompt);

    // Log debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[PWA Detection] Debug Info:', getDebugInfo());
    }
  }, []);

  return {
    // State
    isPWA,
    isFirstPWALaunch,
    shouldShowNotificationPrompt,
    platform,

    // Actions
    markFirstLaunchComplete,
    markNotificationPromptShown,
    markNotificationPromptDismissed,
    resetPWAFlags,

    // Debug
    getDebugInfo
  };
};