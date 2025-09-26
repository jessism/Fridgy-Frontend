import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { safeJSONStringify } from '../../../utils/jsonSanitizer';
import pwaAuthStorage from '../../../utils/pwaAuthStorage';

// Create the authentication context
const AuthContext = createContext();

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Detect if running as PWA
const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://') ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name.trim());
};

// Token management functions - now async to support PWA storage
const getToken = async () => {
  // Use PWA storage for better persistence
  return await pwaAuthStorage.getToken();
};

const getRefreshToken = async () => {
  return await pwaAuthStorage.getRefreshToken();
};

const setTokens = async (token, refreshToken, expiresIn) => {
  await pwaAuthStorage.setToken(token);
  if (refreshToken) {
    await pwaAuthStorage.setRefreshToken(refreshToken);
  }
  if (expiresIn) {
    const expiry = Date.now() + (expiresIn * 1000);
    await pwaAuthStorage.setTokenExpiry(expiry);
  }
};

const removeTokens = async () => {
  await pwaAuthStorage.clearAuth();
};

const setUserData = async (user) => {
  await pwaAuthStorage.setUser(user);
};

const getUserData = async () => {
  return await pwaAuthStorage.getUser();
};

// API request helper
const apiRequest = async (endpoint, options = {}, retryWithRefresh = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getToken();
  
  const config = {
    credentials: 'include', // Include cookies with requests
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // Keep for backward compatibility
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    // If token expired and we have a refresh token, try to refresh
    if (response.status === 401 && retryWithRefresh) {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          // Try to refresh the token
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Include cookies with refresh request
            headers: { 'Content-Type': 'application/json' },
            body: safeJSONStringify({ refreshToken, isPWA: isPWA() })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            await setTokens(
              refreshData.token,
              refreshData.refreshToken,
              refreshData.expiresIn
            );
            await setUserData(refreshData.user);

            // Retry the original request with new token
            return apiRequest(endpoint, options, false);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);
  const lastFocusCheckRef = useRef(0);
  const FOCUS_CHECK_INTERVAL = 60000; // 60 seconds minimum between focus checks

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = useCallback(async () => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expiry = await pwaAuthStorage.getTokenExpiry();
    if (!expiry) return;

    // Refresh 5 minutes before expiry
    const refreshTime = expiry - Date.now() - (5 * 60 * 1000);
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: safeJSONStringify({ refreshToken, isPWA: isPWA() })
            });

            if (response.ok) {
              const data = await response.json();
              await setTokens(data.token, data.refreshToken, data.expiresIn);
              await setUserData(data.user);
              setUser({ ...data.user, token: data.token });
              scheduleTokenRefresh(); // Schedule next refresh
            }
          } catch (error) {
            console.error('Auto token refresh failed:', error);
          }
        }
      }, refreshTime);
    }
  }, []);

  // Check for existing user session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent double initialization
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      try {
        console.log('[AUTH] Starting auth initialization...');

        // CRITICAL FIX: Check localStorage FIRST (before any network calls!)
        const token = await getToken();
        const storedUser = await getUserData();
        const authHint = localStorage.getItem('fridgy_auth_hint');

        // If we have valid local auth, use it immediately
        if (token && storedUser) {
          const isExpired = await pwaAuthStorage.isTokenExpired();

          if (!isExpired) {
            console.log('[AUTH] Found valid cached auth, using immediately');
            // USE CACHED AUTH IMMEDIATELY - Don't wait for network
            setUser({ ...storedUser, token });
            setLoading(false);

            // Verify/refresh in background (non-blocking)
            // Add PWA header for backend to know this is a PWA request
            const headers = isPWA() ? { 'X-PWA-Request': 'true' } : {};

            apiRequest('/auth/me', { headers })
              .then(async (response) => {
                if (response.success) {
                  console.log('[AUTH] Background verification successful, updating tokens');
                  // Update with fresh data and tokens
                  await setUserData(response.user);

                  if (response.token) {
                    await setTokens(response.token, response.refreshToken, response.expiresIn);
                  }

                  setUser({ ...response.user, token: response.token || token });
                  localStorage.setItem('fridgy_auth_hint', 'true');
                  scheduleTokenRefresh();
                }
              })
              .catch((error) => {
                // Network error - keep using cached auth (DON'T LOGOUT!)
                console.log('[AUTH] Background verification failed (network error), keeping cached auth');
              });

            return; // User is logged in with cached data
          } else {
            console.log('[AUTH] Cached token expired, trying refresh...');
            // Token expired, try refresh
            const refreshSuccess = await tryTokenRefresh();
            if (refreshSuccess) {
              return; // Successfully refreshed
            }
          }
        }

        // No valid cached auth, try server verification (cookies)
        if (authHint === 'true') {
          console.log('[AUTH] No valid cache, trying server verification...');
          try {
            const headers = isPWA() ? { 'X-PWA-Request': 'true' } : {};
            const response = await apiRequest('/auth/me', { headers });

            if (response.success) {
              console.log('[AUTH] Server verification successful');
              // User is authenticated via cookies
              await setUserData(response.user);

              // Save tokens for next time
              if (response.token) {
                await setTokens(response.token, response.refreshToken, response.expiresIn);
              }

              setUser({ ...response.user, token: response.token || '' });
              localStorage.setItem('fridgy_auth_hint', 'true');
              scheduleTokenRefresh();
              setLoading(false);
              return;
            }
          } catch (error) {
            console.log('[AUTH] Server verification failed:', error.message);
          }
        }

        // No auth found anywhere
        console.log('[AUTH] No authentication found');
        localStorage.removeItem('fridgy_auth_hint');
        setUser(null);
      } catch (error) {
        console.error('[AUTH] Critical initialization error:', error);
        localStorage.removeItem('fridgy_auth_hint');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to try token refresh
    const tryTokenRefresh = async () => {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          console.log('[AUTH] Attempting token refresh...');
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: safeJSONStringify({ refreshToken, isPWA: isPWA() })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[AUTH] Token refresh successful');
            await setTokens(data.token, data.refreshToken, data.expiresIn);
            await setUserData(data.user);
            setUser({ ...data.user, token: data.token });
            localStorage.setItem('fridgy_auth_hint', 'true');
            scheduleTokenRefresh();
            return true; // Refresh succeeded
          } else {
            console.log('[AUTH] Token refresh failed - invalid refresh token');
            await removeTokens();
            localStorage.removeItem('fridgy_auth_hint');
            setUser(null);
            return false; // Refresh failed
          }
        } catch (error) {
          console.error('[AUTH] Token refresh network error:', error);
          // Don't remove tokens on network error - might be offline
          // Keep the expired token and let user continue offline
          return false;
        }
      } else {
        console.log('[AUTH] No refresh token available');
        localStorage.removeItem('fridgy_auth_hint');
        return false;
      }
    };

    initializeAuth();

    // Listen for app focus to refresh auth if needed (PWA specific)
    const handleFocus = async () => {
      // Debounce: Skip if we've checked recently
      const now = Date.now();
      if (now - lastFocusCheckRef.current < FOCUS_CHECK_INTERVAL) {
        return;
      }
      lastFocusCheckRef.current = now;

      // Only check for PWA and when user is logged in
      if (isPWA() && user) {
        // Check if token is about to expire (within 5 minutes)
        const expiry = await pwaAuthStorage.getTokenExpiry();
        const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);

        if (expiry && expiry < fiveMinutesFromNow) {
          console.log('Token expiring soon, attempting refresh on focus...');
          const refreshToken = await getRefreshToken();

          if (refreshToken) {
            try {
              const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: safeJSONStringify({ refreshToken, isPWA: true })
              });

              if (response.ok) {
                const data = await response.json();
                await setTokens(data.token, data.refreshToken, data.expiresIn);
                await setUserData(data.user);
                setUser({ ...data.user, token: data.token });
                scheduleTokenRefresh();
                console.log('Token refreshed successfully on focus');
              } else {
                console.warn('Focus refresh failed with status:', response.status);
              }
            } catch (error) {
              console.error('Focus refresh failed:', error);
              // Don't log user out on network errors during focus
              // They might be offline temporarily
            }
          }
        }
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  // Sign up function
  const signUp = async (userData) => {
    const { firstName, email, password } = userData;

    // Client-side validation (server will also validate)
    if (!validateName(firstName)) {
      throw new Error('Name must be at least 2 characters long and contain only letters and spaces');
    }

    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    try {
      // Call backend signup endpoint
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: safeJSONStringify({
          firstName: firstName.trim(),
          email: email.toLowerCase(),
          password,
          isPWA: isPWA()
        }),
      }, false); // Don't retry with refresh for signup

      if (response.success) {
        // Store tokens and user data
        await setTokens(
          response.token,
          response.refreshToken,
          response.expiresIn
        );
        await setUserData(response.user);
        // Include token in user object for API calls
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
        // Set auth hint for persistence
        localStorage.setItem('fridgy_auth_hint', 'true');
        scheduleTokenRefresh();
        return userWithToken;
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    // Client-side validation
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    try {
      // Call backend signin endpoint
      const response = await apiRequest('/auth/signin', {
        method: 'POST',
        body: safeJSONStringify({
          email: email.toLowerCase(),
          password,
          isPWA: isPWA()
        }),
      }, false); // Don't retry with refresh for signin

      if (response.success) {
        // Store tokens and user data
        await setTokens(
          response.token,
          response.refreshToken,
          response.expiresIn
        );
        await setUserData(response.user);
        // Include token in user object for API calls
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
        // Set auth hint for persistence
        localStorage.setItem('fridgy_auth_hint', 'true');
        scheduleTokenRefresh();
        return userWithToken;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Call backend logout endpoint
      const token = await getToken();
      if (token) {
        await apiRequest('/auth/logout', {
          method: 'POST'
        }, false);
      }
    } catch (error) {
      // Log error but don't prevent logout from completing
      console.error('Backend logout error:', error);
    }

    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Always clear all storage and state regardless of backend response
    await removeTokens();
    localStorage.removeItem('fridgy_auth_hint');
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    logout: signOut, // Alias for backward compatibility
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 