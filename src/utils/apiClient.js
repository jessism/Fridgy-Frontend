// API Client Utility
// Centralized API client for making authenticated requests with cookie support

import { safeJSONStringify } from './jsonSanitizer';

// Get API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Token storage helpers (for backward compatibility)
const getToken = async () => {
  // Check localStorage first (backward compatibility)
  const token = localStorage.getItem('fridgy_token');
  if (token) return token;

  // Also check session storage as fallback
  const sessionToken = sessionStorage.getItem('fridgy_token');
  return sessionToken;
};

/**
 * Make an API request with proper authentication and cookie handling
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Response data
 */
export const apiClient = async (endpoint, options = {}) => {
  // Build full URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // Get token for backward compatibility (will be removed once cookies are fully working)
  const token = await getToken();

  // Build request configuration
  const config = {
    ...options,
    credentials: 'include', // CRITICAL: Include cookies in all requests
    headers: {
      'Content-Type': 'application/json',
      // Include Authorization header for backward compatibility
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Handle body serialization
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = safeJSONStringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } else {
      // For non-JSON responses (like text or HTML)
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${text}`);
      }

      return text;
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiClient(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    apiClient(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    apiClient(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    apiClient(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }),
};

export default api;