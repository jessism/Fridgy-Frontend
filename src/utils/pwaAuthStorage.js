// PWA Auth Storage Utility
// Provides persistent authentication storage with multiple fallback strategies
// Designed to work across PWA contexts where localStorage might be cleared

class PWAAuthStorage {
  constructor() {
    this.DB_NAME = 'FridgyAuthDB';
    this.DB_VERSION = 1;
    this.STORE_NAME = 'auth';
    this.TOKEN_KEY = 'fridgy_token';
    this.REFRESH_TOKEN_KEY = 'fridgy_refresh_token';
    this.USER_KEY = 'fridgy_user';
    this.TOKEN_EXPIRY_KEY = 'fridgy_token_expiry';
    this.db = null;
    this.dbInitialized = false;

    // Detect if running as PWA
    this.isPWA = this.detectPWA();

    // Initialize IndexedDB and store the promise for race condition prevention
    this.dbReady = this.initDB();

    // Request persistent storage permission (non-blocking)
    // More aggressive for PWAs
    if (this.isPWA) {
      // Try immediately and also after a delay
      this.requestPersistentStorage();
      setTimeout(() => this.requestPersistentStorage(), 5000);
    } else {
      this.requestPersistentStorage();
    }
  }

  detectPWA() {
    // Check multiple indicators of PWA mode
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://') ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches
    );
  }

  async initDB() {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      this.dbInitialized = true; // Mark as initialized even if not supported
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

        request.onerror = () => {
          console.error('Failed to open IndexedDB');
          this.dbInitialized = true; // Mark as initialized even on error
          resolve(null);
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.dbInitialized = true;
          console.log('IndexedDB initialized successfully');
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };

        // Add timeout to prevent infinite waiting
        setTimeout(() => {
          if (!this.dbInitialized) {
            console.warn('IndexedDB initialization timeout');
            this.dbInitialized = true;
            resolve(null);
          }
        }, 5000);
      } catch (error) {
        console.error('IndexedDB initialization error:', error);
        this.dbInitialized = true;
        resolve(null);
      }
    });
  }

  // Get token with fallback strategy
  async getToken() {
    // Try localStorage first (fastest)
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) return token;
    } catch (e) {
      console.warn('localStorage read failed:', e);
    }

    // Try IndexedDB second (most persistent)
    try {
      const token = await this.getFromIndexedDB(this.TOKEN_KEY);
      if (token) {
        // Sync back to localStorage for faster access
        this.syncToLocalStorage(this.TOKEN_KEY, token);
        return token;
      }
    } catch (e) {
      console.warn('IndexedDB read failed:', e);
    }

    // Try sessionStorage as last resort
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      if (token) return token;
    } catch (e) {
      console.warn('sessionStorage read failed:', e);
    }

    return null;
  }

  // Get refresh token with fallback strategy
  async getRefreshToken() {
    // Try localStorage first
    try {
      const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (token) return token;
    } catch (e) {
      console.warn('localStorage read failed:', e);
    }

    // Try IndexedDB second
    try {
      const token = await this.getFromIndexedDB(this.REFRESH_TOKEN_KEY);
      if (token) {
        this.syncToLocalStorage(this.REFRESH_TOKEN_KEY, token);
        return token;
      }
    } catch (e) {
      console.warn('IndexedDB read failed:', e);
    }

    // Try sessionStorage
    try {
      const token = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (token) return token;
    } catch (e) {
      console.warn('sessionStorage read failed:', e);
    }

    return null;
  }

  // Get user data with fallback strategy
  async getUser() {
    // Try localStorage first
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) return JSON.parse(userStr);
    } catch (e) {
      console.warn('localStorage read failed:', e);
    }

    // Try IndexedDB second
    try {
      const userStr = await this.getFromIndexedDB(this.USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        this.syncToLocalStorage(this.USER_KEY, userStr);
        return user;
      }
    } catch (e) {
      console.warn('IndexedDB read failed:', e);
    }

    // Try sessionStorage
    try {
      const userStr = sessionStorage.getItem(this.USER_KEY);
      if (userStr) return JSON.parse(userStr);
    } catch (e) {
      console.warn('sessionStorage read failed:', e);
    }

    return null;
  }

  // Set token in all storage locations
  async setToken(token) {
    // Save to all available storage mechanisms
    const promises = [];

    // LocalStorage
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }

    // IndexedDB
    promises.push(this.setInIndexedDB(this.TOKEN_KEY, token).catch(e => {
      console.warn('IndexedDB write failed:', e);
    }));

    // SessionStorage (fallback)
    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    } catch (e) {
      console.warn('sessionStorage write failed:', e);
    }

    await Promise.all(promises);
  }

  // Set refresh token in all storage locations
  async setRefreshToken(token) {
    const promises = [];

    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }

    promises.push(this.setInIndexedDB(this.REFRESH_TOKEN_KEY, token).catch(e => {
      console.warn('IndexedDB write failed:', e);
    }));

    try {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.warn('sessionStorage write failed:', e);
    }

    await Promise.all(promises);
  }

  // Set user data in all storage locations
  async setUser(user) {
    const userStr = JSON.stringify(user);
    const promises = [];

    try {
      localStorage.setItem(this.USER_KEY, userStr);
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }

    promises.push(this.setInIndexedDB(this.USER_KEY, userStr).catch(e => {
      console.warn('IndexedDB write failed:', e);
    }));

    try {
      sessionStorage.setItem(this.USER_KEY, userStr);
    } catch (e) {
      console.warn('sessionStorage write failed:', e);
    }

    await Promise.all(promises);
  }

  // Clear all auth data
  async clearAuth() {
    const promises = [];

    // Clear localStorage
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (e) {
      console.warn('localStorage clear failed:', e);
    }

    // Clear IndexedDB
    promises.push(
      this.deleteFromIndexedDB(this.TOKEN_KEY).catch(e => console.warn('IndexedDB delete failed:', e)),
      this.deleteFromIndexedDB(this.REFRESH_TOKEN_KEY).catch(e => console.warn('IndexedDB delete failed:', e)),
      this.deleteFromIndexedDB(this.USER_KEY).catch(e => console.warn('IndexedDB delete failed:', e)),
      this.deleteFromIndexedDB(this.TOKEN_EXPIRY_KEY).catch(e => console.warn('IndexedDB delete failed:', e))
    );

    // Clear sessionStorage
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (e) {
      console.warn('sessionStorage clear failed:', e);
    }

    await Promise.all(promises);
  }

  // IndexedDB operations
  async getFromIndexedDB(key) {
    if (!this.db) {
      await this.waitForDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      try {
        const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async setInIndexedDB(key, value) {
    if (!this.db) {
      await this.waitForDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      try {
        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(value, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteFromIndexedDB(key) {
    if (!this.db) {
      await this.waitForDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      try {
        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Wait for IndexedDB to be ready
  async waitForDB(timeout = 3000) {
    // If already initialized, return immediately
    if (this.dbInitialized) {
      return this.db;
    }

    // Wait for the initialization promise with timeout
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve(null), timeout)
    );

    try {
      // Race between initialization and timeout
      const result = await Promise.race([this.dbReady, timeoutPromise]);
      return result;
    } catch (error) {
      console.warn('Error waiting for DB:', error);
      return null;
    }
  }

  // Sync data back to localStorage for faster access
  syncToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Silently fail - localStorage might be full or disabled
    }
  }

  // Check if all auth data exists
  async hasValidAuth() {
    const token = await this.getToken();
    const user = await this.getUser();
    return !!(token && user);
  }

  // Request persistent storage permission
  async requestPersistentStorage() {
    // Only request if running as PWA and API is available
    if (!this.isPWA || !navigator.storage || !navigator.storage.persist) {
      return false;
    }

    try {
      // Check if already persisted
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) {
        console.log('✅ Storage is already persisted');
        return true;
      }

      // Request persistence
      const granted = await navigator.storage.persist();
      if (granted) {
        console.log('✅ Storage persistence granted');
        // Show notification to user
        this.showPersistenceNotification(true);
        return true;
      } else {
        console.log('⚠️ Storage persistence denied');
        // Still functional, just might lose data on iOS
        this.showPersistenceNotification(false);
        return false;
      }
    } catch (error) {
      console.error('Error requesting persistent storage:', error);
      return false;
    }
  }

  // Show user-friendly notification about storage persistence
  showPersistenceNotification(granted) {
    // Only show for PWA users
    if (!this.isPWA) return;

    // Check if we've already shown this notification recently
    const lastShown = localStorage.getItem('fridgy_persistence_notification');
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (lastShown && Date.now() - parseInt(lastShown, 10) < oneWeek) {
      return;
    }

    // Save notification timestamp
    try {
      localStorage.setItem('fridgy_persistence_notification', Date.now().toString());
    } catch (e) {
      // Ignore
    }

    // Create and show notification (only if not already shown)
    if (granted) {
      console.info('🔒 Your login will be remembered securely');
    } else {
      console.info('📱 For best experience on iOS, add this app to your home screen');
    }
  }

  // Check storage persistence status
  async checkPersistence() {
    if (!navigator.storage || !navigator.storage.persisted) {
      return null;
    }

    try {
      return await navigator.storage.persisted();
    } catch (error) {
      console.error('Error checking persistence:', error);
      return null;
    }
  }

  // Get storage quota information
  async getStorageInfo() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // Get auth expiry time (if stored)
  async getTokenExpiry() {
    // Try localStorage first
    try {
      const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        // Validate it's a reasonable timestamp
        if (expiry && expiry > 0) {
          return expiry;
        }
      }
    } catch (e) {
      console.warn('Failed to get expiry from localStorage:', e);
    }

    // Try IndexedDB second
    try {
      const expiryStr = await this.getFromIndexedDB(this.TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        if (expiry && expiry > 0) {
          // Sync back to localStorage for faster access
          this.syncToLocalStorage(this.TOKEN_EXPIRY_KEY, expiryStr);
          return expiry;
        }
      }
    } catch (e) {
      console.warn('Failed to get expiry from IndexedDB:', e);
    }

    // Try sessionStorage as fallback
    try {
      const expiryStr = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        if (expiry && expiry > 0) {
          return expiry;
        }
      }
    } catch (e) {
      console.warn('Failed to get expiry from sessionStorage:', e);
    }

    return null;
  }

  // Set auth expiry time
  async setTokenExpiry(expiry) {
    const expiryStr = expiry.toString();
    const promises = [];

    // Save to localStorage
    try {
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryStr);
    } catch (e) {
      console.warn('Failed to set expiry in localStorage:', e);
    }

    // Save to IndexedDB
    promises.push(
      this.setInIndexedDB(this.TOKEN_EXPIRY_KEY, expiryStr).catch(e => {
        console.warn('Failed to set expiry in IndexedDB:', e);
      })
    );

    // Save to sessionStorage as fallback
    try {
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryStr);
    } catch (e) {
      console.warn('Failed to set expiry in sessionStorage:', e);
    }

    await Promise.all(promises);
  }

  // Check if token is expired
  async isTokenExpired() {
    const token = await this.getToken();

    // No token means expired
    if (!token) {
      return true;
    }

    // First, check if we have a stored expiry
    const storedExpiry = await this.getTokenExpiry();

    if (storedExpiry) {
      // Use stored expiry if available
      return Date.now() > storedExpiry;
    }

    // No stored expiry, try to decode the JWT
    try {
      // JWT structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT format');
        // Invalid token format - consider it valid to avoid logout
        // This is better for PWA persistence
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));

      if (payload.exp) {
        const expiryMs = payload.exp * 1000;
        // Save the extracted expiry for future use
        await this.setTokenExpiry(expiryMs);

        // Add 5 minute grace period for clock skew
        const now = Date.now();
        const isExpired = now > (expiryMs + 5 * 60 * 1000);

        if (isExpired) {
          console.log('[PWA Storage] Token is expired');
        } else {
          const minutesLeft = Math.floor((expiryMs - now) / 60000);
          console.log(`[PWA Storage] Token valid for ${minutesLeft} more minutes`);
        }

        return isExpired;
      } else {
        // No expiry in token - assume it's valid
        // This is better for PWA persistence than assuming expired
        console.log('[PWA Storage] Token has no expiry, assuming valid');
        return false;
      }
    } catch (e) {
      console.warn('[PWA Storage] Failed to decode JWT:', e);
      // On error, assume token is still valid to avoid logout
      // Better to let backend reject if truly invalid
      return false;
    }
  }
}

// Export singleton instance
const pwaAuthStorage = new PWAAuthStorage();
export default pwaAuthStorage;