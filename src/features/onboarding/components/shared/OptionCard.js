import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './OptionCard.css';

/** 2-column grid wrapper. Renders as a radiogroup for keyboard users. */
export const OptionGrid = ({ children, label }) => (
  <div className="ob-grid" role="radiogroup" aria-label={label}>
    {children}
  </div>
);

/**
 * Single-select card: 24px icon over a 14px label, accent fill plus a
 * check badge when selected. Ported from the app's OptionCard.tsx.
 */
export const OptionCard = ({ label, Icon, selected, onSelect }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    className={`ob-card ${selected ? 'ob-card--selected' : ''}`.trim()}
    onClick={onSelect}
  >
    {selected && (
      <CheckCircle2 className="ob-card__check" size={20} aria-hidden="true" />
    )}
    {Icon && <Icon className="ob-card__icon" size={24} aria-hidden="true" />}
    <span className="ob-card__label">{label}</span>
  </button>
);

export default OptionCard;
