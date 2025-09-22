import React from 'react';
import './FontToggle.css';

const FontToggle = ({ fontPreference, toggleFont, getFontDisplayName }) => {
  const isSFMono = fontPreference === 'sf-mono';

  return (
    <div className="font-toggle">
      <span className="font-toggle__label">Font:</span>
      <div className="font-toggle__container">
        <span className={`font-toggle__option ${!isSFMono ? 'active' : ''}`}>
          DM Sans
        </span>
        <button
          className="font-toggle__switch"
          onClick={toggleFont}
          aria-label="Toggle font"
        >
          <span
            className={`font-toggle__slider ${isSFMono ? 'sf-mono-active' : ''}`}
          />
        </button>
        <span className={`font-toggle__option ${isSFMono ? 'active' : ''}`}>
          SF Mono
        </span>
      </div>
    </div>
  );
};

export default FontToggle;