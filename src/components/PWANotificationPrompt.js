import React, { useState } from 'react';
import './PWANotificationPrompt.css';
import { usePushNotificationSetup } from '../hooks/usePushNotificationSetup';
import { useAuth } from '../features/auth/context/AuthContext';

const PWANotificationPrompt = ({ onClose, onSuccess, platform }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setupPushNotifications } = usePushNotificationSetup();
  const { token } = useAuth();

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Setup push notifications
      const result = await setupPushNotifications(token);

      if (result.success) {
        // Success! Close the prompt and notify parent
        if (onSuccess) {
          onSuccess();
        }
        onClose(true); // true indicates notifications were enabled
      } else {
        // Handle specific error cases
        if (result.permissionDenied) {
          setError('Notification permission was denied. You can enable it later in your browser settings.');
        } else if (result.requiresInstall) {
          setError('Please add the app to your home screen first to enable notifications.');
        } else {
          setError(result.message || 'Failed to enable notifications. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaybeLater = () => {
    onClose(false); // false indicates user chose "maybe later"
  };

  // Platform-specific messaging
  const getPlatformMessage = () => {
    switch (platform) {
      case 'ios':
        return {
          title: 'Never let food go to waste',
          description: 'Get timely reminders about expiring items and smart meal suggestions.',
          icon: '🔕'
        };
      case 'android':
        return {
          title: 'Never let food go to waste',
          description: 'Receive notifications for expiring items and personalized meal recommendations.',
          icon: '🔕'
        };
      case 'desktop':
        return {
          title: 'Never let food go to waste',
          description: 'Get browser notifications for expiring items and meal planning reminders.',
          icon: '🔕'
        };
      default:
        return {
          title: 'Never let food go to waste',
          description: 'Get reminders about expiring items and smart recipe suggestions.',
          icon: '🔕'
        };
    }
  };

  const message = getPlatformMessage();

  return (
    <div className="pwa-notification-prompt__overlay">
      <div className="pwa-notification-prompt__modal">
        {/* Icon/Illustration */}
        <div className="pwa-notification-prompt__icon-container">
          <span className="pwa-notification-prompt__icon">{message.icon}</span>
        </div>

        {/* Title and Description */}
        <div className="pwa-notification-prompt__content">
          <h2 className="pwa-notification-prompt__title">{message.title}</h2>
          <p className="pwa-notification-prompt__description">{message.description}</p>

          {/* Benefits List */}
          <div className="pwa-notification-prompt__benefits">
            <div className="pwa-notification-prompt__benefit">
              <span className="pwa-notification-prompt__benefit-text">Expiration alerts</span>
            </div>
            <div className="pwa-notification-prompt__benefit">
              <span className="pwa-notification-prompt__benefit-text">Meal reminders</span>
            </div>
            <div className="pwa-notification-prompt__benefit">
              <span className="pwa-notification-prompt__benefit-text">Shopping list updates</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="pwa-notification-prompt__error">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pwa-notification-prompt__actions">
          <button
            className="pwa-notification-prompt__button pwa-notification-prompt__button--primary"
            onClick={handleEnableNotifications}
            disabled={isLoading}
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>
          <button
            className="pwa-notification-prompt__button pwa-notification-prompt__button--secondary"
            onClick={handleMaybeLater}
            disabled={isLoading}
          >
            Maybe Later
          </button>
        </div>

        {/* Privacy Note */}
        <p className="pwa-notification-prompt__privacy">
          We respect your privacy. Notifications can be disabled anytime in settings.
        </p>
      </div>
    </div>
  );
};

export default PWANotificationPrompt;