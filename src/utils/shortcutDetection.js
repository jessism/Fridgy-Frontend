/**
 * Shortcut Detection Utility
 * Checks if user has installed the iOS shortcut
 */

/**
 * Check if user has installed and used the iOS shortcut
 * @returns {Promise<boolean>} - True if shortcut is installed and has been used
 */
export const checkShortcutInstalled = async () => {
  try {
    const authToken = localStorage.getItem('fridgy_token');
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${apiUrl}/shortcuts/setup`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      console.error('[ShortcutDetection] Failed to check shortcut:', response.status);
      return false;
    }

    const data = await response.json();

    // If token exists and has been used (last_used_at is set), shortcut is installed
    const isInstalled = data.token && data.last_used_at;

    console.log('[ShortcutDetection] Shortcut installed:', isInstalled);
    return isInstalled;
  } catch (error) {
    console.error('[ShortcutDetection] Error checking shortcut:', error);
    return false;
  }
};

/**
 * Check notification permission status
 * @returns {string} - 'granted', 'denied', 'default', or 'unsupported'
 */
export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    console.log('[Notification] Not supported in this browser');
    return 'unsupported';
  }

  const permission = Notification.permission;
  console.log('[Notification] Permission status:', permission);
  return permission;
};

/**
 * Request notification permission
 * @returns {Promise<string>} - Permission result ('granted', 'denied', or 'default')
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('[Notification] Not supported');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Notification] Permission result:', permission);
    return permission;
  } catch (error) {
    console.error('[Notification] Error requesting permission:', error);
    return 'denied';
  }
};

/**
 * Check both prerequisites for recipe import
 * @returns {Promise<Object>} - Status of both checks
 */
export const checkRecipeImportPrerequisites = async () => {
  const hasNotifications = checkNotificationPermission() === 'granted';
  const hasShortcut = await checkShortcutInstalled();

  return {
    hasNotifications,
    hasShortcut,
    isReady: hasNotifications && hasShortcut
  };
};
