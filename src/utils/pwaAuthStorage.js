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
    this.db = null;

    // Detect if running as PWA
    this.isPWA = this.detectPWA();

    // Initialize IndexedDB
    this.initDB();
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
      return;
    }

    try {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB initialized successfully');
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    } catch (error) {
      console.error('IndexedDB initialization error:', error);
    }
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
    } catch (e) {
      console.warn('localStorage clear failed:', e);
    }

    // Clear IndexedDB
    promises.push(
      this.deleteFromIndexedDB(this.TOKEN_KEY).catch(e => console.warn('IndexedDB delete failed:', e)),
      this.deleteFromIndexedDB(this.REFRESH_TOKEN_KEY).catch(e => console.warn('IndexedDB delete failed:', e)),
      this.deleteFromIndexedDB(this.USER_KEY).catch(e => console.warn('IndexedDB delete failed:', e))
    );

    // Clear sessionStorage
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
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
    const start = Date.now();

    while (!this.db && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.db;
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

  // Get auth expiry time (if stored)
  async getTokenExpiry() {
    try {
      const expiryStr = localStorage.getItem('fridgy_token_expiry');
      if (expiryStr) return parseInt(expiryStr, 10);
    } catch (e) {
      // Ignore
    }

    try {
      const expiryStr = await this.getFromIndexedDB('fridgy_token_expiry');
      if (expiryStr) return parseInt(expiryStr, 10);
    } catch (e) {
      // Ignore
    }

    return null;
  }

  // Set auth expiry time
  async setTokenExpiry(expiry) {
    const expiryStr = expiry.toString();

    try {
      localStorage.setItem('fridgy_token_expiry', expiryStr);
    } catch (e) {
      // Ignore
    }

    try {
      await this.setInIndexedDB('fridgy_token_expiry', expiryStr);
    } catch (e) {
      // Ignore
    }
  }

  // Check if token is expired
  async isTokenExpired() {
    const expiry = await this.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() > expiry;
  }
}

// Export singleton instance
const pwaAuthStorage = new PWAAuthStorage();
export default pwaAuthStorage;