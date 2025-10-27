import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { usePushNotificationSetup } from '../../hooks/usePushNotificationSetup';
import { useAuth } from '../../features/auth/context/AuthContext';
import './GuidedTour.css';

/**
 * PushNotificationPromptModal - Prompts users to enable push notifications during guided tour
 * Shows after user adds their first item to inventory
 */
const PushNotificationPromptModal = ({ onContinue }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setupPushNotifications } = usePushNotificationSetup();
  const { token } = useAuth();

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await setupPushNotifications(token);

      if (result.success) {
        console.log('[GuidedTour] Push notifications enabled successfully');
        // Continue tour regardless of success
        onContinue(true);
      } else {
        // Show error but allow user to continue
        if (result.permissionDenied) {
          setError('Permission denied. You can enable this later in settings.');
        } else if (result.requiresInstall) {
          setError('Add app to home screen first to enable notifications.');
        } else {
          setError(result.message || 'Could not enable notifications.');
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[GuidedTour] Error enabling notifications:', err);
      setError('An error occurred. You can enable this later.');
      setIsLoading(false);
    }
  };

  const handleMaybeLater = () => {
    console.log('[GuidedTour] User skipped push notifications');
    onContinue(false);
  };

  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__celebration-card guided-tour__notification-card">
        {/* Modern Minimal Bell Icon - Brand Green */}
        <div className="guided-tour__notification-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke="#4fcf61"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke="#4fcf61"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="guided-tour__notification-title">
          Stay updated on your inventory
        </h2>

        {/* Message - Regular weight, better sizing */}
        <p className="guided-tour__notification-description">
          Turn on push notifications to receive updates about your items and never let food go to waste.
        </p>

        {/* Benefits List - With minimal checkmarks */}
        <div className="guided-tour__notification-benefits">
          <div className="guided-tour__notification-benefit">
            <svg className="guided-tour__notification-checkmark" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Expiration alerts</span>
          </div>
          <div className="guided-tour__notification-benefit">
            <svg className="guided-tour__notification-checkmark" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Meal reminders</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="guided-tour__notification-error">
            <p>{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="guided-tour__notification-buttons">
          {!error ? (
            <>
              <button
                className="guided-tour__celebration-button"
                onClick={handleEnableNotifications}
                disabled={isLoading}
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                className="guided-tour__notification-secondary-button"
                onClick={handleMaybeLater}
                disabled={isLoading}
              >
                Maybe Later
              </button>
            </>
          ) : (
            <button
              className="guided-tour__celebration-button"
              onClick={handleMaybeLater}
            >
              Continue
            </button>
          )}
        </div>

        {/* Privacy Note */}
        <p className="guided-tour__notification-privacy">
          You can change this anytime in settings
        </p>
      </div>
    </div>,
    document.body
  );
};

export default PushNotificationPromptModal;
