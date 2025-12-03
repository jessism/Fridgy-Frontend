import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarSyncSettings from '../components/CalendarSyncSettings';
import './CalendarSettingsPage.css';

const CalendarSettingsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <div className="calendar-settings-page">
      <div className="calendar-settings-page__header">
        <button
          className="calendar-settings-page__back-button"
          onClick={handleBack}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="calendar-settings-page__title">Calendar Sync</h1>
      </div>

      <CalendarSyncSettings />
    </div>
  );
};

export default CalendarSettingsPage;
