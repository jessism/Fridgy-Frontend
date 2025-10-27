import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * PreFlightCheckModal - Two-step check: Shortcut (manual) + Notifications (auto)
 * Step 1: Ask if they have shortcut
 * Step 2: Check notifications (if shortcut confirmed)
 */
const PreFlightCheckModal = ({
  hasNotifications,
  onContinue,
  onEnableNotifications,
  onInstallShortcut,
  onSkip
}) => {
  const [step, setStep] = useState('shortcut'); // 'shortcut' or 'notifications'
  const [userHasShortcut, setUserHasShortcut] = useState(false);

  // Step 1: Ask about shortcut
  if (step === 'shortcut') {
    return ReactDOM.createPortal(
      <div className="guided-tour__celebration-overlay">
        <div className="guided-tour__shortcut-card guided-tour__shortcut-card--simple">
          {/* Title */}
          <h2 className="guided-tour__shortcut-simple-title">
            Before We Start...
          </h2>

          {/* Description */}
          <p className="guided-tour__shortcut-simple-description">
            Have you installed the "Save to Trackabite" shortcut?
          </p>

          {/* Buttons */}
          <div className="guided-tour__shortcut-buttons">
            <button
              className="guided-tour__celebration-button"
              onClick={() => {
                setUserHasShortcut(true);
                setStep('notifications'); // Move to notification check
              }}
            >
              Yes, I Have It
            </button>
            <button
              className="guided-tour__shortcut-secondary-button"
              onClick={onInstallShortcut}
            >
              No, Help Me Install
            </button>
          </div>

          {/* Skip Text Link */}
          {onSkip && (
            <button
              className="guided-tour__shortcut-text-link"
              onClick={onSkip}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // Step 2: Check notifications (after shortcut confirmed)
  if (step === 'notifications') {
    // If notifications already enabled, show "All Set" and auto-continue
    if (hasNotifications) {
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
                <span>iOS shortcut installed</span>
              </div>
              <div className="preflight-check__item preflight-check__item--ready">
                <div className="preflight-check__status preflight-check__status--ready">✓</div>
                <span>Push notifications enabled</span>
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

    // If notifications NOT enabled, ask to enable
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

  return null;
};

export default PreFlightCheckModal;
