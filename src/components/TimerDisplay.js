import React from 'react';
import './TimerDisplay.css';

/**
 * TimerDisplay - Minimal pill-style countdown timer with name
 *
 * Features:
 * - Named timer display (e.g., "Beef 18:04")
 * - Compact pill badge design
 * - Visual states: active (green), paused (gray), complete (pulsing)
 * - Tap to pause/resume/dismiss
 */
const TimerDisplay = ({
  name,
  displayTime,
  isRunning,
  isPaused,
  isComplete,
  onPause,
  onResume,
  onDismiss
}) => {
  const handleClick = () => {
    if (isComplete) {
      onDismiss?.();
    } else if (isPaused) {
      onResume?.();
    } else if (isRunning) {
      onPause?.();
    }
  };

  const getStatusText = () => {
    if (isComplete) return 'Done!';
    if (isPaused) return 'Paused';
    return null; // Hide "tap to pause" for cleaner look
  };

  const containerClass = [
    'timer-display__container',
    isComplete && 'timer-display__container--complete',
    isPaused && 'timer-display__container--paused'
  ].filter(Boolean).join(' ');

  const statusText = getStatusText();

  return (
    <div className={containerClass} onClick={handleClick}>
      {/* Timer icon */}
      <svg className="timer-display__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 9v4l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>

      {/* Timer name */}
      {name && <span className="timer-display__name">{name}</span>}

      {/* Time or complete checkmark */}
      {isComplete ? (
        <span className="timer-display__complete-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      ) : (
        <span className="timer-display__time">{displayTime}</span>
      )}

      {/* Status text (only shown when paused or complete) */}
      {statusText && (
        <span className="timer-display__status">{statusText}</span>
      )}
    </div>
  );
};

export default TimerDisplay;
