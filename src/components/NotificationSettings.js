import React, { useState, useEffect } from 'react';
import './NotificationSettings.css';
import { requestNotificationPermission, subscribeToPush } from '../serviceWorkerRegistration';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    checkSubscriptionStatus();
    loadPreferences();
    loadDailyReminders();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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

  const handleSubscribe = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Request notification permission
      const permissionGranted = await requestNotificationPermission();

      if (!permissionGranted) {
        setMessage('Please enable notifications in your browser settings');
        setIsLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscription = await subscribeToPush();
      console.log('Push subscription result:', subscription);

      if (!subscription) {
        setMessage('Failed to subscribe to notifications - check console for details');
        setIsLoading(false);
        return;
      }

      // Save subscription to backend
      const token = localStorage.getItem('token');
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
        setMessage('Successfully subscribed to notifications!');
      } else {
        const errorData = await response.json();
        console.error('Subscription failed:', errorData);
        setMessage(`Failed: ${errorData.message || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setMessage('An error occurred while subscribing');
    } finally {
      setIsLoading(false);
    }
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
        const token = localStorage.getItem('token');
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

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/push/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        setMessage('Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      setMessage('An error occurred');
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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

  return (
    <div className="notification-settings">
      <h2 className="notification-settings__title">Push Notifications</h2>

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
            {isLoading ? 'Subscribing...' : 'Enable Notifications'}
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
    </div>
  );
};

export default NotificationSettings;