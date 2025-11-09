import React from 'react';
import './DesignVariantToggle.css';

const DesignVariantToggle = ({ variant, onVariantChange }) => {
  const isModern = variant === 'modern';

  const handleToggle = () => {
    onVariantChange(isModern ? 'classic' : 'modern');
  };

  return (
    <div className="design-variant-toggle">
      <span className="design-variant-toggle__label">Design:</span>
      <div className="design-variant-toggle__container">
        <span className={`design-variant-toggle__option ${!isModern ? 'active' : ''}`}>
          Classic
        </span>
        <button
          className="design-variant-toggle__switch"
          onClick={handleToggle}
          aria-label="Toggle design variant"
        >
          <span
            className={`design-variant-toggle__slider ${isModern ? 'modern-active' : ''}`}
          />
        </button>
        <span className={`design-variant-toggle__option ${isModern ? 'active' : ''}`}>
          Modern
        </span>
      </div>
    </div>
  );
};

export default DesignVariantToggle;