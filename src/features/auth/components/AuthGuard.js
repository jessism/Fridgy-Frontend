import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthGuard.css';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to signup with message
  if (!user) {
    // Store the intended destination for after signup
    sessionStorage.setItem('redirectAfterSignup', location.pathname);
    // Store the message to show on signup page
    sessionStorage.setItem('signupMessage', 'We can\'t find your account. Please sign up');
    
    return <Navigate to="/signup" replace />;
  }

  // If authenticated, show the protected content
  return children;
};

export default AuthGuard; 