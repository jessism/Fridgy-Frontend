import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to track when user completes their first batch of items
 * and triggers the PWA install prompt after 8 seconds of inactivity
 */
const useFirstBatchCompletion = (inventoryItems = []) => {
  const [shouldShowInstallPrompt, setShouldShowInstallPrompt] = useState(false);
  const previousItemCountRef = useRef(0);
  const idleTimerRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  // Check if prompt has already been shown
  const hasPromptBeenShown = useCallback(() => {
    return localStorage.getItem('first_batch_install_prompt_shown') === 'true';
  }, []);

  // Mark prompt as shown
  const markPromptAsShown = useCallback(() => {
    localStorage.setItem('first_batch_install_prompt_shown', 'true');
  }, []);

  // Check if user is on iOS and not already installed
  const shouldShowForPlatform = useCallback(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true;

    // Also check for Android/Desktop PWA mode
    const isInPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    window.matchMedia('(display-mode: fullscreen)').matches;

    return isIOS && !isStandalone && !isInPWA;
  }, []);

  // Dismiss the prompt
  const dismissPrompt = useCallback(() => {
    setShouldShowInstallPrompt(false);
    markPromptAsShown();

    // Also set the 7-day dismissal like the original component
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('ios_install_prompt_seen', expiryDate.toISOString());
  }, [markPromptAsShown]);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
  }, []);

  // Start the idle timer
  const startIdleTimer = useCallback(() => {
    resetIdleTimer();

    idleTimerRef.current = setTimeout(() => {
      // Check conditions before showing
      if (!hasTriggeredRef.current && !hasPromptBeenShown() && shouldShowForPlatform()) {
        console.log('[FirstBatch] 8 seconds idle after adding items - showing install prompt');
        hasTriggeredRef.current = true;
        setShouldShowInstallPrompt(true);
      }
    }, 8000); // 8 seconds
  }, [resetIdleTimer, hasPromptBeenShown, shouldShowForPlatform]);

  // Track inventory changes
  useEffect(() => {
    const currentCount = inventoryItems.length;
    const previousCount = previousItemCountRef.current;

    // Detect if items were added (count increased)
    if (currentCount > previousCount && previousCount >= 0) {
      const itemsAdded = currentCount - previousCount;
      console.log(`[FirstBatch] Detected ${itemsAdded} new items added (${previousCount} → ${currentCount})`);

      // Only track if this is the first batch ever (previous was 0)
      // OR if we haven't triggered yet and haven't shown the prompt
      if (!hasTriggeredRef.current && !hasPromptBeenShown()) {
        console.log('[FirstBatch] Starting 8-second idle timer');
        startIdleTimer();
      }
    }

    // Update previous count
    previousItemCountRef.current = currentCount;
  }, [inventoryItems.length, hasPromptBeenShown, startIdleTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  return {
    shouldShowInstallPrompt,
    dismissPrompt,
    resetIdleTimer, // Can be called when user takes action (resets the timer)
  };
};

export default useFirstBatchCompletion;
