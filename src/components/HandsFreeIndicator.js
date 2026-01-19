import React from 'react';
import './HandsFreeIndicator.css';

/**
 * HandsFreeIndicator - Visual feedback for hands-free cooking mode
 *
 * Shows:
 * - Toggle button (mic icon)
 * - Listening/speaking states
 * - Recognized command feedback
 * - Hint text for available commands
 */
const HandsFreeIndicator = ({
  isEnabled,
  isListening,
  isSpeaking,
  lastCommand,
  isSpeechRecognitionSupported,
  onToggle,
  error
}) => {
  // Determine the current state for visual styling
  const getStateClass = () => {
    if (!isEnabled) return '';
    if (isSpeaking) return 'hands-free-indicator--speaking';
    if (isListening) return 'hands-free-indicator--listening';
    return 'hands-free-indicator--enabled';
  };

  // Get status text
  const getStatusText = () => {
    if (error) return error;
    if (!isEnabled) return 'Tap to enable hands-free';
    if (isSpeaking) return 'Reading step...';
    if (lastCommand) return `✓ "${lastCommand}"`;
    // Always show "Listening..." when enabled (even during brief restart gaps)
    return 'Listening...';
  };

  // Get hint text for commands
  const getHintText = () => {
    if (!isEnabled || isSpeaking || error) return null;
    if (!isSpeechRecognitionSupported) return 'Voice commands not supported in this browser';
    return 'Say "Next", "Previous", or "Repeat"';
  };

  const hintText = getHintText();

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`hands-free-indicator__toggle ${getStateClass()}`}
        onClick={onToggle}
        aria-label={isEnabled ? 'Disable hands-free mode' : 'Enable hands-free mode'}
        title={isEnabled ? 'Disable hands-free mode' : 'Enable hands-free mode'}
      >
        {isSpeaking ? (
          // Speaker icon when TTS is active
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hands-free-indicator__icon"
          >
            <path
              d="M11 5L6 9H2v6h4l5 4V5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.54 8.46a5 5 0 0 1 0 7.07"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hands-free-indicator__sound-wave"
            />
            <path
              d="M19.07 4.93a10 10 0 0 1 0 14.14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hands-free-indicator__sound-wave hands-free-indicator__sound-wave--outer"
            />
          </svg>
        ) : (
          // Mic icon for listening state
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hands-free-indicator__icon"
          >
            <path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 10v2a7 7 0 0 1-14 0v-2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="19"
              x2="12"
              y2="23"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="8"
              y1="23"
              x2="16"
              y2="23"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Pulse ring animation for active states */}
        {isEnabled && (isListening || isSpeaking) && (
          <span className="hands-free-indicator__pulse-ring" />
        )}
      </button>

      {/* Bottom hint bar - shows when hands-free is enabled */}
      {isEnabled && (
        <div className={`hands-free-indicator__hint-bar ${error ? 'hands-free-indicator__hint-bar--error' : ''}`}>
          <div className="hands-free-indicator__status">
            {!isSpeaking && !error && (
              <span className="hands-free-indicator__listening-dot" />
            )}
            <span className="hands-free-indicator__status-text">
              {getStatusText()}
            </span>
          </div>
          {hintText && (
            <div className="hands-free-indicator__hint-text">
              {hintText}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HandsFreeIndicator;
