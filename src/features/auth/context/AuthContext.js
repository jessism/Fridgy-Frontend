import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

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

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('fridgy_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('fridgy_user');
      }
    }
    setLoading(false);
  }, []);

  // Sign up function
  const signUp = async (userData) => {
    const { firstName, email, password } = userData;

    // Validation
    if (!validateName(firstName)) {
      throw new Error('Name must be at least 2 characters long and contain only letters and spaces');
    }

    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Mock signup - in real app, this would call an API
    const newUser = {
      id: Date.now().toString(),
      firstName: firstName.trim(),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString()
    };

    // Save user to localStorage
    localStorage.setItem('fridgy_user', JSON.stringify(newUser));
    setUser(newUser);

    return newUser;
  };

  // Sign in function
  const signIn = async (email, password) => {
    // Validation
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Mock signin - in real app, this would call an API
    // For now, we'll create a user if they don't exist
    const savedUser = localStorage.getItem('fridgy_user');
    let user;

    if (savedUser) {
      user = JSON.parse(savedUser);
      if (user.email.toLowerCase() === email.toLowerCase()) {
        setUser(user);
        return user;
      }
    }

    // If no user exists or email doesn't match, create a new one
    const newUser = {
      id: Date.now().toString(),
      firstName: 'User', // Default name for signin
      email: email.toLowerCase(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('fridgy_user', JSON.stringify(newUser));
    setUser(newUser);

    return newUser;
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem('fridgy_user');
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
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 