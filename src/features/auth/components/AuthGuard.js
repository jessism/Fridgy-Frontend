import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthGuard.css';

const AuthGuard = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't show anything while checking authentication
  // The initial green loading screen will remain visible
  if (loading) {
    return null;
  }

  // If not authenticated, redirect appropriately
  if (!user) {
    // Store the intended destination for after login
    sessionStorage.setItem('redirectAfterSignin', location.pathname);

    // Admin paths go to sign-in directly
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/signin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  // Admin-only pages: the backend enforces is_admin; this only avoids a
  // flash of an empty page for signed-in non-admins.
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  // If authenticated, show the protected content
  return children;
};

export default AuthGuard; 