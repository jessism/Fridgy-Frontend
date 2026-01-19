import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CookingModeModal.css';
import { highlightInstructions } from '../../utils/highlightInstructions';
import useHandsFree from '../../hooks/useHandsFree';
import useTimers from '../../hooks/useTimers';
import HandsFreeIndicator from '../HandsFreeIndicator';
import TimerDisplay from '../TimerDisplay';

const CookingModeModal = ({ isOpen, onClose, steps, recipeName, ingredients }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const prevStepRef = useRef(currentStep);

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      prevStepRef.current = 0;
    }
  }, [isOpen]);

  // Wake Lock API - keep screen awake while cooking
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isOpen) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('[CookingMode] Screen wake lock acquired');
        } catch (err) {
          console.log('[CookingMode] Wake Lock not supported or denied:', err.message);
        }
      }
    };

    if (isOpen) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
        console.log('[CookingMode] Screen wake lock released');
      }
    };
  }, [isOpen]);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Get clean step text for TTS (remove markdown, "Step X:" prefix, etc.)
  const getCleanStepText = useCallback((stepIndex) => {
    if (!steps || !steps[stepIndex]) return '';
    const text = steps[stepIndex];
    return text
      .replace(/^Step\s*\d+\s*[:.]\s*/i, '') // Remove "Step X:" prefix
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '')   // Remove markdown italic
      .trim();
  }, [steps]);

  // Ref to store speak function to avoid circular dependency
  const speakRef = useRef(null);

  // Multiple timers hook for voice-activated cooking timers
  const timersHook = useTimers({
    onComplete: (timerName) => {
      // Announce timer completion via TTS with timer name
      if (speakRef.current) {
        speakRef.current(`${timerName} timer complete!`);
      }
    }
  });

  // Refs for timer functions to avoid dependency issues in useCallback
  const timersRef = useRef(timersHook);
  useEffect(() => {
    timersRef.current = timersHook;
  }, [timersHook]);

  // Timer voice command handlers - use refs to avoid recreation
  const handleTimerSet = useCallback(({ value, unit, name }) => {
    const ms = unit === 'minutes' ? value * 60 * 1000 : value * 1000;
    timersRef.current.addTimer(name, ms);
    // Announce timer start with name
    if (speakRef.current) {
      const announcement = name
        ? `${name} timer set for ${value} ${unit}`
        : `Timer set for ${value} ${unit}`;
      speakRef.current(announcement);
    }
    console.log('[CookingMode] Timer set:', name || 'unnamed', value, unit);
  }, []);

  const handleTimerPause = useCallback((name) => {
    if (name) {
      timersRef.current.pauseTimer(name);
      if (speakRef.current) {
        speakRef.current(`${name} timer paused`);
      }
    } else {
      // Pause all if no name specified
      timersRef.current.pauseAll();
      if (speakRef.current) {
        speakRef.current('All timers paused');
      }
    }
  }, []);

  const handleTimerResume = useCallback((name) => {
    if (name) {
      timersRef.current.resumeTimer(name);
      if (speakRef.current) {
        speakRef.current(`${name} timer resumed`);
      }
    } else {
      // Resume all if no name specified
      timersRef.current.resumeAll();
      if (speakRef.current) {
        speakRef.current('All timers resumed');
      }
    }
  }, []);

  const handleTimerCancel = useCallback((name) => {
    if (name) {
      timersRef.current.removeTimer(name);
      if (speakRef.current) {
        speakRef.current(`${name} timer cancelled`);
      }
    } else {
      // Clear all if no name specified
      timersRef.current.clearAll();
      if (speakRef.current) {
        speakRef.current('All timers cancelled');
      }
    }
  }, []);

  // Repeat current step callback for hands-free
  const handleRepeat = useCallback(() => {
    if (speakRef.current && steps && steps[currentStep]) {
      speakRef.current(getCleanStepText(currentStep));
    }
  }, [currentStep, steps, getCleanStepText]);

  // Hands-free mode hook
  const handsFree = useHandsFree({
    onNext: goToNextStep,
    onPrevious: goToPreviousStep,
    onRepeat: handleRepeat,
    onTimerSet: handleTimerSet,
    onTimerPause: handleTimerPause,
    onTimerResume: handleTimerResume,
    onTimerCancel: handleTimerCancel,
    isActive: isOpen
  });

  // Update speakRef when handsFree changes
  useEffect(() => {
    speakRef.current = handsFree.speak;
  }, [handsFree.speak]);

  // Auto-read step when it changes and hands-free is enabled
  useEffect(() => {
    if (!handsFree.isEnabled || !isOpen || !steps) return;

    // Only read if step actually changed (not on initial render)
    if (currentStep !== prevStepRef.current) {
      prevStepRef.current = currentStep;

      // Small delay for smooth transition
      const timer = setTimeout(() => {
        const stepText = getCleanStepText(currentStep);
        if (stepText) {
          handsFree.speak(stepText);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentStep, handsFree.isEnabled, handsFree.speak, isOpen, steps, getCleanStepText]);

  // Read first step when hands-free is enabled
  useEffect(() => {
    if (handsFree.isEnabled && isOpen && steps && steps[currentStep]) {
      // Small delay to let the UI settle
      const timer = setTimeout(() => {
        handsFree.speak(getCleanStepText(currentStep));
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handsFree.isEnabled]); // Only trigger when hands-free is toggled on

  // Stop TTS and timers when modal closes
  useEffect(() => {
    if (!isOpen) {
      handsFree.stopSpeaking();
      handsFree.disable();
      timersHook.clearAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousStep();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNextStep, goToPreviousStep, onClose]);

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe distance of 50px
    if (diff > 50) {
      goToNextStep(); // Swipe left = next
    } else if (diff < -50) {
      goToPreviousStep(); // Swipe right = previous
    }

    setTouchStart(null);
  };

  // Handle completion
  const handleDone = () => {
    onClose();
  };

  if (!isOpen || !steps || steps.length === 0) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div
      className="cooking-mode__overlay"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="cooking-mode__header">
        <button
          className="cooking-mode__close-button"
          onClick={onClose}
          aria-label="Close cooking mode"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="cooking-mode__header-right">
          <div className="cooking-mode__step-indicator">
            Step {currentStep + 1} of {steps.length}
          </div>
          {/* Hands-free toggle button */}
          {handsFree.isSupported && (
            <HandsFreeIndicator
              isEnabled={handsFree.isEnabled}
              isListening={handsFree.isListening}
              isSpeaking={handsFree.isSpeaking}
              lastCommand={handsFree.lastCommand}
              isSpeechRecognitionSupported={handsFree.isSpeechRecognitionSupported}
              onToggle={handsFree.toggleHandsFree}
              error={handsFree.error}
            />
          )}
        </div>
      </div>

      {/* Recipe name (subtle) */}
      <div className="cooking-mode__recipe-name">{recipeName}</div>

      {/* Voice-activated timer displays - positioned below recipe name */}
      {timersHook.hasTimers && (
        <div className="cooking-mode__timers-row">
          {timersHook.timers.map(timer => (
            <TimerDisplay
              key={timer.id}
              name={timer.name}
              displayTime={timer.displayTime}
              isRunning={timer.isRunning}
              isPaused={timer.isPaused}
              isComplete={timer.isComplete}
              onPause={() => timersHook.pauseTimer(timer.id)}
              onResume={() => timersHook.resumeTimer(timer.id)}
              onDismiss={() => timersHook.dismissTimer(timer.id)}
            />
          ))}
        </div>
      )}

      {/* Main step content */}
      <div className="cooking-mode__content">
        <div className="cooking-mode__step-number">
          Step {currentStep + 1}
        </div>
        <div className="cooking-mode__step-text">
          {highlightInstructions(
            // Remove "Step X:" prefix from instruction text since we show it above
            steps[currentStep]?.replace(/^Step\s*\d+\s*[:.]\s*/i, '') || steps[currentStep],
            ingredients
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="cooking-mode__progress">
        {steps.map((_, index) => (
          <button
            key={index}
            className={`cooking-mode__progress-dot ${index === currentStep ? 'cooking-mode__progress-dot--active' : ''}`}
            onClick={() => setCurrentStep(index)}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="cooking-mode__navigation">
        <button
          className={`cooking-mode__nav-button cooking-mode__nav-button--prev ${isFirstStep ? 'cooking-mode__nav-button--disabled' : ''}`}
          onClick={goToPreviousStep}
          disabled={isFirstStep}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </button>

        {isLastStep ? (
          <button
            className="cooking-mode__nav-button cooking-mode__nav-button--done"
            onClick={handleDone}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Done
          </button>
        ) : (
          <button
            className="cooking-mode__nav-button cooking-mode__nav-button--next"
            onClick={goToNextStep}
          >
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Swipe hint (shows briefly on mobile) */}
      <div className="cooking-mode__swipe-hint">
        Swipe to navigate
      </div>
    </div>
  );
};

export default CookingModeModal;
