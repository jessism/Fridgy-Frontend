import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * GuidedTooltip - Small contextual tooltip that appears above UI elements
 * Non-blocking, dismissible, guides users through the app
 */
const GuidedTooltip = ({
  targetSelector,
  message,
  position = 'bottom',
  onDismiss,
  onAction,
  actionLabel = 'Got it',
  showAction = true,
  arrow = true,
  highlight = false, // Add subtle highlight to target
  offset = 12
}) => {
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef(null);

  // Debug: Log immediately when function is called
  console.log('[GuidedTooltip] 🎯 COMPONENT FUNCTION CALLED for:', targetSelector);

  // Debug: Log when component renders
  useEffect(() => {
    console.log('[GuidedTooltip] ✅ Component RENDERED with:', {
      targetSelector,
      message: message.substring(0, 30) + '...',
      position,
      hasTarget: !!document.querySelector(targetSelector)
    });
  }, [targetSelector, message, position]);

  useEffect(() => {
    const updatePosition = () => {
      const target = document.querySelector(targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        calculatePosition(rect);

        // Add highlight class if enabled
        if (highlight) {
          target.classList.add('guided-tour__highlight');
        }
      } else {
        console.warn('[GuidedTooltip] Target not found:', targetSelector);
      }
    };

    // Try immediately
    updatePosition();

    // Also try after a short delay (in case element is rendered async)
    const retryTimer = setTimeout(updatePosition, 100);

    // Update on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(retryTimer);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);

      // Cleanup highlight
      const target = document.querySelector(targetSelector);
      if (target) {
        target.classList.remove('guided-tour__highlight');
      }
    };
  }, [targetSelector, highlight, offset]);

  const calculatePosition = (rect) => {
    let style = {};
    const tooltipHeight = 100; // Approximate tooltip height

    switch (position) {
      case 'centered-above-modal':
        // Center horizontally on screen, position above the modal
        style = {
          position: 'fixed',
          bottom: `${window.innerHeight - rect.top + offset}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '280px'
        };
        break;

      case 'top':
        // Position ABOVE the target element
        style = {
          position: 'fixed',
          bottom: `${window.innerHeight - rect.top + offset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
          maxWidth: '280px'
        };
        break;

      case 'bottom':
        style = {
          position: 'fixed',
          top: `${rect.bottom + offset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
          maxWidth: '280px'
        };
        break;

      case 'left':
        style = {
          position: 'fixed',
          top: `${rect.top + rect.height / 2}px`,
          right: `${window.innerWidth - rect.left + offset}px`,
          transform: 'translateY(-50%)',
          maxWidth: '280px'
        };
        break;

      case 'right':
        style = {
          position: 'fixed',
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + offset}px`,
          transform: 'translateY(-50%)',
          maxWidth: '280px'
        };
        break;

      default:
        style = {
          position: 'fixed',
          top: `${rect.bottom + offset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
          maxWidth: '280px'
        };
    }

    setTooltipStyle(style);
  };

  // Show tooltip even if target not found yet (with default positioning)
  // This prevents the tooltip from disappearing if element hasn't rendered
  const hasTarget = targetRect !== null;

  // Fallback position if target not found
  const finalStyle = hasTarget ? tooltipStyle : {
    position: 'fixed',
    top: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: '280px'
  };

  // Use React Portal to render at document root
  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      className={`guided-tooltip guided-tooltip--${position}`}
      style={finalStyle}
    >
      {/* Arrow */}
      {arrow && hasTarget && position !== 'centered-above-modal' && (
        <div className={`guided-tooltip__arrow guided-tooltip__arrow--${position}`} />
      )}

      {/* Special arrow for centered-above-modal - points to bottom-left */}
      {arrow && hasTarget && position === 'centered-above-modal' && targetRect && (
        <div
          className="guided-tooltip__arrow-custom"
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: `${targetRect.left + targetRect.width / 2 - (window.innerWidth / 2 - 140)}px`,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '8px 8px 0 8px',
            borderColor: 'white transparent transparent transparent',
            filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))'
          }}
        />
      )}

      {/* Content */}
      <div className="guided-tooltip__content">
        <p className="guided-tooltip__message">{message}</p>

        {/* Actions */}
        {showAction && (
          <div className="guided-tooltip__actions">
            {onAction && (
              <button
                className="guided-tooltip__button guided-tooltip__button--primary"
                onClick={onAction}
              >
                {actionLabel}
              </button>
            )}
            {onDismiss && (
              <button
                className="guided-tooltip__button guided-tooltip__button--text"
                onClick={onDismiss}
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>

      {/* Close button (X) */}
      {onDismiss && (
        <button
          className="guided-tooltip__close"
          onClick={onDismiss}
          aria-label="Dismiss tooltip"
        >
          ×
        </button>
      )}
    </div>,
    document.body
  );
};

export default GuidedTooltip;
