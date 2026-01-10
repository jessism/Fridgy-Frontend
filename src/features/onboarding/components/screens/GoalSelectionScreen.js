import React, { useEffect } from 'react';
import { trackOnboardingStepViewed } from '../../../../utils/onboardingTracking';
import './ScreenStyles.css';

const GoalSelectionScreen = ({ data, updateData, onNext, onBack }) => {
  useEffect(() => {
    trackOnboardingStepViewed(2);
  }, []);
  const goals = [
    {
      id: 'remember_inventory',
      label: 'Remember what I already have'
    },
    {
      id: 'organize_recipes',
      label: 'Organize my recipes'
    },
    {
      id: 'meal_plans',
      label: 'Create better meal plans'
    },
    {
      id: 'shop_smarter',
      label: 'Shop smarter'
    },
    {
      id: 'reduce_waste',
      label: 'Waste less food'
    }
  ];

  const handleGoalSelect = (goalId) => {
    updateData({ primaryGoal: goalId });
  };

  const handleNext = () => {
    if (data.primaryGoal) {
      onNext();
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          What's your main goal with Trackabite?
        </h1>
        
        <p className="onboarding-screen__subtitle">
          This helps us personalize your experience
        </p>
        
        <div className="goal-selection-list">
          {goals.map((goal) => (
            <button
              key={goal.id}
              className={`goal-selection-card ${data.primaryGoal === goal.id ? 'goal-selection-card--selected' : ''}`}
              onClick={() => handleGoalSelect(goal.id)}
            >
              {goal.label}
            </button>
          ))}
        </div>
        
        <div className="onboarding-screen__actions">
          <button 
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            onClick={handleNext}
            disabled={!data.primaryGoal}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalSelectionScreen;