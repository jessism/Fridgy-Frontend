import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * RecipeImportStepModal - Single step modal for recipe import
 * Shows one step at a time with navigation
 */
const RecipeImportStepModal = ({
  stepNumber,
  title,
  description,
  icon,
  showPhoneFrame = false,
  frameImage,
  videoSrc,
  buttonText = 'Next',
  onNext,
  onBack,
  onSkip,
  showBackButton = true
}) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__shortcut-card guided-tour__shortcut-card--simple">
        {/* Step Number Badge */}
        <div className="recipe-import-step__badge">
          STEP {stepNumber}
        </div>

        {/* iPhone Frame with Screenshot */}
        {showPhoneFrame && frameImage ? (
          <div className="recipe-import-step__phone-frame">
            {/* iPhone Notch */}
            <div className="recipe-import-step__phone-notch"></div>

            {/* iPhone Screen */}
            <div className="recipe-import-step__phone-screen">
              <img
                src={frameImage}
                alt={title}
                className="recipe-import-step__phone-image"
              />
            </div>
          </div>
        ) : videoSrc ? (
          /* Video (no frame) */
          <div className="recipe-import-step__video-container">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="recipe-import-step__video"
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : icon === 'checkmark' ? (
          /* Modern Checkmark Icon */
          <div className="recipe-import-step__checkmark-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="var(--primary-green, #4fcf61)" />
              <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : typeof icon === 'object' && icon.type === 'img' ? (
          /* Full-width Image (no frame) */
          <div className="recipe-import-step__full-image">
            <img src={icon.src} alt={title} />
          </div>
        ) : typeof icon === 'string' && icon.startsWith('/') ? (
          /* Image Icon (like cooking icon) */
          <div className="recipe-import-step__image-icon">
            <img src={icon} alt={title} />
          </div>
        ) : icon ? (
          /* Icon (for non-phone-frame steps) */
          <div className="recipe-import-step__icon">
            {icon}
          </div>
        ) : null}

        {/* Title */}
        <h2 className="guided-tour__shortcut-simple-title" style={{ marginBottom: '0.25rem', marginTop: '0.25rem' }}>
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="guided-tour__shortcut-simple-description" style={{ marginBottom: '1rem' }}>
            {description}
          </p>
        )}

        {/* Buttons */}
        <div className="guided-tour__shortcut-buttons">
          <button
            className="guided-tour__celebration-button"
            onClick={onNext}
          >
            {buttonText}
          </button>
          {showBackButton && onBack && (
            <button
              className="guided-tour__shortcut-secondary-button"
              onClick={onBack}
            >
              ← Go back to previous step
            </button>
          )}
        </div>

        {/* Skip Text Link */}
        {onSkip && (
          <button
            className="guided-tour__shortcut-text-link"
            onClick={onSkip}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default RecipeImportStepModal;
