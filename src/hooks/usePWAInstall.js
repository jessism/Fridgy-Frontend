import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('unknown');

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed (running as PWA)
    setIsInstalled(isStandalone);

    // Listen for beforeinstallprompt event (Android/Desktop only)
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('[PWA] Install prompt available');
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('[PWA] App successfully installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return { success: false, reason: 'no-prompt' };
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`[PWA] User response: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return { success: true, outcome };
      } else {
        console.log('[PWA] User dismissed the install prompt');
        return { success: false, outcome };
      }
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return { success: false, reason: 'error', error };
    }
  };

  return {
    isInstallable,    // Can show native install prompt (Android/Desktop)
    isInstalled,      // App is already installed
    platform,         // 'ios', 'android', or 'desktop'
    installApp,       // Function to trigger install prompt
  };
};
