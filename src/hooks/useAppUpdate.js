import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage service worker updates
 * Provides update status and functions to check/apply updates
 */
const useAppUpdate = () => {
  const [updateStatus, setUpdateStatus] = useState('current'); // current, checking, available, updating
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Get the current service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check if there's already an update waiting
        if (reg.waiting) {
          setUpdateStatus('available');
        }
      });

      // Listen for service worker updates
      const handleUpdateFound = () => {
        console.log('[useAppUpdate] Update found');
      };

      const handleControllerChange = () => {
        console.log('[useAppUpdate] Controller changed - reloading');
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // Listen for update events from service worker registration
  useEffect(() => {
    if (!registration) return;

    const checkForWaitingServiceWorker = () => {
      if (registration.waiting) {
        setUpdateStatus('available');
      }
    };

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker installed, update available
          setUpdateStatus('available');
        }
      });
    });

    checkForWaitingServiceWorker();
  }, [registration]);

  /**
   * Manually check for updates
   */
  const checkForUpdates = useCallback(async () => {
    if (!registration) {
      console.log('[useAppUpdate] No service worker registration found');
      return;
    }

    setUpdateStatus('checking');

    try {
      // Force service worker to check for updates
      await registration.update();

      // Wait a bit for the update check to complete
      setTimeout(() => {
        if (registration.waiting) {
          setUpdateStatus('available');
        } else {
          setUpdateStatus('current');
        }
      }, 1000);
    } catch (error) {
      console.error('[useAppUpdate] Error checking for updates:', error);
      setUpdateStatus('current');
    }
  }, [registration]);

  /**
   * Apply the available update
   */
  const applyUpdate = useCallback(() => {
    if (!registration || !registration.waiting) {
      console.log('[useAppUpdate] No update waiting to apply');
      return;
    }

    setUpdateStatus('updating');

    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // The page will reload automatically when controllerchange fires
  }, [registration]);

  return {
    updateStatus,
    checkForUpdates,
    applyUpdate,
    hasUpdate: updateStatus === 'available'
  };
};

export default useAppUpdate;
