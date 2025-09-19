import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationSettings from '../components/NotificationSettings';
import './NotificationSettingsPage.css';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <div className="notification-settings-page">
      <div className="notification-settings-page__header">
        <button
          className="notification-settings-page__back-button"
          onClick={handleBack}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="notification-settings-page__title">Notifications</h1>
      </div>

      <NotificationSettings />
    </div>
  );
};

export default NotificationSettingsPage;