import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';

// Tokens + primitives are imported here so that every screen picks them up
// simply by rendering the layout.
import '../../styles/onboarding-theme.css';
import '../../styles/onboarding-primitives.css';
import './OnboardingLayout.css';

/**
 * The shell every onboarding screen sits in: centred 480px column, a header
 * with an optional back chevron / progress bar / close button, and a flex
 * content area that lets `.ob-footer` pin buttons to the bottom.
 *
 * @param {{index:number,total:number}|null} progress - from getProgress(step)
 */
const OnboardingLayout = ({
  children,
  showBack = false,
  onBack,
  showClose = false,
  onClose,
  progress = null,
  className = '',
}) => (
  <div className="ob-root">
    <div className={`ob-shell ${className}`.trim()}>
      <header className="ob-header">
        {showBack ? (
          <button
            type="button"
            className="ob-header__btn"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft size={28} strokeWidth={2.25} />
          </button>
        ) : (
          <span className="ob-header__spacer" aria-hidden="true" />
        )}

        <div className="ob-header__progress">
          {progress && (
            <ProgressIndicator index={progress.index} total={progress.total} />
          )}
        </div>

        {showClose ? (
          <button
            type="button"
            className="ob-header__btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={26} strokeWidth={2.25} />
          </button>
        ) : (
          <span className="ob-header__spacer" aria-hidden="true" />
        )}
      </header>

      <div className="ob-content ob-fade-in">{children}</div>
    </div>
  </div>
);

export default OnboardingLayout;
