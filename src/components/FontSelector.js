import React from 'react';
import './FontSelector.css';

const FontSelector = ({ fontPreference, setFont, availableFonts, getCurrentFontInfo }) => {
  const currentFont = getCurrentFontInfo();

  return (
    <div className="font-selector">
      <span className="font-selector__label">Font:</span>
      <div className="font-selector__options">
        {availableFonts.map(font => (
          <button
            key={font.id}
            className={`font-selector__option ${fontPreference === font.id ? 'active' : ''}`}
            onClick={() => setFont(font.id)}
            aria-label={`Select ${font.name} font`}
            title={font.description}
          >
            <span className="font-selector__option-name">{font.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FontSelector;