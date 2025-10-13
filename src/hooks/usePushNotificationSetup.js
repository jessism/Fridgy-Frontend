import { requestNotificationPermission, subscribeToPush } from '../serviceWorkerRegistration';
import { validateStoredToken, ensureValidToken, debugTokenStatus } from '../utils/tokenValidator';

export const usePushNotificationSetup = () => {
  // Helper function to detect PWA mode
  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://') ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches;
  };

  const setupPushNotifications = async (providedToken) => {
    try {
      console.log('Starting automatic push notification setup...');
      console.log('PWA Mode:', isPWA() ? 'Yes' : 'No (Browser)');

      // Use provided token or validate stored token
      let token = providedToken;

      if (!token) {
        console.log('No token provided, checking localStorage...');
        token = ensureValidToken();

        if (!token) {
          // Run debug to help user understand the issue
          debugTokenStatus();
          return {
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Please log in first to enable notifications'
          };
        }
      }

      // Debug: Check token status
      const validation = validateStoredToken();
      console.log('Token validation:', validation);

      // Check if we're in a supported environment
      if (!('Notification' in window)) {
        console.log('Notifications not supported in this browser');
        return false;
      }

      if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported');
        return false;
      }

      // Check if it's iOS Safari (requires installation from home screen)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isStandalone = window.navigator.standalone === true;
      const isInPWAMode = isPWA();

      if (isIOS && !isStandalone) {
        console.log('iOS Safari detected - notifications require adding to home screen first');
        return {
          success: false,
          requiresInstall: true,
          message: 'Add to home screen to enable notifications'
        };
      }

      // Log PWA-specific information
      if (isInPWAMode) {
        console.log('Running in PWA mode - enhanced notification experience available');
      }

      // Request notification permission
      console.log('Requesting notification permission...');
      const permissionGranted = await requestNotificationPermission();

      if (!permissionGranted) {
        console.log('Notification permission denied by user');
        return {
          success: false,
          permissionDenied: true,
          message: 'Notification permission denied'
        };
      }

      // Create push subscription
      console.log('Creating push subscription...');
      const subscription = await subscribeToPush();

      if (!subscription) {
        console.log('Failed to create push subscription');
        return {
          success: false,
          message: 'Failed to subscribe to notifications'
        };
      }

      // Save subscription to backend
      console.log('Saving subscription to backend...');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      // Debug: Log request details
      console.log('API Request Details:', {
        url: `${apiUrl}/push/subscribe`,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : 'NO TOKEN',
        authHeader: token ? `Bearer ${token.substring(0, 10)}...` : 'NO AUTH HEADER'
      });

      const response = await fetch(`${apiUrl}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription })
      });

      if (response.ok) {
        console.log('✅ Push notifications enabled successfully!');
        const successMessage = isPWA()
          ? 'Notifications enabled for your installed app!'
          : 'Notifications enabled successfully!';

        return {
          success: true,
          message: successMessage,
          isPWA: isPWA()
        };
      } else {
        const error = await response.json();
        console.error('Failed to save subscription:', error);
        return {
          success: false,
          message: 'Failed to save notification settings'
        };
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      return {
        success: false,
        message: 'An error occurred setting up notifications'
      };
    }
  };

  return { setupPushNotifications };
};