import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SupportPage.css';

const SupportPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/profile');
  };

  const handleTextSupport = () => {
    // Opens SMS app with pre-filled phone number
    // Replace with your actual support phone number
    window.location.href = 'sms:+15551234567';
  };

  const handleEmailSupport = () => {
    // Opens email client with pre-filled support email
    // Replace with your actual support email
    window.location.href = 'mailto:support@trackabite.com?subject=Support Request';
  };

  return (
    <div className="support-page">
      {/* Header */}
      <div className="support-page__header">
        <button
          className="support-page__back-button"
          onClick={handleClose}
          aria-label="Back to profile"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="support-page__title">Support</h1>
      </div>

      {/* Hero Section */}
      <div className="support-page__hero">
        <div className="support-page__hero-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="support-page__subtitle">We're here to help</p>
      </div>

      {/* Contact Methods */}
      <div className="support-page__content">
        {/* Primary - Text Support */}
        <div className="support-page__card support-page__card--primary" onClick={handleTextSupport}>
          <div className="support-page__card-header">
            <div className="support-page__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="support-page__card-content">
              <h2 className="support-page__card-title">Text Support</h2>
              <p className="support-page__card-phone">(555) 123-4567</p>
              <p className="support-page__card-description">Send us a text message</p>
            </div>
          </div>
          <button className="support-page__card-button support-page__card-button--primary">
            Open Messages
          </button>
        </div>

        {/* Secondary - Email Support */}
        <div className="support-page__card support-page__card--secondary" onClick={handleEmailSupport}>
          <div className="support-page__card-header">
            <div className="support-page__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="support-page__card-content">
              <h2 className="support-page__card-title">Email Support</h2>
              <p className="support-page__card-email">support@trackabite.com</p>
              <p className="support-page__card-description">Reach out anytime</p>
            </div>
          </div>
          <button className="support-page__card-button support-page__card-button--secondary">
            Send Email
          </button>
        </div>
      </div>

    </div>
  );
};

export default SupportPage;
