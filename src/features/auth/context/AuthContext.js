import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Token management functions
const getToken = () => {
  return localStorage.getItem('fridgy_token');
};

const setToken = (token) => {
  localStorage.setItem('fridgy_token', token);
};

const removeToken = () => {
  localStorage.removeItem('fridgy_token');
  localStorage.removeItem('fridgy_user');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
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
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Verify token with backend and get user data
          const response = await apiRequest('/auth/me');
          if (response.success) {
            setUser(response.user);
            localStorage.setItem('fridgy_user', JSON.stringify(response.user));
          } else {
            removeToken();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

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
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.toLowerCase(),
          password,
        }),
      });

      if (response.success) {
        // Store token and user data
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('fridgy_user', JSON.stringify(response.user));
        return response.user;
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
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      if (response.success) {
        // Store token and user data
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('fridgy_user', JSON.stringify(response.user));
        return response.user;
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
        });
      }
    } catch (error) {
      // Log error but don't prevent logout from completing
      console.error('Backend logout error:', error);
    }
    
    // Always clear local storage and state regardless of backend response
    removeToken();
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