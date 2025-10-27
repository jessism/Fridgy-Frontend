import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * PreFlightCheckModal - Checks prerequisites before recipe import tutorial
 * Scenarios: All ready, Missing notifications, Missing shortcut, Missing both
 */
const PreFlightCheckModal = ({
  hasNotifications,
  hasShortcut,
  onContinue,
  onEnableNotifications,
  onInstallShortcut,
  onSkip
}) => {
  // Scenario 1: Everything ready - auto-advance after 2 seconds
  useEffect(() => {
    if (hasNotifications && hasShortcut) {
      const timer = setTimeout(() => {
        onContinue();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasNotifications, hasShortcut, onContinue]);

  // Scenario 1: All Ready
  if (hasNotifications && hasShortcut) {
    return ReactDOM.createPortal(
      <div className="guided-tour__celebration-overlay">
        <div className="guided-tour__celebration-card">
          {/* Success Icon */}
          <div className="guided-tour__celebration-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h2 className="guided-tour__celebration-message">You're All Set!</h2>

          <div className="preflight-check__items">
            <div className="preflight-check__item preflight-check__item--ready">
              <div className="preflight-check__status preflight-check__status--ready">✓</div>
              <span>Push notifications enabled</span>
            </div>
            <div className="preflight-check__item preflight-check__item--ready">
              <div className="preflight-check__status preflight-check__status--ready">✓</div>
              <span>iOS shortcut installed</span>
            </div>
          </div>

          <p style={{ fontSize: '1rem', color: '#666', margin: '1rem 0' }}>
            You're ready to import recipes!
          </p>

          <button className="guided-tour__celebration-button" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Scenario 2: Missing Notifications Only
  if (!hasNotifications && hasShortcut) {
    return ReactDOM.createPortal(
      <div className="guided-tour__celebration-overlay">
        <div className="guided-tour__shortcut-card guided-tour__shortcut-card--simple">
          <h2 className="guided-tour__shortcut-simple-title">Almost Ready!</h2>

          <div className="preflight-check__items">
            <div className="preflight-check__item preflight-check__item--ready">
              <div className="preflight-check__status preflight-check__status--ready">✓</div>
              <span>iOS shortcut installed</span>
            </div>
            <div className="preflight-check__item preflight-check__item--missing">
              <div className="preflight-check__status preflight-check__status--missing">⚠</div>
              <span>Push notifications needed</span>
            </div>
          </div>

          <p className="guided-tour__shortcut-simple-description">
            We need push notifications to alert you when your recipe is ready (takes 2-3 seconds).
          </p>

          <div className="guided-tour__shortcut-buttons">
            <button className="guided-tour__celebration-button" onClick={onEnableNotifications}>
              Enable Notifications
            </button>
            <button className="guided-tour__shortcut-secondary-button" onClick={onContinue}>
              Continue Without Notifications
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Scenario 3: Missing Shortcut Only
  if (hasNotifications && !hasShortcut) {
    return ReactDOM.createPortal(
      <div className="guided-tour__celebration-overlay">
        <div className="guided-tour__shortcut-card guided-tour__shortcut-card--simple">
          <h2 className="guided-tour__shortcut-simple-title">Shortcut Required</h2>

          <div className="preflight-check__items">
            <div className="preflight-check__item preflight-check__item--missing">
              <div className="preflight-check__status preflight-check__status--missing">⚠</div>
              <span>iOS shortcut not installed</span>
            </div>
            <div className="preflight-check__item preflight-check__item--ready">
              <div className="preflight-check__status preflight-check__status--ready">✓</div>
              <span>Push notifications enabled</span>
            </div>
          </div>

          <p className="guided-tour__shortcut-simple-description">
            To import Instagram recipes, you need to install the iOS shortcut first.
          </p>

          <div className="guided-tour__shortcut-buttons">
            <button className="guided-tour__celebration-button" onClick={onInstallShortcut}>
              Install Shortcut First
            </button>
          </div>

          <button className="guided-tour__shortcut-text-link" onClick={onSkip}>
            Skip for now
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Scenario 4: Missing Both
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__shortcut-card guided-tour__shortcut-card--simple">
        <h2 className="guided-tour__shortcut-simple-title">Let's Get You Set Up</h2>

        <p className="guided-tour__shortcut-simple-description" style={{ marginBottom: '1rem' }}>
          To import Instagram recipes, you need:
        </p>

        <div className="preflight-check__items">
          <div className="preflight-check__item preflight-check__item--missing">
            <div className="preflight-check__status preflight-check__status--missing">⚠</div>
            <span>iOS shortcut (not installed)</span>
          </div>
          <div className="preflight-check__item preflight-check__item--missing">
            <div className="preflight-check__status preflight-check__status--missing">⚠</div>
            <span>Push notifications (disabled)</span>
          </div>
        </div>

        <p className="guided-tour__shortcut-simple-description">
          Don't worry! We'll help you set them up quickly.
        </p>

        <div className="guided-tour__shortcut-buttons">
          <button className="guided-tour__celebration-button" onClick={onInstallShortcut}>
            Set Up Now
          </button>
        </div>

        <button className="guided-tour__shortcut-text-link" onClick={onSkip}>
          Skip for now
        </button>
      </div>
    </div>,
    document.body
  );
};

export default PreFlightCheckModal;
