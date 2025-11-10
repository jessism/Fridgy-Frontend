import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './SupportPage.css';

const SupportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Feedback form state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

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
    window.location.href = 'mailto:hello@trackabite.app?subject=Support Request';
  };

  const handleInAppFeedback = () => {
    setShowFeedbackModal(true);
    setSubmitStatus(null);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackMessage('');
    setSubmitStatus(null);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!feedbackMessage.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('fridgy_token');

      const response = await fetch(`${API_BASE_URL}/support/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: feedbackMessage.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFeedbackMessage('');

        // Auto-close after 2 seconds on success
        setTimeout(() => {
          handleCloseFeedbackModal();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Primary - In-App Feedback */}
        <div className="support-page__card support-page__card--primary" onClick={handleInAppFeedback}>
          <div className="support-page__card-header">
            <div className="support-page__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="support-page__card-content">
              <h2 className="support-page__card-title">Submit Feedback</h2>
              <p className="support-page__card-description">Share your thoughts with us</p>
              <p className="support-page__card-subtext">Quick and easy</p>
            </div>
          </div>
          <button className="support-page__card-button support-page__card-button--primary">
            Write Feedback
          </button>
        </div>

        {/* Secondary - Text Support */}
        <div className="support-page__card support-page__card--secondary" onClick={handleTextSupport}>
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
          <button className="support-page__card-button support-page__card-button--secondary">
            Open Messages
          </button>
        </div>

        {/* Tertiary - Email Support */}
        <div className="support-page__card support-page__card--tertiary" onClick={handleEmailSupport}>
          <div className="support-page__card-header">
            <div className="support-page__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="support-page__card-content">
              <h2 className="support-page__card-title">Email Support</h2>
              <p className="support-page__card-email">hello@trackabite.app</p>
              <p className="support-page__card-description">Reach out anytime</p>
            </div>
          </div>
          <button className="support-page__card-button support-page__card-button--tertiary">
            Send Email
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="support-page__modal-overlay" onClick={handleCloseFeedbackModal}>
          <div className="support-page__modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-page__modal-header">
              <h2 className="support-page__modal-title">Submit Feedback</h2>
              <button
                className="support-page__modal-close"
                onClick={handleCloseFeedbackModal}
                aria-label="Close feedback form"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="support-page__form">
              <div className="support-page__form-group">
                <label htmlFor="feedback-message" className="support-page__form-label">
                  Your Feedback
                </label>
                <textarea
                  id="feedback-message"
                  className="support-page__form-textarea"
                  placeholder="Tell us what's on your mind..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows="6"
                  maxLength="5000"
                  disabled={isSubmitting}
                  required
                />
                <p className="support-page__form-char-count">
                  {feedbackMessage.length} / 5000
                </p>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="support-page__status support-page__status--success">
                  Thank you! Your feedback has been submitted successfully.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="support-page__status support-page__status--error">
                  Failed to submit feedback. Please try again.
                </div>
              )}

              {/* Form Actions */}
              <div className="support-page__form-actions">
                <button
                  type="button"
                  className="support-page__form-button support-page__form-button--cancel"
                  onClick={handleCloseFeedbackModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="support-page__form-button support-page__form-button--submit"
                  disabled={isSubmitting || !feedbackMessage.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportPage;
