import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
import useUserPreferences from '../hooks/useUserPreferences';
import './HomePage.css'; // Now in the same directory
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const {
    preferences,
    loading,
    saving,
    error,
    updatePreference,
    togglePreference,
    clearError
  } = useUserPreferences();

  const [activeSection, setActiveSection] = useState('account');
  const [expandedSections, setExpandedSections] = useState({
    dietary_restrictions: false,
    allergies: false,
    cuisines: false,
    cooking_time: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dietary restriction options
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'nut-free', label: 'Nut-Free' },
    { id: 'egg-free', label: 'Egg-Free' }
  ];

  // Allergy options
  const allergyOptions = [
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'soy', label: 'Soy' },
    { id: 'sesame', label: 'Sesame' },
    { id: 'wheat', label: 'Wheat' },
    { id: 'tree-nuts', label: 'Tree Nuts' }
  ];

  // Cuisine options
  const cuisineOptions = [
    { id: 'italian', label: 'Italian' },
    { id: 'chinese', label: 'Chinese' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'mediterranean', label: 'Mediterranean' },
    { id: 'indian', label: 'Indian' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'thai', label: 'Thai' },
    { id: 'american', label: 'American' },
    { id: 'middle-eastern', label: 'Middle Eastern' }
  ];

  // Cooking time options
  const cookingTimeOptions = [
    { id: 'under_15', label: 'Under 15 minutes' },
    { id: '15_30', label: '15–30 minutes' },
    { id: '30_60', label: '30–60 minutes' },
    { id: 'over_60', label: '1+ hour' }
  ];

  const handleCustomAllergyChange = (e) => {
    updatePreference('custom_allergies', e.target.value);
  };

  const renderAccountInfo = () => (
    <div className="settings-content">
      <div className="settings-header">
        <h2>Account Information</h2>
        <p>Manage your personal account details</p>
      </div>
      
      <div className="account-info-cards">
        <div className="info-card">
          <div className="info-card-header">
            <h3>Personal Info</h3>
            <button className="edit-button">Edit</button>
          </div>
          <div className="info-card-content">
            <div className="info-item">
              <label>Name</label>
              <span>{user?.firstName || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{user?.email || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDietaryPreferences = () => (
    <div className="settings-content">
      <div className="settings-header">
        <h2>Dietary Preferences</h2>
        <p>Help us personalize your recipe recommendations</p>
        {saving && <div className="saving-indicator">💾 Saving...</div>}
        {error && (
          <div className="error-message">
            {error} <button onClick={clearError} className="error-dismiss">×</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="preferences-loading">
          <div className="loading-spinner"></div>
          <p>Loading your preferences...</p>
        </div>
      ) : (
        <div className="preferences-sections">
          {/* Dietary Restrictions */}
          <div className="preference-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('dietary_restrictions')}
            >
              <h3>Do you have any dietary restrictions?</h3>
              <span className={`dropdown-arrow ${expandedSections.dietary_restrictions ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.dietary_restrictions && (
              <div className="section-content">
                <p className="section-description">Select all that apply to you</p>
                <div className="preference-list">
                  {dietaryOptions.map(option => (
                    <label key={option.id} className="preference-checkbox-item">
                      <input
                        type="checkbox"
                        checked={preferences.dietary_restrictions.includes(option.id)}
                        onChange={() => togglePreference('dietary_restrictions', option.id)}
                        className="preference-checkbox"
                      />
                      <span className="checkbox-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="preference-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('allergies')}
            >
              <h3>Do you have any allergies?</h3>
              <span className={`dropdown-arrow ${expandedSections.allergies ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.allergies && (
              <div className="section-content">
                <p className="section-description">Select common allergies or add your own</p>
                <div className="preference-list">
                  {allergyOptions.map(option => (
                    <label key={option.id} className="preference-checkbox-item">
                      <input
                        type="checkbox"
                        checked={preferences.allergies.includes(option.id)}
                        onChange={() => togglePreference('allergies', option.id)}
                        className="preference-checkbox"
                      />
                      <span className="checkbox-label">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className="custom-input-section">
                  <label htmlFor="custom-allergies">Other allergies (optional)</label>
                  <textarea
                    id="custom-allergies"
                    value={preferences.custom_allergies}
                    onChange={handleCustomAllergyChange}
                    placeholder="List any other allergies not mentioned above..."
                    className="custom-text-input"
                    rows="2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cuisine Preferences */}
          <div className="preference-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('cuisines')}
            >
              <h3>What cuisines do you enjoy most?</h3>
              <span className={`dropdown-arrow ${expandedSections.cuisines ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.cuisines && (
              <div className="section-content">
                <p className="section-description">Choose your favorite types of cuisine</p>
                <div className="preference-list">
                  {cuisineOptions.map(option => (
                    <label key={option.id} className="preference-checkbox-item">
                      <input
                        type="checkbox"
                        checked={preferences.preferred_cuisines.includes(option.id)}
                        onChange={() => togglePreference('preferred_cuisines', option.id)}
                        className="preference-checkbox"
                      />
                      <span className="checkbox-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cooking Time */}
          <div className="preference-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('cooking_time')}
            >
              <h3>How much time do you usually have to cook?</h3>
              <span className={`dropdown-arrow ${expandedSections.cooking_time ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.cooking_time && (
              <div className="section-content">
                <p className="section-description">Choose your typical cooking time</p>
                <div className="preference-list">
                  {cookingTimeOptions.map(option => (
                    <label key={option.id} className="preference-radio-item">
                      <input
                        type="radio"
                        name="cooking_time_preference"
                        value={option.id}
                        checked={preferences.cooking_time_preference === option.id}
                        onChange={() => updatePreference('cooking_time_preference', option.id)}
                        className="preference-radio"
                      />
                      <span className="radio-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div className="homepage">
      <AppNavBar />

      {/* Profile Settings Content */}
      <div className="profile-page" style={{paddingTop: '100px', minHeight: '100vh', background: '#f8fafc'}}>
        <div className="profile-container">
          <div className="profile-header">
            <h1>Account Settings</h1>
            <p>Manage your account and personalize your Fridgy experience</p>
          </div>
          
          <div className="profile-layout">
            {/* Left Sidebar (30%) */}
            <div className="profile-sidebar">
              <div className="sidebar-content">
                <nav className="sidebar-nav">
                  <div 
                    className={`nav-item ${activeSection === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveSection('account')}
                  >
                    <span className="nav-icon">○</span>
                    <span>Account Info</span>
                  </div>
                  <div 
                    className={`nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveSection('preferences')}
                  >
                    <span className="nav-icon">◐</span>
                    <span>Dietary Preferences</span>
                  </div>
                </nav>
              </div>
            </div>

            {/* Right Main Content (70%) */}
            <div className="profile-main">
              {activeSection === 'account' && renderAccountInfo()}
              {activeSection === 'preferences' && renderDietaryPreferences()}
            </div>
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default ProfilePage; 