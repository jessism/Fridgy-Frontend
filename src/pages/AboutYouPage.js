import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import useUserOnboarding from '../hooks/useUserOnboarding';
import './AboutYouPage.css';

const AboutYouPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    onboardingData,
    loading: onboardingLoading,
    hasOnboardingData,
    getFormattedGoal,
    getFormattedBudget,
    getFormattedHouseholdSize,
    updateOnboardingField,
    updateNotificationPreference,
    saving
  } = useUserOnboarding();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

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
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setEditData({});
    } else {
      // Start editing
      setIsEditing(true);
      setEditData({
        primary_goal: onboardingData.primary_goal || '',
        household_size: onboardingData.household_size || 1,
        weekly_budget: onboardingData.weekly_budget || '',
        budget_currency: onboardingData.budget_currency || 'USD',
        notification_preferences: { ...onboardingData.notification_preferences }
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Save each field that changed
      for (const [key, value] of Object.entries(editData)) {
        if (key === 'notification_preferences') {
          await updateOnboardingField('notification_preferences', value);
        } else if (onboardingData[key] !== value) {
          await updateOnboardingField(key, value);
        }
      }
      setIsEditing(false);
      setEditData({});
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (notifType, value) => {
    setEditData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [notifType]: value
      }
    }));
  };

  const goalOptions = [
    { value: 'save_money', label: 'Save money' },
    { value: 'reduce_waste', label: 'Reduce waste' },
    { value: 'eat_healthy', label: 'Eat healthier' },
    { value: 'save_time', label: 'Save time' },
    { value: 'try_recipes', label: 'Try new recipes' },
    { value: 'organize', label: 'Get organized' }
  ];

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
        <div className="about-you__header-buttons">
          {isEditing ? (
            <>
              <button
                className="about-you__header-save-button"
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="about-you__header-cancel-button"
                onClick={handleEditProfile}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="about-you__header-edit-button" onClick={handleEditProfile}>
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="about-you__content">
        {/* Basic Profile Information */}
        <div className="about-you__card">
          <div className="about-you__card-header">
            <h2 className="about-you__section-title">Basic Information</h2>
          </div>
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

        {/* Onboarding Preferences */}
        {onboardingLoading ? (
          <div className="about-you__card">
            <div className="about-you__loading">
              <div className="about-you__spinner"></div>
              <p>Loading your preferences...</p>
            </div>
          </div>
        ) : hasOnboardingData ? (
          <div className="about-you__card">
            <div className="about-you__card-header">
              <h2 className="about-you__section-title">Your Preferences</h2>
            </div>
            <div className="about-you__card-content">
              {/* Primary Goal */}
              <div className="about-you__info-item">
                <label className="about-you__info-label">Primary Goal</label>
                {isEditing ? (
                  <select
                    value={editData.primary_goal || ''}
                    onChange={(e) => handleFieldChange('primary_goal', e.target.value)}
                    className="about-you__edit-select"
                  >
                    <option value="">Select a goal</option>
                    {goalOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="about-you__info-value">
                    {getFormattedGoal()}
                  </span>
                )}
              </div>

              {/* Household Size */}
              <div className="about-you__info-item">
                <label className="about-you__info-label">Household Size</label>
                {isEditing ? (
                  <div className="about-you__household-controls">
                    <button
                      type="button"
                      className="about-you__household-btn"
                      onClick={() => handleFieldChange('household_size', Math.max(1, (editData.household_size || 1) - 1))}
                      disabled={(editData.household_size || 1) <= 1}
                    >
                      -
                    </button>
                    <span className="about-you__household-value">{editData.household_size || 1}</span>
                    <button
                      type="button"
                      className="about-you__household-btn"
                      onClick={() => handleFieldChange('household_size', Math.min(10, (editData.household_size || 1) + 1))}
                      disabled={(editData.household_size || 1) >= 10}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="about-you__info-value">
                    {getFormattedHouseholdSize()}
                  </span>
                )}
              </div>

              {/* Weekly Budget */}
              <div className="about-you__info-item">
                <label className="about-you__info-label">Weekly Budget</label>
                {isEditing ? (
                  <div className="about-you__budget-controls">
                    <input
                      type="number"
                      value={editData.weekly_budget || ''}
                      onChange={(e) => handleFieldChange('weekly_budget', parseFloat(e.target.value) || null)}
                      placeholder="Enter budget"
                      className="about-you__edit-input"
                      min="0"
                      step="10"
                    />
                    <select
                      value={editData.budget_currency || 'USD'}
                      onChange={(e) => handleFieldChange('budget_currency', e.target.value)}
                      className="about-you__edit-select about-you__currency-select"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                ) : (
                  <span className="about-you__info-value">
                    {getFormattedBudget()}
                  </span>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="about-you__info-item">
                <label className="about-you__info-label">Notifications</label>
                {isEditing ? (
                  <div className="about-you__notification-edit-list">
                    <label className="about-you__notification-edit-item">
                      <input
                        type="checkbox"
                        checked={editData.notification_preferences?.mealReminders || false}
                        onChange={(e) => handleNotificationChange('mealReminders', e.target.checked)}
                        className="about-you__edit-checkbox"
                      />
                      <span className="about-you__notification-text">Meal reminders</span>
                    </label>
                    <label className="about-you__notification-edit-item">
                      <input
                        type="checkbox"
                        checked={editData.notification_preferences?.expirationAlerts || false}
                        onChange={(e) => handleNotificationChange('expirationAlerts', e.target.checked)}
                        className="about-you__edit-checkbox"
                      />
                      <span className="about-you__notification-text">Expiration alerts</span>
                    </label>
                    <label className="about-you__notification-edit-item">
                      <input
                        type="checkbox"
                        checked={editData.notification_preferences?.weeklyReports || false}
                        onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                        className="about-you__edit-checkbox"
                      />
                      <span className="about-you__notification-text">Weekly reports</span>
                    </label>
                  </div>
                ) : (
                  <div className="about-you__notification-list">
                    <div className="about-you__notification-item">
                      <span className="about-you__notification-icon">
                        {onboardingData.notification_preferences?.mealReminders ? '✅' : '❌'}
                      </span>
                      <span className="about-you__notification-text">Meal reminders</span>
                    </div>
                    <div className="about-you__notification-item">
                      <span className="about-you__notification-icon">
                        {onboardingData.notification_preferences?.expirationAlerts ? '✅' : '❌'}
                      </span>
                      <span className="about-you__notification-text">Expiration alerts</span>
                    </div>
                    <div className="about-you__notification-item">
                      <span className="about-you__notification-icon">
                        {onboardingData.notification_preferences?.weeklyReports ? '✅' : '❌'}
                      </span>
                      <span className="about-you__notification-text">Weekly reports</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="about-you__card">
            <div className="about-you__card-header">
              <h2 className="about-you__section-title">Your Preferences</h2>
            </div>
            <div className="about-you__card-content">
              <div className="about-you__empty-state">
                <p className="about-you__empty-text">
                  Complete your onboarding to see your preferences here.
                </p>
                <button
                  className="about-you__onboarding-button"
                  onClick={() => navigate('/onboarding')}
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AboutYouPage;