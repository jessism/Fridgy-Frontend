import React, { useEffect } from 'react';
import { trackOnboardingStepViewed } from '../../../../utils/onboardingTracking';
import './ScreenStyles.css';

const GoalSelectionScreen = ({ data, updateData, onNext, onBack }) => {
  useEffect(() => {
    trackOnboardingStepViewed(2);
  }, []);
  const goals = [
    {
      id: 'save_money',
      label: 'Save money'
    },
    {
      id: 'reduce_waste',
      label: 'Reduce waste'
    },
    {
      id: 'eat_healthy',
      label: 'Eat healthier'
    },
    {
      id: 'save_time',
      label: 'Save time'
    },
    {
      id: 'try_recipes',
      label: 'Try new recipes'
    },
    {
      id: 'organize',
      label: 'Get organized'
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