import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import appleIcon from '../assets/icons/ios_icon_black.png';
import androidIcon from '../assets/icons/android_icon_black.png';
import './InstallTrackabitePage.css';

const InstallTrackabitePage = () => {
  const navigate = useNavigate();
  const { isInstallable, installApp, installOutcome } = usePWAInstall();
  const [platform, setPlatform] = useState({ isIOS: false, isAndroid: false, isDesktop: false });
  const [expandedSection, setExpandedSection] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Detect user's platform
  useEffect(() => {
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isDesktop = !isIOS && !isAndroid;

      return { isIOS, isAndroid, isDesktop };
    };

    const detected = detectPlatform();
    setPlatform(detected);

    // Auto-expand the relevant section based on platform
    if (detected.isIOS) {
      setExpandedSection('ios');
    } else if (detected.isAndroid) {
      setExpandedSection('android');
    } else {
      // On desktop, expand iOS by default (more common)
      setExpandedSection('ios');
    }
  }, []);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await installApp();
      // installOutcome will be updated by the hook
    } catch (error) {
      console.error('[InstallTrackabitePage] Install error:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Track install success
  useEffect(() => {
    if (installOutcome === 'accepted') {
      setInstallSuccess(true);
    }
  }, [installOutcome]);

  return (
    <div className="install-trackabite-page">
      {/* Header */}
      <header className="install-trackabite-page__header">
        <button
          className="install-trackabite-page__back-button"
          onClick={handleBack}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="install-trackabite-page__title">Install Trackabite</h1>
      </header>

      {/* Main Content */}
      <main className="install-trackabite-page__content">
        {/* Intro Section */}
        <section className="install-trackabite-page__intro">
          <div className="install-trackabite-page__intro-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="16" y="8" width="32" height="48" rx="4" stroke="#4fcf61" strokeWidth="3" fill="none"/>
              <rect x="26" y="14" width="12" height="2" rx="1" fill="#4fcf61"/>
              <line x1="22" y1="52" x2="42" y2="52" stroke="#4fcf61" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="install-trackabite-page__intro-title">Get the Full App Experience!</h2>
          <p className="install-trackabite-page__intro-description">
            Install Trackabite on your phone for instant access from your home screen.
            Enjoy faster loading, offline access, and an app-like experience.
          </p>
        </section>

        {/* iOS Installation Card */}
        <div className={`install-trackabite-page__platform-card ${platform.isIOS ? 'install-trackabite-page__platform-card--highlighted' : ''}`}>
          <button
            className="install-trackabite-page__platform-header"
            onClick={() => toggleSection('ios')}
            aria-expanded={expandedSection === 'ios'}
          >
            <div className="install-trackabite-page__platform-header-left">
              <div className="install-trackabite-page__platform-icon">
                <img src={appleIcon} alt="Apple" width="22" height="22" />
              </div>
              <h3 className="install-trackabite-page__platform-title">
                Install on iOS
                {platform.isIOS && <span className="install-trackabite-page__badge">Your Device</span>}
              </h3>
            </div>
            <svg
              className={`install-trackabite-page__chevron ${expandedSection === 'ios' ? 'install-trackabite-page__chevron--expanded' : ''}`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {expandedSection === 'ios' && (
            <div className="install-trackabite-page__steps">
              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">1</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Open Safari</h4>
                  <p className="install-trackabite-page__step-description">
                    Make sure you're using Safari browser on your iPhone or iPad. This feature is not available in other browsers on iOS.
                  </p>
                </div>
              </div>

              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">2</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Tap the Share button</h4>
                  <p className="install-trackabite-page__step-description">
                    Look for the share icon (a square with an arrow pointing up) at the bottom of your Safari browser.
                  </p>
                  <div className="install-trackabite-page__visual-hint">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="8" width="16" height="13" rx="2" stroke="#4fcf61" strokeWidth="2"/>
                      <path d="M12 3V13M12 3L8 7M12 3L16 7" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Share Icon</span>
                  </div>
                </div>
              </div>

              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">3</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Select "Add to Home Screen"</h4>
                  <p className="install-trackabite-page__step-description">
                    Scroll down in the share menu and tap on "Add to Home Screen" option.
                  </p>
                </div>
              </div>

              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">4</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Tap "Add"</h4>
                  <p className="install-trackabite-page__step-description">
                    Confirm by tapping "Add" in the top right corner. Trackabite will now appear on your home screen!
                  </p>
                </div>
              </div>

              <div className="install-trackabite-page__success-message">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#4fcf61" strokeWidth="2"/>
                  <path d="M6 10L9 13L14 7" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>You can now open Trackabite directly from your home screen!</span>
              </div>
            </div>
          )}
        </div>

        {/* Android Installation Card */}
        <div className={`install-trackabite-page__platform-card ${platform.isAndroid ? 'install-trackabite-page__platform-card--highlighted' : ''}`}>
          <button
            className="install-trackabite-page__platform-header"
            onClick={() => toggleSection('android')}
            aria-expanded={expandedSection === 'android'}
          >
            <div className="install-trackabite-page__platform-header-left">
              <div className="install-trackabite-page__platform-icon">
                <img src={androidIcon} alt="Android" width="32" height="32" />
              </div>
              <h3 className="install-trackabite-page__platform-title">
                Install on Android
                {platform.isAndroid && <span className="install-trackabite-page__badge">Your Device</span>}
              </h3>
            </div>
            <svg
              className={`install-trackabite-page__chevron ${expandedSection === 'android' ? 'install-trackabite-page__chevron--expanded' : ''}`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {expandedSection === 'android' && (
            <div className="install-trackabite-page__steps">
              {/* Auto-install button for supported browsers */}
              {isInstallable && !installSuccess && (
                <div className="install-trackabite-page__auto-install">
                  <button
                    className="install-trackabite-page__install-button"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                  >
                    {isInstalling ? (
                      <>
                        <div className="install-trackabite-page__spinner"></div>
                        <span>Installing...</span>
                      </>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Install Now</span>
                      </>
                    )}
                  </button>
                  <p className="install-trackabite-page__install-hint">
                    Click the button above for instant installation, or follow the manual steps below.
                  </p>
                </div>
              )}

              {/* Success message */}
              {installSuccess && (
                <div className="install-trackabite-page__install-success">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#4fcf61" strokeWidth="2"/>
                    <path d="M8 12l3 3 5-5" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <h4>Successfully Installed!</h4>
                    <p>Trackabite has been added to your home screen. You can now access it like a native app!</p>
                  </div>
                </div>
              )}

              {/* Manual installation steps (always visible as fallback) */}
              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">1</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Open Chrome</h4>
                  <p className="install-trackabite-page__step-description">
                    Make sure you're using Google Chrome browser on your Android device for the best installation experience.
                  </p>
                </div>
              </div>

              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">2</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Tap the Menu button</h4>
                  <p className="install-trackabite-page__step-description">
                    Look for the three dots (⋮) in the top right corner of Chrome and tap on it to open the menu.
                  </p>
                  <div className="install-trackabite-page__visual-hint">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="5" r="2" fill="#4fcf61"/>
                      <circle cx="12" cy="12" r="2" fill="#4fcf61"/>
                      <circle cx="12" cy="19" r="2" fill="#4fcf61"/>
                    </svg>
                    <span>Menu Icon</span>
                  </div>
                </div>
              </div>

              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">3</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Select "Add to Home screen" or "Install app"</h4>
                  <p className="install-trackabite-page__step-description">
                    In the menu, look for either "Add to Home screen" or "Install app" option and tap on it.
                  </p>
                </div>
              </div>

              <div className="install-trackabite-page__step">
                <div className="install-trackabite-page__step-number">4</div>
                <div className="install-trackabite-page__step-content">
                  <h4 className="install-trackabite-page__step-title">Tap "Add" or "Install"</h4>
                  <p className="install-trackabite-page__step-description">
                    Confirm the installation by tapping "Add" or "Install". Trackabite will now appear on your home screen!
                  </p>
                </div>
              </div>

              <div className="install-trackabite-page__success-message">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#4fcf61" strokeWidth="2"/>
                  <path d="M6 10L9 13L14 7" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>You can now open Trackabite directly from your home screen!</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Message */}
        {platform.isDesktop && (
          <div className="install-trackabite-page__desktop-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>
              You're currently on a desktop device. Open this page on your mobile phone to install Trackabite as an app.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstallTrackabitePage;
