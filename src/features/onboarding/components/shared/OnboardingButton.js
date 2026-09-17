import React from 'react';
import './OnboardingButton.css';

/**
 * Ported from the app's OnboardingButton.tsx: pill shape, 24px padding,
 * 56px min height, full width. `primary` is the lime accent with its glow,
 * not the site's green.
 */
const OnboardingButton = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}) => (
  <button
    type={type}
    className={`ob-btn ob-btn--${variant} ${className}`.trim()}
    onClick={onClick}
    disabled={disabled || loading}
  >
    {loading ? (
      <span className="ob-btn__spinner" aria-label="Loading" />
    ) : (
      children
    )}
  </button>
);

export default OnboardingButton;
