import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useTimer - Hook for voice-activated cooking timer
 *
 * Features:
 * - Countdown timer with start/pause/resume/stop
 * - Web Audio API alarm sound (no audio files needed)
 * - Haptic vibration fallback for mobile
 * - Proper cleanup on unmount
 */
const useTimer = ({ onComplete } = {}) => {
  // State
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  /**
   * Play alarm sound using Web Audio API
   */
  const playAlarm = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        // Fallback to haptic vibration
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        return;
      }

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      // Create 3 beeps
      for (let i = 0; i < 3; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 880; // High A note
        oscillator.type = 'sine';

        const startTime = ctx.currentTime + i * 0.3;
        const endTime = startTime + 0.15;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);
      }

      // Close audio context after beeps finish
      setTimeout(() => {
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      }, 1000);

      // Also trigger haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (err) {
      console.warn('[Timer] Could not play alarm:', err);
      // Fallback to haptic vibration
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  }, []);

  /**
   * Start the timer with a duration in milliseconds
   */
  const start = useCallback((durationMs) => {
    // Clear any existing timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTimeLeft(durationMs);
    setTotalDuration(durationMs);
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);

    console.log('[Timer] Started:', durationMs, 'ms');
  }, []);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      console.log('[Timer] Paused at:', timeLeft, 'ms');
    }
  }, [isRunning, isPaused, timeLeft]);

  /**
   * Resume the timer
   */
  const resume = useCallback(() => {
    if (isRunning && isPaused) {
      setIsPaused(false);
      console.log('[Timer] Resumed');
    }
  }, [isRunning, isPaused]);

  /**
   * Stop and reset the timer
   */
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeLeft(0);
    setTotalDuration(0);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);

    console.log('[Timer] Stopped');
  }, []);

  /**
   * Dismiss the completed timer
   */
  const dismiss = useCallback(() => {
    setIsComplete(false);
    setIsRunning(false);
    setTimeLeft(0);
    setTotalDuration(0);
    console.log('[Timer] Dismissed');
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          // Timer complete
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          setIsComplete(true);
          playAlarm();
          onComplete?.();
          console.log('[Timer] Complete!');
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, playAlarm, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Format time for display (MM:SS)
   */
  const formatTime = useCallback((ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Get progress percentage (0-100)
   */
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return {
    // State
    timeLeft,
    totalDuration,
    isRunning,
    isPaused,
    isComplete,
    progress,

    // Formatted display
    displayTime: formatTime(timeLeft),

    // Actions
    start,
    pause,
    resume,
    stop,
    dismiss,
    playAlarm
  };
};

export default useTimer;
