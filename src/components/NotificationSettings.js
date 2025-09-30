import React, { useState, useEffect, useCallback } from 'react';
import './NotificationSettings.css';
import { requestNotificationPermission, subscribeToPush } from '../serviceWorkerRegistration';
import { ensureValidToken, debugTokenStatus } from '../utils/tokenValidator';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebugConsole, setShowDebugConsole] = useState(false);
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

  const loadDebugLogs = () => {
    try {
      const savedLogs = localStorage.getItem('notification_debug_logs');
      if (savedLogs) {
        setDebugLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error('Error loading debug logs:', error);
    }
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
    localStorage.removeItem('notification_debug_logs');
    addDebugLog('Debug logs cleared', 'info');
  };

  const initializeDebugInfo = async () => {
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
  };

  const checkSubscriptionStatus = async () => {
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
  };

  const loadPreferences = async () => {
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
  };

  const loadDailyReminders = async () => {
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
  };

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
        const errorMsg = 'Failed to subscribe to notifications - check debug console';
        setMessage(errorMsg);
        addDebugLog(errorMsg, 'error', { subscription });
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

  return (
    <div className="notification-settings">
      <h2 className="notification-settings__title">Push Notifications</h2>

      {/* Notification Permission Status Panel - Always Visible */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#333' }}>
          📱 Notification Status
        </h3>

        {/* Row 1: Browser/iOS Permission */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '8px'
        }}>
          <span style={{ flex: 1, fontSize: '15px' }}>🔔 Browser Permission</span>
          <span style={{
            fontWeight: 'bold',
            fontSize: '14px',
            color: permissionStatus === 'granted' ? '#4fcf61' :
                   permissionStatus === 'denied' ? '#ff4444' : '#ff9800'
          }}>
            {permissionStatus === 'granted' ? '✅ Allowed' :
             permissionStatus === 'denied' ? '❌ Blocked' : '⚠️ Not Set'}
          </span>
        </div>

        {/* Row 2: Service Worker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '8px'
        }}>
          <span style={{ flex: 1, fontSize: '15px' }}>⚙️ Service Worker</span>
          <span style={{
            fontWeight: 'bold',
            fontSize: '14px',
            color: swStatus === 'active' ? '#4fcf61' :
                   swStatus === 'error' ? '#ff4444' : '#ff9800'
          }}>
            {swStatus === 'active' ? '✅ Active' :
             swStatus === 'checking' ? '⏳ Loading' :
             swStatus === 'error' ? '❌ Error' : '❌ Inactive'}
          </span>
        </div>

        {/* Row 3: Push Subscription (Server Connection) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          background: 'white',
          borderRadius: '8px'
        }}>
          <span style={{ flex: 1, fontSize: '15px' }}>🌐 Server Connection</span>
          <span style={{
            fontWeight: 'bold',
            fontSize: '14px',
            color: isSubscribed ? '#4fcf61' : '#ff9800'
          }}>
            {isSubscribed ? '✅ Connected' : '⚠️ Not Connected'}
          </span>
        </div>

        {/* Help text when permission granted but not subscribed */}
        {permissionStatus === 'granted' && !isSubscribed && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            background: '#fff3cd',
            border: '1px solid #ffeeba',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#856404'
          }}>
            💡 iOS permissions enabled! Click "Connect to Server" below to complete setup.
          </div>
        )}

        {/* Help text when permission denied */}
        {permissionStatus === 'denied' && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#721c24'
          }}>
            ⚠️ Notifications blocked. Enable in iOS Settings → Safari → Notifications → trackabite.app
          </div>
        )}
      </div>

      {/* SUPER SIMPLE TEST BUTTON */}
      <div style={{
        marginBottom: '20px'
      }}>
        <button
          onClick={testNotificationNow}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: '#FF6B6B',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          🔔 SHOW TEST NOTIFICATION NOW
        </button>

        {/* Simple feedback */}
        {testSuccess && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#e8f5e9',
            borderRadius: '8px',
            color: '#2e7d32',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            ✅ Look for the notification!
          </div>
        )}
        {testError && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#ffebee',
            borderRadius: '8px',
            color: '#c62828',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            {testError}
          </div>
        )}
      </div>

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
             permissionStatus === 'granted' ? '🔗 Connect to Server' : 'Enable Notifications'}
          </button>
        ) : (
          <div className="notification-settings__button-group">
            <button
              onClick={handleTestNotification}
              className="notification-settings__button secondary"
            >
              Send Test Notification
            </button>
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
          <p className="daily-reminders-description">
            Get daily notifications to help you stay on track with your food management
          </p>

          {Object.entries(dailyReminders).map(([key, reminder]) => (
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

      {/* Debug button for troubleshooting on mobile */}
      {!isSubscribed && (
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
    </div>
  );
};

export default NotificationSettings;