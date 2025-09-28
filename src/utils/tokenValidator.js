/**
 * Token validation utilities for handling authentication tokens
 */

/**
 * Decode a JWT token without verification (for client-side inspection)
 * @param {string} token - The JWT token to decode
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token || token === 'null' || token === 'undefined') {
      console.log('Token is null or undefined');
      return null;
    }

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token format - expected 3 parts, got', parts.length);
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    console.log('Token has no expiration or is invalid');
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < currentTime;

  if (isExpired) {
    const expirationDate = new Date(decoded.exp * 1000);
    console.log('Token expired at:', expirationDate.toLocaleString());
  }

  return isExpired;
};

/**
 * Get the token from localStorage and validate it
 * @returns {object} Token validation result
 */
export const validateStoredToken = () => {
  const token = localStorage.getItem('token');

  // Check if token exists
  if (!token) {
    return {
      valid: false,
      error: 'NO_TOKEN',
      message: 'No authentication token found. Please log in.'
    };
  }

  // Check for placeholder values
  if (token === 'null' || token === 'undefined' || token === '') {
    return {
      valid: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid token value. Please log in again.'
    };
  }

  // Decode and check expiration
  const decoded = decodeToken(token);
  if (!decoded) {
    return {
      valid: false,
      error: 'MALFORMED_TOKEN',
      message: 'Token is malformed. Please log in again.'
    };
  }

  // Check if expired
  if (isTokenExpired(token)) {
    return {
      valid: false,
      error: 'EXPIRED_TOKEN',
      message: 'Your session has expired. Please log in again.',
      decoded
    };
  }

  // Token is valid
  return {
    valid: true,
    token,
    decoded,
    userId: decoded.userId || decoded.id,
    email: decoded.email,
    expiresAt: new Date(decoded.exp * 1000)
  };
};

/**
 * Clear invalid token and redirect to login
 */
export const clearInvalidToken = () => {
  console.log('Clearing invalid token...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Store the current path for redirect after login
  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
  }

  // Redirect to login page if not already there
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?message=Session expired. Please log in again.';
  }
};

/**
 * Handle token refresh or re-authentication
 * @param {boolean} silent - If true, don't show prompts
 * @returns {Promise<string|null>} New token or null
 */
export const refreshTokenOrReauth = async (silent = false) => {
  const validation = validateStoredToken();

  if (validation.valid) {
    return validation.token;
  }

  console.log('Token needs refresh, reason:', validation.error);

  // For now, we'll prompt for re-authentication
  // In the future, this could implement a refresh token mechanism
  if (!silent) {
    const shouldReauth = window.confirm(
      `${validation.message}\n\nWould you like to log in again to continue?`
    );

    if (shouldReauth) {
      clearInvalidToken();
    }
  }

  return null;
};

/**
 * Ensure valid token before making authenticated requests
 * @returns {string|null} Valid token or null
 */
export const ensureValidToken = () => {
  const validation = validateStoredToken();

  if (!validation.valid) {
    console.error('Token validation failed:', validation.error, validation.message);

    // For mobile debugging
    if (window.confirm(validation.message + '\n\nWould you like to go to the login page?')) {
      clearInvalidToken();
    }

    return null;
  }

  console.log('Token valid until:', validation.expiresAt.toLocaleString());
  return validation.token;
};

/**
 * Test function to help debug token issues
 */
export const debugTokenStatus = () => {
  console.log('=== TOKEN DEBUG INFO ===');

  // Check localStorage availability
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('✅ localStorage is available');
  } catch (e) {
    console.error('❌ localStorage is NOT available:', e.message);
    return;
  }

  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  console.log('localStorage keys:', keys);

  // Check token
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);

  if (token) {
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 30) + '...');

    const validation = validateStoredToken();
    console.log('Validation result:', validation);
  }

  // Check user data
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }

  console.log('=== END DEBUG INFO ===');
};