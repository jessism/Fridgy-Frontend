import React from 'react';
import './ScreenStyles.css';

const HouseholdBudgetScreen = ({ data, updateData, onNext, onBack, onSkip }) => {
  const handleHouseholdIncrease = () => {
    if (data.householdSize < 10) {
      updateData({ householdSize: data.householdSize + 1 });
    }
  };

  const handleHouseholdDecrease = () => {
    if (data.householdSize > 1) {
      updateData({ householdSize: data.householdSize - 1 });
    }
  };

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
          Tell us about your household
        </h1>
        
        <p className="onboarding-screen__subtitle">
          This helps us suggest the right portions and budget
        </p>
        
        <div className="input-group">
          <label className="input-group__label">
            How many people are in your household?
          </label>
          <div className="number-selector">
            <button
              type="button"
              className="number-selector__btn"
              onClick={handleHouseholdDecrease}
              disabled={data.householdSize <= 1}
            >
              -
            </button>
            <span className="number-selector__value">{data.householdSize}</span>
            <button
              type="button"
              className="number-selector__btn"
              onClick={handleHouseholdIncrease}
              disabled={data.householdSize >= 10}
            >
              +
            </button>
          </div>
        </div>
        
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
          <p className="input-group__helper">
            We'll help you stay within budget with smart suggestions
          </p>
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

export default HouseholdBudgetScreen;