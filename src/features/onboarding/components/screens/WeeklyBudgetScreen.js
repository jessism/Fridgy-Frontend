import React from 'react';
import { OnboardingLayout, OnboardingButton, BudgetWheel } from '../shared';
import {
  CURRENCY_OPTIONS,
  CURRENCY_SYMBOLS,
  BUDGET_DEFAULT,
} from '../../constants/onboardingConstants';
import './WeeklyBudgetScreen.css';

const WeeklyBudgetScreen = ({ data, updateData, onNext, onBack, progress }) => {
  const budget = data.weeklyBudget ?? BUDGET_DEFAULT;
  const symbol = CURRENCY_SYMBOLS[data.budgetCurrency] || '$';
  const perPerson = Math.round(budget / Math.max(1, data.householdSize));

  return (
    <OnboardingLayout showBack onBack={onBack} progress={progress}>
      <div className="ob-header-block">
        <h1 className="ob-h1">What's your weekly grocery budget?</h1>
        <p className="ob-sub">
          This helps us suggest recipes and meal plans that fit your budget
        </p>
      </div>

      <div className="ob-budget">
        <div className="ob-budget__currencies" role="group" aria-label="Currency">
          {CURRENCY_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={data.budgetCurrency === id}
              className={`ob-budget__chip ${
                data.budgetCurrency === id ? 'ob-budget__chip--selected' : ''
              }`.trim()}
              onClick={() => updateData({ budgetCurrency: id })}
            >
              {label}
            </button>
          ))}
        </div>

        <BudgetWheel
          value={budget}
          symbol={symbol}
          onChange={(weeklyBudget) => updateData({ weeklyBudget })}
        />

        {data.householdSize > 1 && (
          <p className="ob-footnote ob-budget__per-person">
            About {symbol}
            {perPerson} per person
          </p>
        )}
      </div>

      <div className="ob-footer">
        <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
      </div>
    </OnboardingLayout>
  );
};

export default WeeklyBudgetScreen;
