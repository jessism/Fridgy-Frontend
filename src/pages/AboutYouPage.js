import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './AboutYouPage.css';

const AboutYouPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    navigate('/profile');
  };

  const formatMemberSince = (createdAt) => {
    if (!createdAt) return 'Recently joined';
    try {
      return new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently joined';
    }
  };

  const handleEditProfile = () => {
    // TODO: Add edit profile functionality
    console.log('Edit profile clicked');
  };

  return (
    <div className="about-you">
      {/* Header */}
      <div className="about-you__header">
        <div className="about-you__header-left">
          <button className="about-you__back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="about-you__title">About You</h1>
        </div>
        <button className="about-you__header-edit-button" onClick={handleEditProfile}>
          Edit
        </button>
      </div>

      {/* Content */}
      <div className="about-you__content">
        {/* Profile Card */}
        <div className="about-you__card">
          <div className="about-you__card-content">
            {/* Name */}
            <div className="about-you__info-item">
              <label className="about-you__info-label">Full Name</label>
              <span className="about-you__info-value">
                {user?.firstName || 'Not provided'}
              </span>
            </div>

            {/* Email */}
            <div className="about-you__info-item">
              <label className="about-you__info-label">Email Address</label>
              <span className="about-you__info-value">
                {user?.email || 'Not provided'}
              </span>
            </div>

            {/* Member Since */}
            <div className="about-you__info-item">
              <label className="about-you__info-label">Member Since</label>
              <span className="about-you__info-value">
                {formatMemberSince(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutYouPage;