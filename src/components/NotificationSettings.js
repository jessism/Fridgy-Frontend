import React, { useState, useEffect, useCallback } from 'react';
import './NotificationSettings.css';
import { requestNotificationPermission, subscribeToPush } from '../serviceWorkerRegistration';
import { ensureValidToken, debugTokenStatus } from '../utils/tokenValidator';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebugConsole, setShowDebugConsole] = useState(false); // Hidden by default, use ?debug=true or localStorage
  const [debugLogs, setDebugLogs] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [swStatus, setSwStatus] = useState('checking');
  const [testError, setTestError] = useState(null);
  const [testSuccess, setTestSuccess] = useState(false);
  const [lastTestTime, setLastTestTime] = useState(null);
  const [preferences, setPreferences] = useState({
    enabled: true,
    days_before_expiry: [1, 3],
    notification_time: '09:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [dailyReminders, setDailyReminders] = useState({
    inventory_check: {
      enabled: true,
      time: '17:30',
      message: "See what's in your fridge",
      emoji: '🥗'
    },
    meal_planning: {
      enabled: false,
      time: '10:00',
      day: 'Sunday',
      message: 'Plan your meals for the week',
      emoji: '📅'
    },
    dinner_prep: {
      enabled: false,
      time: '16:00',
      message: 'Time to prep dinner!',
      emoji: '👨‍🍳'
    },
    breakfast_reminder: {
      enabled: false,
      time: '08:00',
      message: 'Start your day right - check breakfast options',
      emoji: '🌅'
    },
    lunch_reminder: {
      enabled: false,
      time: '12:00',
      message: 'Lunch time! See what you can make',
      emoji: '🥙'
    },
    shopping_reminder: {
      enabled: false,
      time: '18:00',
      day: 'Saturday',
      message: 'Time to plan your grocery shopping',
      emoji: '🛒'
    }
  });
  const [message, setMessage] = useState('');
  const [testRunning, setTestRunning] = useState(false);
  const [nextTestTime, setNextTestTime] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const addDebugLog = useCallback((message, type = 'info', details = {}) => {
    const log = {
      timestamp: new Date().toISOString(),
      message,
      type, // 'success', 'error', 'warning', 'info'
      details
    };

    setDebugLogs(prev => {
      const newLogs = [log, ...prev].slice(0, 20); // Keep last 20 logs
      localStorage.setItem('notification_debug_logs', JSON.stringify(newLogs));
      return newLogs;
    });

    console.log(`[Notification Debug] ${type.toUpperCase()}: ${message}`, details);
  }, []);

  const loadDebugLogs = useCallback(() => {
    try {
      const savedLogs = localStorage.getItem('notification_debug_logs');
      if (savedLogs) {
        setDebugLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error('Error loading debug logs:', error);
    }
  }, []);

  const clearDebugLogs = () => {
    setDebugLogs([]);
    localStorage.removeItem('notification_debug_logs');
    addDebugLog('Debug logs cleared', 'info');
  };

  const initializeDebugInfo = useCallback(async () => {
    // Detect device and browser info
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(ua);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.navigator.standalone ||
                  document.referrer.includes('android-app://');

    const info = {
      platform: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop',
      browser: isSafari ? 'Safari' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Other',
      isPWA,
      userAgent: ua,
      notificationSupport: 'Notification' in window,
      serviceWorkerSupport: 'serviceWorker' in navigator,
      pushManagerSupport: 'PushManager' in window
    };

    setDeviceInfo(info);
    addDebugLog('Device info initialized', 'info', info);

    // Check notification permission
    if ('Notification' in window) {
      const permission = Notification.permission;
      setPermissionStatus(permission);
      addDebugLog(`Notification permission: ${permission}`,
        permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : 'warning'
      );
    } else {
      setPermissionStatus('not-supported');
      addDebugLog('Notification API not supported', 'error');
    }

    // Check service worker status
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        setSwStatus('active');
        addDebugLog('Service worker is active', 'success', {
          scope: registration.scope,
          state: registration.active?.state
        });

        // Check push subscription
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          addDebugLog('Push subscription found', 'success', {
            endpoint: subscription.endpoint.substring(0, 50) + '...'
          });
        } else {
          addDebugLog('No push subscription found', 'warning');
        }
      } catch (error) {
        setSwStatus('error');
        addDebugLog('Service worker error', 'error', { error: error.message });
      }
    } else {
      setSwStatus('not-supported');
      addDebugLog('Service worker not supported', 'error');
    }
  }, [addDebugLog]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/push/check-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [API_BASE_URL]);

  const loadPreferences = useCallback(async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/push/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [API_BASE_URL]);

  const loadDailyReminders = useCallback(async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/push/daily-reminders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDailyReminders(data.dailyReminders);
      }
    } catch (error) {
      console.error('Error loading daily reminders:', error);
    }
  }, [API_BASE_URL]);

  // Check for debug mode from URL params or localStorage
  useEffect(() => {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');

    // Check localStorage
    const debugFlag = localStorage.getItem('fridgy_debug_mode');

    // Enable debug console if either condition is true
    if (debugParam === 'true' || debugFlag === 'true') {
      setShowDebugConsole(true);
      addDebugLog('Debug mode enabled', 'info', {
        source: debugParam === 'true' ? 'URL parameter' : 'localStorage flag'
      });
    }
  }, [addDebugLog]);

  // Check browser notification permission on component mount and update
  useEffect(() => {
    const updatePermissionStatus = () => {
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      } else {
        setPermissionStatus('not-supported');
      }
    };

    // Check initial permission status
    updatePermissionStatus();

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          setSwStatus('active');
        }
      }).catch(() => {
        setSwStatus('error');
      });
    }

    // Also check when window gets focus (user might have changed settings)
    window.addEventListener('focus', updatePermissionStatus);

    return () => {
      window.removeEventListener('focus', updatePermissionStatus);
    };
  }, []);

  // Initialize component and set up service worker listener
  useEffect(() => {
    checkSubscriptionStatus();
    loadPreferences();
    loadDailyReminders();
    initializeDebugInfo();
    loadDebugLogs();

    // Listen for messages from service worker
    const handleServiceWorkerMessage = (event) => {
      console.log('[NotificationSettings] SW message received:', event.data);

      if (event.data.type === 'NOTIFICATION_SHOWN') {
        addDebugLog('Notification displayed successfully!', 'success', event.data.data);
      } else if (event.data.type === 'NOTIFICATION_ERROR') {
        addDebugLog('Failed to display notification', 'error', { error: event.data.error });
      } else if (event.data.type === 'SW_ACTIVATED') {
        addDebugLog('Service worker activated', 'success', { timestamp: event.data.timestamp });
        setSwStatus('active');
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [addDebugLog, checkSubscriptionStatus, loadPreferences, loadDailyReminders, initializeDebugInfo, loadDebugLogs]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setMessage('');
    addDebugLog('Starting subscription process', 'info');

    try {
      // Request notification permission
      addDebugLog('Requesting notification permission', 'info');
      const permissionGranted = await requestNotificationPermission();

      if (!permissionGranted) {
        const errorMsg = 'Please enable notifications in your browser settings';
        setMessage(errorMsg);
        addDebugLog(errorMsg, 'error', { permission: Notification.permission });
        setIsLoading(false);
        return;
      }

      addDebugLog('Permission granted', 'success');

      // Subscribe to push notifications
      addDebugLog('Creating push subscription', 'info');
      const subscription = await subscribeToPush();
      console.log('Push subscription result:', subscription);

      if (!subscription) {
        const errorMsg = 'Failed to create push subscription. This could be due to:\n' +
                       '1. Service worker not registered\n' +
                       '2. VAPID key fetch failed (check network tab)\n' +
                       '3. Push manager not available\n' +
                       'Check the debug console below for details.';
        setMessage(errorMsg);
        addDebugLog('Subscription creation failed', 'error', {
          subscription: null,
          possibleReasons: [
            'Service worker registration failed',
            'VAPID key fetch failed (CORS?)',
            'Push manager unavailable'
          ]
        });
        setIsLoading(false);
        return;
      }

      addDebugLog('Push subscription created', 'success', {
        endpoint: subscription.endpoint.substring(0, 50) + '...'
      });

      // Save subscription to backend - validate token first
      addDebugLog('Validating authentication token', 'info');
      const token = ensureValidToken();  // Will be fixed in tokenValidator.js

      if (!token) {
        // Run debug info for troubleshooting
        debugTokenStatus();
        const errorMsg = 'Authentication required. Please log in first.';
        setMessage(errorMsg);
        addDebugLog(errorMsg, 'error', { hasToken: false });
        setIsLoading(false);
        return;
      }

      addDebugLog('Token validated', 'success');

      console.log('Push Subscribe Request:', {
        url: `${API_BASE_URL}/push/subscribe`,
        tokenValid: true,
        subscriptionKeys: subscription ? Object.keys(subscription) : []
      });

      addDebugLog('Saving subscription to backend', 'info');
      const response = await fetch(`${API_BASE_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription })
      });

      if (response.ok) {
        setIsSubscribed(true);
        const successMsg = 'Successfully subscribed to notifications!';
        setMessage(successMsg);
        addDebugLog(successMsg, 'success');
        setPermissionStatus('granted');
      } else {
        const errorData = await response.json();
        console.error('Subscription failed:', errorData);
        const errorMsg = `Failed: ${errorData.message || errorData.error || 'Unknown error'}`;
        setMessage(errorMsg);
        addDebugLog('Backend subscription failed', 'error', errorData);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      const errorMsg = 'An error occurred while subscribing';
      setMessage(errorMsg);
      addDebugLog('Subscription error', 'error', {
        error: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = async () => {
    addDebugLog('Quick test notification triggered', 'info');

    try {
      // First check if we have permission
      if (Notification.permission !== 'granted') {
        const errorMsg = 'Notification permission not granted';
        addDebugLog(errorMsg, 'error');
        setMessage(errorMsg);
        return;
      }

      // Try to show a local notification
      addDebugLog('Attempting to show local notification', 'info');

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Send message to service worker to show notification
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_TEST_NOTIFICATION',
          data: {
            title: '🔔 Test Notification',
            body: 'If you see this, notifications are working!',
            timestamp: new Date().toISOString()
          }
        });

        addDebugLog('Test notification message sent to service worker', 'success');
        setMessage('Test notification sent! Check your device.');
      } else {
        // Fallback: try direct notification
        const notification = new Notification('🔔 Test Notification', {
          body: 'If you see this, notifications are working!',
          icon: '/logo192.png',
          badge: '/logo192.png'
        });

        addDebugLog('Direct notification created', 'success');
        setMessage('Test notification sent! Check your device.');

        setTimeout(() => notification.close(), 5000);
      }
    } catch (error) {
      const errorMsg = `Test failed: ${error.message}`;
      addDebugLog('Test notification failed', 'error', { error: error.message });
      setMessage(errorMsg);
    }
  };

  const handleTestWithDelay = () => {
    addDebugLog('Delayed test notification scheduled (5 seconds)', 'info');
    setMessage('Test notification will appear in 5 seconds...');

    setTimeout(() => {
      handleQuickTest();
    }, 5000);
  };

  const handleTestBackendPush = async () => {
    addDebugLog('Testing backend push notification', 'info');
    handleTestNotification();
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from backend
        const token = localStorage.getItem('fridgy_token');
        await fetch(`${API_BASE_URL}/push/unsubscribe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      setIsSubscribed(false);
      setMessage('Successfully unsubscribed from notifications');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setMessage('An error occurred while unsubscribing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setMessage('');
    addDebugLog('Sending test notification via backend', 'info');

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        const errorMsg = 'No authentication token found';
        addDebugLog(errorMsg, 'error');
        setMessage(errorMsg);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/push/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        addDebugLog('Backend test notification sent', 'success', data);
      } else {
        const errorMsg = 'Failed to send test notification';
        setMessage(errorMsg);
        addDebugLog(errorMsg, 'error', { status: response.status });
      }
    } catch (error) {
      console.error('Test notification error:', error);
      const errorMsg = 'An error occurred';
      setMessage(errorMsg);
      addDebugLog('Backend test error', 'error', { error: error.message });
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/push/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        setMessage('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      setMessage('Failed to update preferences');
    }
  };

  const handleDaysChange = (day) => {
    const days = [...preferences.days_before_expiry];
    const index = days.indexOf(day);

    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
      days.sort((a, b) => a - b);
    }

    const newPreferences = { ...preferences, days_before_expiry: days };
    setPreferences(newPreferences);
    updatePreferences(newPreferences);
  };

  const handleTimeChange = (e) => {
    const newPreferences = { ...preferences, notification_time: e.target.value };
    setPreferences(newPreferences);
    updatePreferences(newPreferences);
  };

  const handleEnabledChange = (e) => {
    const newPreferences = { ...preferences, enabled: e.target.checked };
    setPreferences(newPreferences);
    updatePreferences(newPreferences);
  };

  const updateDailyReminders = async (newReminders) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/push/daily-reminders`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dailyReminders: newReminders })
      });

      if (response.ok) {
        setMessage('Daily reminders updated successfully');
      }
    } catch (error) {
      console.error('Update daily reminders error:', error);
      setMessage('Failed to update daily reminders');
    }
  };

  const handleDailyReminderToggle = (reminderType) => {
    const newReminders = {
      ...dailyReminders,
      [reminderType]: {
        ...dailyReminders[reminderType],
        enabled: !dailyReminders[reminderType].enabled
      }
    };
    setDailyReminders(newReminders);
    updateDailyReminders(newReminders);
  };

  const handleDailyReminderTimeChange = (reminderType, time) => {
    const newReminders = {
      ...dailyReminders,
      [reminderType]: {
        ...dailyReminders[reminderType],
        time
      }
    };
    setDailyReminders(newReminders);
    updateDailyReminders(newReminders);
  };

  const handleDailyReminderDayChange = (reminderType, day) => {
    const newReminders = {
      ...dailyReminders,
      [reminderType]: {
        ...dailyReminders[reminderType],
        day
      }
    };
    setDailyReminders(newReminders);
    updateDailyReminders(newReminders);
  };

  const handleTestDailyReminder = async (reminderType) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${API_BASE_URL}/push/test-daily-reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reminderType })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        setMessage('Failed to send test reminder');
      }
    } catch (error) {
      console.error('Test daily reminder error:', error);
      setMessage('An error occurred');
    }
  };

  const formatReminderLabel = (key) => {
    return key.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // SUPER SIMPLE test - just show a notification RIGHT NOW
  const testNotificationNow = () => {
    console.log('[Test] Showing notification NOW');

    // Try to show notification immediately via service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_TEST_NOTIFICATION',
        data: {
          title: '🥬 Spinach Expiring Soon!',
          body: 'Your spinach expires tomorrow - use it today!',
          timestamp: Date.now()
        }
      });
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    } else {
      // Fallback: direct notification
      try {
        new Notification('🥬 Spinach Expiring Soon!', {
          body: 'Your spinach expires tomorrow - use it today!',
          icon: '/logo192.png',
          badge: '/logo192.png'
        });
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 3000);
      } catch (e) {
        setTestError('Cannot show notification. Enable in Settings.');
        setTimeout(() => setTestError(null), 5000);
      }
    }
  };

  // Start 5-minute test notifications
  const startFiveMinuteTest = async () => {
    setTestLoading(true);
    setTestError(null);

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        throw new Error('Please log in to start test notifications');
      }

      const response = await fetch(`${API_BASE_URL}/push/test/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start test');
      }

      const data = await response.json();
      setTestRunning(true);
      setNextTestTime(data.nextTime);
      setTestSuccess(true);
      setMessage(`Test started! Hey ${data.userName}, you'll get notifications every 5 minutes for the next hour.`);

      // Store in localStorage so we remember across refreshes
      localStorage.setItem('test_notifications_running', 'true');

      addDebugLog('5-minute test started', 'success', data);
      setTimeout(() => setTestSuccess(false), 5000);
    } catch (error) {
      setTestError(error.message);
      addDebugLog('Failed to start 5-minute test', 'error', { error: error.message });
      setTimeout(() => setTestError(null), 5000);
    } finally {
      setTestLoading(false);
    }
  };

  // Stop 5-minute test notifications
  const stopFiveMinuteTest = async () => {
    setTestLoading(true);

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        throw new Error('Please log in to stop test notifications');
      }

      const response = await fetch(`${API_BASE_URL}/push/test/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to stop test');
      }

      const data = await response.json();
      setTestRunning(false);
      setNextTestTime(null);
      setMessage('Test notifications stopped');
      localStorage.removeItem('test_notifications_running');

      addDebugLog('5-minute test stopped', 'success', data);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setTestError(error.message);
      addDebugLog('Failed to stop 5-minute test', 'error', { error: error.message });
      setTimeout(() => setTestError(null), 5000);
    } finally {
      setTestLoading(false);
    }
  };

  // Check test status on mount
  useEffect(() => {
    const checkTestStatus = async () => {
      const testWasRunning = localStorage.getItem('test_notifications_running') === 'true';
      if (testWasRunning) {
        try {
          const token = localStorage.getItem('fridgy_token');
          if (token) {
            const response = await fetch(`${API_BASE_URL}/push/test/status`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              setTestRunning(data.isRunning);
              setNextTestTime(data.nextTime);

              if (!data.isRunning) {
                localStorage.removeItem('test_notifications_running');
              }
            }
          }
        } catch (error) {
          console.error('Error checking test status:', error);
        }
      }
    };

    checkTestStatus();
  }, [API_BASE_URL, addDebugLog]);

  return (
    <div className="notification-settings">
      <div className="notification-settings__section">
        <h3>Notification Status</h3>
        <div className="notification-settings__status">
          <span className={`status-indicator ${isSubscribed ? 'active' : 'inactive'}`}>
            {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
          </span>
        </div>

        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="notification-settings__button primary"
          >
            {isLoading ? 'Connecting...' :
             permissionStatus === 'granted' ? 'Connect to Server' : 'Enable Notifications'}
          </button>
        ) : (
          <div className="notification-settings__button-group">
            {/* Hidden: Send Test Notification button - removed per user request
            <button
              onClick={handleTestNotification}
              className="notification-settings__button secondary"
            >
              Send Test Notification
            </button>
            */}
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="notification-settings__button danger"
            >
              {isLoading ? 'Unsubscribing...' : 'Disable Notifications'}
            </button>
          </div>
        )}
      </div>

      {isSubscribed && (
        <div className="notification-settings__section">
          <h3>Notification Preferences</h3>

          <div className="notification-settings__preference">
            <label>
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={handleEnabledChange}
              />
              Enable expiry notifications
            </label>
          </div>

          <div className="notification-settings__preference">
            <label>Notify me when items expire in:</label>
            <div className="notification-settings__days">
              {[1, 2, 3, 5, 7].map(day => (
                <label key={day} className="day-checkbox">
                  <input
                    type="checkbox"
                    checked={preferences.days_before_expiry.includes(day)}
                    onChange={() => handleDaysChange(day)}
                  />
                  {day} {day === 1 ? 'day' : 'days'}
                </label>
              ))}
            </div>
          </div>

          <div className="notification-settings__preference">
            <label>
              Preferred notification time:
              <input
                type="time"
                value={preferences.notification_time}
                onChange={handleTimeChange}
                className="time-input"
              />
            </label>
          </div>
        </div>
      )}

      {isSubscribed && (
        <div className="notification-settings__section">
          <h3>Daily Reminders</h3>
          <div className="daily-reminders-main-section">
            <label className="daily-reminders-description-label">
              <input
                type="checkbox"
                checked={dailyReminders.inventory_check?.enabled || false}
                onChange={(e) => {
                  const newReminders = {
                    ...dailyReminders,
                    inventory_check: {
                      ...dailyReminders.inventory_check,
                      enabled: e.target.checked
                    }
                  };
                  setDailyReminders(newReminders);
                  updateDailyReminders(newReminders);
                }}
              />
              <span>Get daily notifications to help you stay on track with your food management</span>
            </label>

            {dailyReminders.inventory_check?.enabled && (
              <div className="daily-reminder-time-section">
                <input
                  type="time"
                  value={dailyReminders.inventory_check?.time || '17:30'}
                  onChange={(e) => handleDailyReminderTimeChange('inventory_check', e.target.value)}
                  className="reminder-time-input-standalone"
                />
              </div>
            )}
          </div>

          {Object.entries(dailyReminders)
            .filter(([key]) => key !== 'inventory_check')
            .map(([key, reminder]) => (
            <div key={key} className="daily-reminder-item">
              <div className="daily-reminder-header">
                <label className="daily-reminder-toggle">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={() => handleDailyReminderToggle(key)}
                  />
                  <span className="reminder-emoji">{reminder.emoji}</span>
                  <span className="reminder-label">{formatReminderLabel(key)}</span>
                </label>

                {reminder.enabled && (
                  <button
                    className="test-reminder-btn"
                    onClick={() => handleTestDailyReminder(key)}
                    title="Send test notification"
                  >
                    Test
                  </button>
                )}
              </div>

              {reminder.enabled && (
                <div className="daily-reminder-settings">
                  <div className="reminder-message">
                    <span className="message-preview">"{reminder.message}"</span>
                  </div>

                  <div className="reminder-schedule">
                    {reminder.day && (
                      <select
                        value={reminder.day}
                        onChange={(e) => handleDailyReminderDayChange(key, e.target.value)}
                        className="day-select"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    )}

                    <input
                      type="time"
                      value={reminder.time}
                      onChange={(e) => handleDailyReminderTimeChange(key, e.target.value)}
                      className="reminder-time-input"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className={`notification-settings__message ${message.includes('error') || message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Debug button only visible in debug mode */}
      {!isSubscribed && showDebugConsole && (
        <button
          className="notification-settings__debug-btn"
          onClick={() => {
            debugTokenStatus();
            const fridgyToken = localStorage.getItem('fridgy_token');
            const tokenPreview = fridgyToken ?
              `${fridgyToken.substring(0, 10)}...${fridgyToken.substring(fridgyToken.length - 10)}` :
              'NOT FOUND';

            const debugInfo = `Token Status Debug:\n\n` +
              `LocalStorage Available: ${typeof localStorage !== 'undefined' ? 'Yes' : 'No'}\n` +
              `Auth Token (fridgy_token): ${fridgyToken ? 'Yes ✅' : 'No ❌'}\n` +
              `Token Preview: ${tokenPreview}\n` +
              `User Data (fridgy_user): ${localStorage.getItem('fridgy_user') ? 'Yes ✅' : 'No ❌'}\n` +
              `Refresh Token: ${localStorage.getItem('fridgy_refresh_token') ? 'Yes ✅' : 'No ❌'}\n\n` +
              `If tokens are missing, please log out and log back in.\n` +
              `Check browser console for more details.`;
            alert(debugInfo);
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔍 Debug Token Status
        </button>
      )}

      {/* Debug Console - Always Visible for Troubleshooting */}
      {showDebugConsole && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '2px solid #dee2e6',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#495057' }}>
            🐛 Debug Console
          </h3>

          {/* Status Summary */}
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <div><strong>Device:</strong> {deviceInfo.platform || 'Unknown'} - {deviceInfo.browser || 'Unknown'}</div>
            <div><strong>PWA Mode:</strong> {deviceInfo.isPWA ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Permission:</strong> <span style={{
              color: permissionStatus === 'granted' ? '#28a745' :
                     permissionStatus === 'denied' ? '#dc3545' : '#ffc107'
            }}>{permissionStatus}</span></div>
            <div><strong>Service Worker:</strong> <span style={{
              color: swStatus === 'active' ? '#28a745' : '#dc3545'
            }}>{swStatus}</span></div>
            <div><strong>Subscribed:</strong> {isSubscribed ? '✅ Yes' : '❌ No'}</div>
          </div>

          {/* Recent Logs */}
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: '#f1f3f5',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <strong>Recent Activity:</strong>
            {debugLogs.length === 0 ? (
              <div style={{ marginTop: '10px', color: '#6c757d' }}>No logs yet. Try subscribing to see activity.</div>
            ) : (
              debugLogs.slice(0, 10).map((log, index) => (
                <div key={index} style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: log.type === 'error' ? '#ffebee' :
                                  log.type === 'success' ? '#e8f5e9' :
                                  log.type === 'warning' ? '#fff3e0' : 'white',
                  borderLeft: `4px solid ${
                    log.type === 'error' ? '#f44336' :
                    log.type === 'success' ? '#4caf50' :
                    log.type === 'warning' ? '#ff9800' : '#2196f3'
                  }`,
                  borderRadius: '3px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                  </div>
                  {log.details && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#666' }}>
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Manual Test Buttons */}
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={async () => {
                addDebugLog('Testing VAPID key fetch...', 'info');
                try {
                  const response = await fetch(`${API_BASE_URL}/push/vapid-public-key`);
                  if (response.ok) {
                    const data = await response.json();
                    addDebugLog('VAPID key fetch successful', 'success', { hasKey: !!data.publicKey });
                  } else {
                    addDebugLog('VAPID key fetch failed', 'error', { status: response.status });
                  }
                } catch (error) {
                  addDebugLog('VAPID key fetch error', 'error', { error: error.message });
                }
              }}
              style={{
                marginRight: '10px',
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Test VAPID Fetch
            </button>

            <button
              onClick={() => {
                setDebugLogs([]);
                addDebugLog('Logs cleared', 'info');
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Clear Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;