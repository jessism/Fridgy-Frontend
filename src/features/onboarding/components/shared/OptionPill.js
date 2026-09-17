import React from 'react';
import { Check } from 'lucide-react';
import './OptionPill.css';

/** Flex-wrap container. The app uses margins; gap is the web equivalent. */
export const PillWrap = ({ children }) => (
  <div className="ob-pills">{children}</div>
);

/** Multi-select pill: accent fill and a check when selected. */
export const OptionPill = ({ label, selected, onToggle }) => (
  <button
    type="button"
    aria-pressed={selected}
    className={`ob-pill ${selected ? 'ob-pill--selected' : ''}`.trim()}
    onClick={onToggle}
  >
    {selected && <Check size={16} aria-hidden="true" />}
    <span>{label}</span>
  </button>
);

export default OptionPill;
