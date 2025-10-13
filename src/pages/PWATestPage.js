import React, { useState } from 'react';
import { usePWADetection } from '../hooks/usePWADetection';
import { usePushNotificationSetup } from '../hooks/usePushNotificationSetup';
import { useAuth } from '../features/auth/context/AuthContext';
import PWANotificationPrompt from '../components/PWANotificationPrompt';
import './PWATestPage.css';

const PWATestPage = () => {
  const { token } = useAuth();
  const {
    isPWA,
    isFirstPWALaunch,
    shouldShowNotificationPrompt,
    platform,
    markFirstLaunchComplete,
    markNotificationPromptShown,
    markNotificationPromptDismissed,
    resetPWAFlags,
    getDebugInfo
  } = usePWADetection();

  const { setupPushNotifications } = usePushNotificationSetup();
  const [showTestPrompt, setShowTestPrompt] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Get debug info
  const debugInfo = getDebugInfo();

  // Handle manual notification setup
  const handleManualNotificationSetup = async () => {
    setTestResult(null);
    const result = await setupPushNotifications(token);
    setTestResult(result);
  };

  // Handle test prompt close
  const handleTestPromptClose = (notificationsEnabled) => {
    setShowTestPrompt(false);
    if (notificationsEnabled) {
      markNotificationPromptShown();
      setTestResult({ success: true, message: 'Test prompt: Notifications enabled!' });
    } else {
      markNotificationPromptDismissed();
      setTestResult({ success: false, message: 'Test prompt: User dismissed' });
    }
  };

  return (
    <div className="pwa-test-page">
      <div className="pwa-test-page__container">
        <h1 className="pwa-test-page__title">PWA Detection & Notification Test</h1>

        {/* Current Status Section */}
        <div className="pwa-test-page__section">
          <h2 className="pwa-test-page__section-title">Current Status</h2>
          <div className="pwa-test-page__status-grid">
            <div className="pwa-test-page__status-item">
              <span className="pwa-test-page__status-label">PWA Mode:</span>
              <span className={`pwa-test-page__status-value ${isPWA ? 'active' : 'inactive'}`}>
                {isPWA ? '✅ Yes' : '❌ No (Browser)'}
              </span>
            </div>
            <div className="pwa-test-page__status-item">
              <span className="pwa-test-page__status-label">Platform:</span>
              <span className="pwa-test-page__status-value">{platform}</span>
            </div>
            <div className="pwa-test-page__status-item">
              <span className="pwa-test-page__status-label">First Launch:</span>
              <span className={`pwa-test-page__status-value ${isFirstPWALaunch ? 'active' : 'inactive'}`}>
                {isFirstPWALaunch ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="pwa-test-page__status-item">
              <span className="pwa-test-page__status-label">Should Show Prompt:</span>
              <span className={`pwa-test-page__status-value ${shouldShowNotificationPrompt ? 'active' : 'inactive'}`}>
                {shouldShowNotificationPrompt ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="pwa-test-page__status-item">
              <span className="pwa-test-page__status-label">Notification Permission:</span>
              <span className="pwa-test-page__status-value">
                {debugInfo.notificationPermission}
              </span>
            </div>
          </div>
        </div>

        {/* Debug Information Section */}
        <div className="pwa-test-page__section">
          <h2 className="pwa-test-page__section-title">Debug Information</h2>
          <div className="pwa-test-page__debug">
            <h3>Display Modes:</h3>
            <ul>
              <li>Standalone: {debugInfo.displayMode.standalone ? '✅' : '❌'}</li>
              <li>Fullscreen: {debugInfo.displayMode.fullscreen ? '✅' : '❌'}</li>
              <li>Minimal UI: {debugInfo.displayMode.minimalUI ? '✅' : '❌'}</li>
              <li>Browser: {debugInfo.displayMode.browser ? '✅' : '❌'}</li>
            </ul>

            <h3>Navigator Standalone:</h3>
            <p>{debugInfo.navigatorStandalone === true ? '✅ Yes' : debugInfo.navigatorStandalone === false ? '❌ No' : 'undefined'}</p>

            <h3>LocalStorage Flags:</h3>
            <ul>
              <li>First Launch Complete: {debugInfo.localStorage.firstLaunchComplete || 'null'}</li>
              <li>Prompt Shown: {debugInfo.localStorage.notificationPromptShown || 'null'}</li>
              <li>Prompt Dismissed: {debugInfo.localStorage.notificationPromptDismissed || 'null'}</li>
              <li>Dismissed Time: {debugInfo.localStorage.notificationPromptDismissedTime ?
                  new Date(parseInt(debugInfo.localStorage.notificationPromptDismissedTime)).toLocaleString() :
                  'null'}</li>
            </ul>
          </div>
        </div>

        {/* Test Actions Section */}
        <div className="pwa-test-page__section">
          <h2 className="pwa-test-page__section-title">Test Actions</h2>
          <div className="pwa-test-page__actions">
            <button
              className="pwa-test-page__button pwa-test-page__button--primary"
              onClick={() => setShowTestPrompt(true)}
            >
              Show Test Notification Prompt
            </button>

            <button
              className="pwa-test-page__button pwa-test-page__button--secondary"
              onClick={handleManualNotificationSetup}
            >
              Manually Setup Notifications
            </button>

            <button
              className="pwa-test-page__button pwa-test-page__button--danger"
              onClick={() => {
                resetPWAFlags();
                window.location.reload();
              }}
            >
              Reset All PWA Flags & Reload
            </button>

            <button
              className="pwa-test-page__button pwa-test-page__button--secondary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`pwa-test-page__result ${testResult.success ? 'success' : 'error'}`}>
              <h3>Test Result:</h3>
              <p>{testResult.message}</p>
              {testResult.error && <p>Error: {testResult.error}</p>}
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="pwa-test-page__section">
          <h2 className="pwa-test-page__section-title">Testing Instructions</h2>
          <div className="pwa-test-page__instructions">
            <h3>To Test First-Time PWA Launch:</h3>
            <ol>
              <li>Add the app to your home screen</li>
              <li>Click "Reset All PWA Flags & Reload"</li>
              <li>Close this browser tab</li>
              <li>Open the app from your home screen</li>
              <li>Navigate to the home page</li>
              <li>The notification prompt should appear after 1.5 seconds</li>
            </ol>

            <h3>Platform-Specific Notes:</h3>
            <ul>
              <li><strong>iOS:</strong> Must be added to home screen for notifications to work</li>
              <li><strong>Android:</strong> Works in both browser and PWA mode</li>
              <li><strong>Desktop:</strong> Works in supported browsers (Chrome, Edge, Firefox)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Notification Prompt */}
      {showTestPrompt && (
        <PWANotificationPrompt
          onClose={handleTestPromptClose}
          onSuccess={() => setTestResult({ success: true, message: 'Notification prompt succeeded!' })}
          platform={platform}
        />
      )}
    </div>
  );
};

export default PWATestPage;