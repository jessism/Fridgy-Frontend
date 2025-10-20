import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthGuard.css';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't show anything while checking authentication
  // The initial green loading screen will remain visible
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to landing page
  if (!user) {
    // Store the intended destination for after login
    sessionStorage.setItem('redirectAfterSignin', location.pathname);
    
    return <Navigate to="/" replace />;
  }

  // If authenticated, show the protected content
  return children;
};

export default AuthGuard; 