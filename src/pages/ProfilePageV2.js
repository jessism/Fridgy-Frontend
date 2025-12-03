import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import useAppUpdate from '../hooks/useAppUpdate';
import { useSubscription } from '../hooks/useSubscription';
import { useGuidedTourContext } from '../contexts/GuidedTourContext';
import './ProfilePageV2.css';

const ProfilePageV2 = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { updateStatus, checkForUpdates, applyUpdate } = useAppUpdate();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const { resetTour, startTour } = useGuidedTourContext();

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
    navigate('/subscription');
  };

  const handleSupport = () => {
    navigate('/support');
  };

  const handleDietaryPreferences = () => {
    navigate('/dietary-preferences');
  };

  const handleNotificationSettings = () => {
    navigate('/notification-settings');
  };

  const handleCalendarSettings = () => {
    navigate('/calendar-settings');
  };

  const handleReplayWelcomeTour = () => {
    // Navigate to welcome tour page
    console.log('[Profile] Opening welcome tour page');
    navigate('/welcome-tour');
  };

  const handleAppUpdate = () => {
    if (updateStatus === 'available') {
      // Apply the update
      applyUpdate();
    } else if (updateStatus === 'current') {
      // Check for updates
      checkForUpdates();
    }
    // Do nothing if checking or updating
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
          <div className={`profile-v2__plan-badge ${isPremium ? 'profile-v2__plan-badge--premium' : 'profile-v2__plan-badge--free'}`}>
            {isPremium ? 'Trackabite Pro' : 'Free Plan'}
          </div>
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

        {/* Notification Settings */}
        <div className="profile-v2__menu-item" onClick={handleNotificationSettings}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">Notification settings</span>
        </div>

        {/* Calendar Sync */}
        <div className="profile-v2__menu-item" onClick={handleCalendarSettings}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">Calendar Sync</span>
        </div>

        {/* Replay Welcome Tour */}
        <div className="profile-v2__menu-item" onClick={handleReplayWelcomeTour}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">Replay welcome tour</span>
        </div>

        {/* App Update */}
        <div
          className={`profile-v2__menu-item ${updateStatus === 'available' ? 'profile-v2__menu-item--has-update' : ''}`}
          onClick={handleAppUpdate}
        >
          <div className="profile-v2__menu-icon">
            {updateStatus === 'checking' || updateStatus === 'updating' ? (
              <svg className="profile-v2__update-icon--spinning" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : updateStatus === 'available' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="profile-v2__menu-content">
            <span className="profile-v2__menu-text">App Update</span>
            <span className="profile-v2__menu-subtext">
              {updateStatus === 'checking' && 'Checking for updates...'}
              {updateStatus === 'updating' && 'Updating app...'}
              {updateStatus === 'available' && 'New version available'}
              {updateStatus === 'current' && "You're up to date"}
            </span>
            {updateStatus === 'available' && (
              <button className="profile-v2__update-button" onClick={(e) => { e.stopPropagation(); applyUpdate(); }}>
                Update Now →
              </button>
            )}
          </div>
          {updateStatus === 'available' && (
            <div className="profile-v2__update-badge"></div>
          )}
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

        {/* Support */}
        <div className="profile-v2__menu-item" onClick={handleSupport}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">Support</span>
        </div>

        {/* Logout */}
        <div className="profile-v2__menu-item" onClick={handleLogout}>
          <div className="profile-v2__menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="profile-v2__menu-text">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageV2;