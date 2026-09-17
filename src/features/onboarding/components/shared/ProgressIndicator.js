import React from 'react';
import './ProgressIndicator.css';

/**
 * Continuous fill bar — the app replaced dots with this in the Feb 10
 * redesign. `index` is 0-based, so step 2 of the flow reads 1/15.
 */
const ProgressIndicator = ({ index, total }) => {
  const pct = ((index + 1) / total) * 100;
  return (
    <div
      className="ob-progress"
      role="progressbar"
      aria-valuenow={index + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${index + 1} of ${total}`}
    >
      <div className="ob-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
};

export default ProgressIndicator;
