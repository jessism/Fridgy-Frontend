import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { safeJSONStringify } from '../../../utils/jsonSanitizer';

// Create the authentication context
const AuthContext = createContext();

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Token management - Simple localStorage only
const getToken = () => {
  return localStorage.getItem('fridgy_token');
};

const getRefreshToken = () => {
  return localStorage.getItem('fridgy_refresh_token');
};

const setTokens = (token, refreshToken) => {
  if (token) {
    localStorage.setItem('fridgy_token', token);
  }
  if (refreshToken) {
    localStorage.setItem('fridgy_refresh_token', refreshToken);
  }
};

const removeTokens = () => {
  localStorage.removeItem('fridgy_token');
  localStorage.removeItem('fridgy_refresh_token');
  localStorage.removeItem('fridgy_user');
};

const setUserData = (user) => {
  localStorage.setItem('fridgy_user', JSON.stringify(user));
};

const getUserData = () => {
  const userStr = localStorage.getItem('fridgy_user');
  return userStr ? JSON.parse(userStr) : null;
};

// API request helper
const apiRequest = async (endpoint, options = {}, retryWithRefresh = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    // If token expired and we have a refresh token, try to refresh
    if (response.status === 401 && retryWithRefresh) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          // Try to refresh the token
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: safeJSONStringify({ refreshToken })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setTokens(refreshData.token, refreshData.refreshToken);
            setUserData(refreshData.user);

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

  // Schedule token refresh before expiry (refresh 5 minutes before expiry)
  const scheduleTokenRefresh = useCallback(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Schedule refresh in 55 minutes (tokens expire in 1 hour)
    refreshTimeoutRef.current = setTimeout(async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: safeJSONStringify({ refreshToken })
          });

          if (response.ok) {
            const data = await response.json();
            setTokens(data.token, data.refreshToken);
            setUserData(data.user);
            setUser({ ...data.user, token: data.token });
            scheduleTokenRefresh(); // Schedule next refresh
          }
        } catch (error) {
          console.error('Auto token refresh failed:', error);
        }
      }
    }, 55 * 60 * 1000); // 55 minutes
  }, []);

  // Check for existing user session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getToken();
        const storedUser = getUserData();

        if (token && storedUser) {
          // Verify token is still valid
          try {
            const response = await apiRequest('/auth/me', {});

            if (response.success) {
              // Update with fresh data
              setUserData(response.user);
              setUser({ ...response.user, token });

              // If backend sent new tokens, update them
              if (response.token) {
                setTokens(response.token, response.refreshToken);
              }

              scheduleTokenRefresh();
            }
          } catch (error) {
            console.log('Token validation failed, trying refresh...');

            // Try to refresh the token
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: safeJSONStringify({ refreshToken })
                });

                if (refreshResponse.ok) {
                  const data = await refreshResponse.json();
                  setTokens(data.token, data.refreshToken);
                  setUserData(data.user);
                  setUser({ ...data.user, token: data.token });
                  scheduleTokenRefresh();
                } else {
                  // Refresh failed, clear auth
                  removeTokens();
                  setUser(null);
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                removeTokens();
                setUser(null);
              }
            } else {
              // No refresh token, clear auth
              removeTokens();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  // Sign up function
  const signUp = async (userData) => {
    const { firstName, email, password, onboardingSessionId } = userData;

    // Client-side validation
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
          onboardingSessionId // Pass session ID to link payment
        }),
      }, false);

      if (response.success) {
        // Store tokens and user data
        setTokens(response.token, response.refreshToken);
        setUserData(response.user);
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
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
          password
        }),
      }, false);

      if (response.success) {
        // Store tokens and user data
        setTokens(response.token, response.refreshToken);
        setUserData(response.user);
        const userWithToken = { ...response.user, token: response.token };
        setUser(userWithToken);
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
      const token = getToken();
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

    // Always clear all storage and state
    removeTokens();
    setUser(null);

    // Clear tour data to ensure clean state for next user on same device
    localStorage.removeItem('trackabite_guided_tour');
    localStorage.removeItem('trackabite_has_seen_app');
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