import React, { useEffect } from 'react';
import { trackOnboardingStepViewed } from '../../../../utils/onboardingTracking';
import './ScreenStyles.css';

const WeeklyBudgetScreen = ({ data, updateData, onNext, onBack, onSkip }) => {
  useEffect(() => {
    trackOnboardingStepViewed(4);
  }, []);
  const handleBudgetChange = (e) => {
    const value = parseInt(e.target.value, 10);
    updateData({ weeklyBudget: value });
  };

  const handleCurrencyChange = (e) => {
    updateData({ budgetCurrency: e.target.value });
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          What's your average weekly spend?
        </h1>

        <p className="onboarding-screen__subtitle">
          We'll help you stay within budget with smart suggestions
        </p>

        <div className="input-group">
          <div className="budget-slider">
            <div className="budget-slider__header">
              <span className="budget-slider__label">Weekly spend</span>
              <span className="budget-slider__value">
                ${data.weeklyBudget || 50}
              </span>
            </div>
            <div className="budget-slider__container">
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={data.weeklyBudget || 50}
                onChange={handleBudgetChange}
                className="budget-slider__input"
                style={{
                  background: `linear-gradient(to right, var(--primary-green, #81e053) 0%, var(--primary-green, #81e053) ${((data.weeklyBudget || 50) - 20) / (500 - 20) * 100}%, #e0e0e0 ${((data.weeklyBudget || 50) - 20) / (500 - 20) * 100}%, #e0e0e0 100%)`
                }}
              />
            </div>
            <div className="budget-slider__labels">
              <span>$20</span>
              <span>$500+</span>
            </div>
          </div>
        </div>

        <div className="onboarding-screen__actions">
          <button
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            onClick={onNext}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyBudgetScreen;
