import React from 'react';
import { Minus, Plus, User } from 'lucide-react';
import './NumberStepper.css';

const MAX_ICONS = 5;

/**
 * -/+ stepper with a row of person icons underneath, as on the app's
 * HouseholdSizeScreen. Shows up to five icons, then "+N".
 */
const NumberStepper = ({ value, onChange, min = 1, max = 10 }) => {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const set = (n) => onChange(clamp(n));

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      set(value + 1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      set(value - 1);
    }
  };

  const icons = Math.min(value, MAX_ICONS);
  const overflow = value - MAX_ICONS;

  return (
    <div className="ob-stepper">
      <div
        className="ob-stepper__row"
        role="spinbutton"
        tabIndex={0}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label="Household size"
        onKeyDown={onKeyDown}
      >
        <button
          type="button"
          className="ob-stepper__btn"
          onClick={() => set(value - 1)}
          disabled={value <= min}
          aria-label="Decrease"
        >
          <Minus size={24} strokeWidth={2.5} />
        </button>

        <span className="ob-stepper__value">{value}</span>

        <button
          type="button"
          className="ob-stepper__btn"
          onClick={() => set(value + 1)}
          disabled={value >= max}
          aria-label="Increase"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="ob-stepper__people" aria-hidden="true">
        {Array.from({ length: icons }, (_, i) => (
          <User key={i} size={24} strokeWidth={2} />
        ))}
        {overflow > 0 && (
          <span className="ob-stepper__overflow">+{overflow}</span>
        )}
      </div>
    </div>
  );
};

export default NumberStepper;
