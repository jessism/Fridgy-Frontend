import React, { useState } from 'react';
import './ScreenStyles.css';

const AccountCreationScreen = ({ data, updateData, onComplete, onBack, loading, error, setError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Check if payment was completed
  const paymentCompleted = localStorage.getItem('fridgy_payment_completed') === 'true' || data?.paymentCompleted === true;

  const handleInputChange = (field, value) => {
    updateData({
      accountData: {
        ...data.accountData,
        [field]: value
      }
    });
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    const { firstName, email, password } = data.accountData;

    if (!firstName || firstName.trim().length < 2) {
      errors.firstName = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onComplete();
    }
  };

  return (
    <div className="onboarding-screen onboarding-screen--account">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          {paymentCompleted ? 'Complete your account' : 'Create your account'}
        </h1>

        <p className="onboarding-screen__subtitle">
          {paymentCompleted
            ? "Your trial is active! Just create your account to start using Fridgy."
            : "You're one step away from your personalized experience!"}
        </p>
        
        <form onSubmit={handleSubmit} className="account-form">
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#c00',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label className="input-group__label" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className={`input-group__input ${validationErrors.firstName ? 'input-group__input--error' : ''}`}
              placeholder="Enter your first name"
              value={data.accountData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={loading}
            />
            {validationErrors.firstName && (
              <span style={{ color: '#c00', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.firstName}
              </span>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-group__label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={`input-group__input ${validationErrors.email ? 'input-group__input--error' : ''}`}
              placeholder="Enter your email"
              value={data.accountData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
            />
            {validationErrors.email && (
              <span style={{ color: '#c00', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.email}
              </span>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-group__label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`input-group__input ${validationErrors.password ? 'input-group__input--error' : ''}`}
                placeholder="Create a password"
                value={data.accountData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  // Eye open - password visible
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  // Eye closed - password hidden
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span style={{ color: '#c00', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.password}
              </span>
            )}
            <p className="input-group__helper">
              At least 8 characters
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginTop: '24px',
            marginBottom: '32px'
          }}>
            <input
              type="checkbox"
              id="terms"
              className="terms-checkbox"
              style={{ marginTop: '2px' }}
              defaultChecked
            />
            <label htmlFor="terms" style={{ fontSize: '12px', color: '#999', lineHeight: '1.4' }}>
              I agree to the Terms of Service and Privacy Policy. I also agree to receive product updates and marketing communications.
            </label>
          </div>
          
          <div className="onboarding-screen__actions">
            <button 
              type="submit"
              className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : "Let's go"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountCreationScreen;