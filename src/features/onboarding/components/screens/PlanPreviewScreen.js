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
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            Get reminders?
          </h3>
          <div className="checkbox-group">
            <div
              className={`checkbox-item checkbox-item--no-input ${reminderEnabled ? 'checkbox-item--selected' : ''}`}
              onClick={() => selectReminders(true)}
            >
              <label className="checkbox-item__label">
                Yes
              </label>
            </div>
            
            <div
              className={`checkbox-item checkbox-item--no-input ${!reminderEnabled ? 'checkbox-item--selected' : ''}`}
              onClick={() => selectReminders(false)}
            >
              <label className="checkbox-item__label">
                No
              </label>
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