/**
 * PremiumBadge Component
 * Visual indicator for premium-only features
 */

import React from 'react';
import './PremiumBadge.css';

export function PremiumBadge({ size = 'medium', showIcon = false, text = 'Pro' }) {
  return (
    <span className={`premium-badge premium-badge--${size}`}>
      {showIcon && <span className="premium-badge__icon">👑</span>}
      <span className="premium-badge__text">{text}</span>
    </span>
  );
}
