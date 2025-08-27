import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './ProfilePageV2.css';

const ProfilePageV2 = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Get first name only
  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.trim().split(' ')[0];
  };

  const handleClose = () => {
    navigate('/home');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAboutYou = () => {
    navigate('/about-you');
  };

  const handleManageSubscription = () => {
    // TODO: Navigate to Manage Subscription page
    console.log('Navigate to Manage Subscription');
  };

  const handleFAQs = () => {
    // TODO: Navigate to FAQs page
    console.log('Navigate to FAQs');
  };

  const handleDietaryPreferences = () => {
    navigate('/dietary-preferences');
  };

  return (
    <div className="profile-v2">
      {/* Header */}
      <div className="profile-v2__header">
        <div className="profile-v2__header-left">
          <h1 className="profile-v2__title">My Profile</h1>
        </div>
        <button className="profile-v2__close-button" onClick={handleClose} aria-label="Close profile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="profile-v2__user-section">
        <div className="profile-v2__avatar">
          <span className="profile-v2__avatar-text">
            {getUserInitials(user?.name || user?.email)}
          </span>
        </div>
        <div className="profile-v2__user-info">
          <h2 className="profile-v2__user-name">
            {getFirstName(user?.name) || 'User'}
          </h2>
          <p className="profile-v2__user-email">
            {user?.email || 'user@example.com'}
          </p>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="profile-v2__menu">
        {/* About You */}
        <div className="profile-v2__menu-item" onClick={handleAboutYou}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">About You</span>
        </div>

        {/* Your dietary preferences */}
        <div className="profile-v2__menu-item" onClick={handleDietaryPreferences}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">Your dietary preferences</span>
        </div>

        {/* Manage Subscription */}
        <div className="profile-v2__menu-item" onClick={handleManageSubscription}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">Manage subscription</span>
        </div>

        {/* FAQs */}
        <div className="profile-v2__menu-item" onClick={handleFAQs}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">FAQs</span>
        </div>
      </div>

      {/* Logout Button */}
      <div className="profile-v2__logout-section">
        <button className="profile-v2__logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePageV2;