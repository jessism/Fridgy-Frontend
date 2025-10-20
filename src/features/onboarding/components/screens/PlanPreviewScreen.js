import React from 'react';
import './ScreenStyles.css';

const PlanPreviewScreen = ({ data, updateData, onNext, onBack }) => {
  const selectReminders = (enabled) => {
    updateData({
      notificationPreferences: {
        enabled: enabled
      }
    });
  };

  // Set default to Yes if no preference is set yet
  const reminderEnabled = data.notificationPreferences?.enabled !== undefined 
    ? data.notificationPreferences.enabled 
    : true;


  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          Almost done!
        </h1>
        
        <p className="onboarding-screen__subtitle">
          Set up your notification preferences
        </p>
        
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            Get expiry reminders?
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            We'll notify you when your food items are about to expire
          </p>
          <div className="checkbox-group">
            <div
              className={`checkbox-item checkbox-item--no-input ${reminderEnabled ? 'checkbox-item--selected' : ''}`}
              onClick={() => selectReminders(true)}
              style={{ padding: reminderEnabled ? '12px 16px' : '12px 16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <label className="checkbox-item__label" style={{ marginBottom: 0 }}>
                  Yes, remind me
                </label>
                {reminderEnabled && (
                  <span style={{ fontSize: '12px', color: '#888', marginTop: '6px', textAlign: 'center', lineHeight: '1.4' }}>
                    We'll set this up after creating your account
                  </span>
                )}
              </div>
            </div>

            <div
              className={`checkbox-item checkbox-item--no-input ${!reminderEnabled ? 'checkbox-item--selected' : ''}`}
              onClick={() => selectReminders(false)}
              style={{ padding: !reminderEnabled ? '12px 16px' : '12px 16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <label className="checkbox-item__label" style={{ marginBottom: 0 }}>
                  No thanks
                </label>
                {!reminderEnabled && (
                  <span style={{ fontSize: '12px', color: '#888', marginTop: '6px', textAlign: 'center', lineHeight: '1.4' }}>
                    You can always enable this later in settings
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="onboarding-screen__actions">
          <button 
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            onClick={onNext}
          >
            Love it! Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanPreviewScreen;