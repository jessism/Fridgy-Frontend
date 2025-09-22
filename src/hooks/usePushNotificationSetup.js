import { requestNotificationPermission, subscribeToPush } from '../serviceWorkerRegistration';

export const usePushNotificationSetup = () => {
  const setupPushNotifications = async (token) => {
    try {
      console.log('Starting automatic push notification setup...');

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

      if (isIOS && !isStandalone) {
        console.log('iOS Safari detected - notifications require adding to home screen first');
        return {
          success: false,
          requiresInstall: true,
          message: 'Add to home screen to enable notifications'
        };
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
        return {
          success: true,
          message: 'Notifications enabled successfully!'
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