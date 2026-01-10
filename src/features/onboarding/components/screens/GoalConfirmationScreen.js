import React, { useEffect } from 'react';
import { trackOnboardingStepViewed } from '../../../../utils/onboardingTracking';
import './ScreenStyles.css';

const goalMessages = {
  remember_inventory: {
    message: "Trackabite keeps track of what's in your fridge and pantry, so you always know what you already have — no more guessing or duplicate buys."
  },
  organize_recipes: {
    message: "Trackabite lets you save, organize, and edit all your recipes in one place — easy to find whenever you need them."
  },
  meal_plans: {
    message: "Trackabite helps you plan meals around what you already have, so your week feels more organized with less effort."
  },
  shop_smarter: {
    message: "Trackabite builds smarter grocery lists based on what you need — so shopping is faster and more intentional."
  },
  reduce_waste: {
    message: "Trackabite reminds you before food goes bad and helps you use it in time — so less food (and money) goes to waste."
  }
};

const GoalConfirmationScreen = ({ data, onNext, onBack }) => {
  useEffect(() => {
    trackOnboardingStepViewed(3);
  }, []);

  const goalData = goalMessages[data.primaryGoal] || goalMessages.remember_inventory;

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h1 className="onboarding-screen__title" style={{
          fontSize: '1.75rem',
          fontWeight: '600',
          marginBottom: '24px',
          color: '#1f2937'
        }}>
          You're in the right place
        </h1>

        <p className="onboarding-screen__subtitle" style={{
          fontSize: '1.05rem',
          lineHeight: '1.7',
          color: '#6b7280',
          maxWidth: '320px',
          margin: '0 auto'
        }}>
          {goalData.message}
        </p>

        <div className="onboarding-screen__actions" style={{ marginTop: '48px' }}>
          <button
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalConfirmationScreen;
