import React from 'react';
import './ScreenStyles.css';

const HouseholdSizeScreen = ({ data, updateData, onNext, onBack }) => {
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

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          How many people are in your household?
        </h1>

        <p className="onboarding-screen__subtitle">
          This helps us suggest the right portions
        </p>

        <div className="input-group">
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

export default HouseholdSizeScreen;
