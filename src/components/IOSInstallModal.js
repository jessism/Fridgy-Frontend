import React from 'react';
import './IOSInstallModal.css';

const IOSInstallModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="ios-install-modal__overlay" onClick={onClose}>
      <div className="ios-install-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="ios-install-modal__close" onClick={onClose}>
          ✕
        </button>

        <div className="ios-install-modal__header">
          <h2 className="ios-install-modal__title">Install Trackabite</h2>
          <p className="ios-install-modal__subtitle">
            Add Trackabite to your home screen for the best experience
          </p>
        </div>

        <div className="ios-install-modal__steps">
          <div className="ios-install-modal__step">
            <div className="ios-install-modal__step-number">1</div>
            <div className="ios-install-modal__step-content">
              <h3 className="ios-install-modal__step-title">Tap the Share button</h3>
              <p className="ios-install-modal__step-description">
                Look for the <span className="ios-install-modal__icon">⎙</span> icon at the bottom of Safari
              </p>
            </div>
          </div>

          <div className="ios-install-modal__step">
            <div className="ios-install-modal__step-number">2</div>
            <div className="ios-install-modal__step-content">
              <h3 className="ios-install-modal__step-title">Scroll and tap "Add to Home Screen"</h3>
              <p className="ios-install-modal__step-description">
                You may need to scroll down in the share menu
              </p>
            </div>
          </div>

          <div className="ios-install-modal__step">
            <div className="ios-install-modal__step-number">3</div>
            <div className="ios-install-modal__step-content">
              <h3 className="ios-install-modal__step-title">Tap "Add"</h3>
              <p className="ios-install-modal__step-description">
                Trackabite will appear on your home screen
              </p>
            </div>
          </div>
        </div>

        <button className="ios-install-modal__continue" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
};

export default IOSInstallModal;
