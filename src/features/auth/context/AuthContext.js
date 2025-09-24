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
        // Check for auth hint (indicates user might be logged in)
        const authHint = localStorage.getItem('fridgy_auth_hint');

        // If auth hint exists OR we have stored tokens, verify with backend
        if (authHint === 'true') {
          try {
            // ALWAYS verify with backend first (this will use cookies if available)
            const response = await apiRequest('/auth/me');

            if (response.success) {
              // User is authenticated via cookies or tokens
              const userWithToken = { ...response.user, token: response.token || '' };
              setUser(userWithToken);
              await setUserData(response.user);

              // Update tokens if provided (for PWA localStorage)
              if (response.token) {
                await setTokens(response.token, response.refreshToken, response.expiresIn);
              }

              // Keep the auth hint
              localStorage.setItem('fridgy_auth_hint', 'true');
              scheduleTokenRefresh();
              setLoading(false);
              return;
            }
          } catch (verifyError) {
            console.log('Backend verification failed, trying localStorage tokens...');
          }
        }

        // Fallback: Check localStorage tokens (for PWA offline or network errors)
        const token = await getToken();
        const storedUser = await getUserData();

        if (token && storedUser) {
          const isExpired = await pwaAuthStorage.isTokenExpired();

          if (!isExpired) {
            // Use stored data for offline support
            setUser({ ...storedUser, token });

            // Try to verify/refresh in background
            try {
              const response = await apiRequest('/auth/me');
              if (response.success) {
                await setUserData(response.user);
                setUser({ ...response.user, token });
                localStorage.setItem('fridgy_auth_hint', 'true');
                scheduleTokenRefresh();
              } else {
                // Try refresh
                await tryTokenRefresh();
              }
            } catch (error) {
              // Network error - keep using cached data
              console.log('Network error, using cached auth');
            }
          } else {
            // Token expired, try refresh
            await tryTokenRefresh();
          }
        } else {
          // No auth found
          localStorage.removeItem('fridgy_auth_hint');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('fridgy_auth_hint');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to try token refresh
    const tryTokenRefresh = async () => {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: safeJSONStringify({ refreshToken, isPWA: isPWA() })
          });

          if (response.ok) {
            const data = await response.json();
            await setTokens(data.token, data.refreshToken, data.expiresIn);
            await setUserData(data.user);
            setUser({ ...data.user, token: data.token });
            localStorage.setItem('fridgy_auth_hint', 'true');
            scheduleTokenRefresh();
          } else {
            await removeTokens();
            localStorage.removeItem('fridgy_auth_hint');
            setUser(null);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          await removeTokens();
          localStorage.removeItem('fridgy_auth_hint');
          setUser(null);
        }
      } else {
        localStorage.removeItem('fridgy_auth_hint');
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