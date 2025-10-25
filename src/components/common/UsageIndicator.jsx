/**
 * UsageIndicator Component
 * Displays current usage vs limit with a progress bar
 */

import React from 'react';
import './UsageIndicator.css';

export function UsageIndicator({ current, limit, feature, showUpgrade }) {
  if (limit === null || limit === Infinity) {
    // Premium user - unlimited
    return (
      <div className="usage-indicator usage-indicator--unlimited">
        <span className="usage-indicator__text">Unlimited</span>
      </div>
    );
  }

  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  return (
    <div className={`usage-indicator ${isAtLimit ? 'usage-indicator--danger' : isNearLimit ? 'usage-indicator--warning' : ''}`}>
      <div className="usage-indicator__header">
        <span className="usage-indicator__label">
          {feature?.replace(/_/g, ' ') || 'Usage'}
        </span>
        <span className="usage-indicator__count">
          {current} / {limit}
        </span>
      </div>

      <div className="usage-indicator__progress-container">
        <div
          className="usage-indicator__progress-bar"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>

      {isAtLimit && showUpgrade && (
        <button className="usage-indicator__upgrade-btn" onClick={showUpgrade}>
          Upgrade for Unlimited
        </button>
      )}
    </div>
  );
}
