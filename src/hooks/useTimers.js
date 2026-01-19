import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useTimers - Hook for multiple named voice-activated cooking timers
 *
 * Features:
 * - Multiple simultaneous named timers
 * - Countdown with start/pause/resume/remove
 * - Web Audio API alarm sound (no audio files needed)
 * - Haptic vibration fallback for mobile
 * - Find timer by ID or name
 */
const useTimers = ({ onComplete } = {}) => {
  // Array of timer objects
  const [timers, setTimers] = useState([]);

  // Refs
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const nextIdRef = useRef(1);
  const handledCompletionsRef = useRef(new Set()); // Track which timer completions already handled

  /**
   * Play alarm sound using Web Audio API
   */
  const playAlarm = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
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

        oscillator.frequency.value = 880;
        oscillator.type = 'sine';

        const startTime = ctx.currentTime + i * 0.3;
        const endTime = startTime + 0.15;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);
      }

      setTimeout(() => {
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      }, 1000);

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (err) {
      console.warn('[Timers] Could not play alarm:', err);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
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
   * Add a new timer
   * @param {string} name - Timer name (e.g., "Beef", "Veggies") or null for unnamed
   * @param {number} durationMs - Duration in milliseconds
   */
  const addTimer = useCallback((name, durationMs) => {
    const id = nextIdRef.current++;
    const timerName = name || 'Timer';

    const newTimer = {
      id,
      name: timerName,
      timeLeft: durationMs,
      totalDuration: durationMs,
      isRunning: true,
      isPaused: false,
      isComplete: false
    };

    setTimers(prev => [...prev, newTimer]);
    console.log('[Timers] Added:', timerName, durationMs, 'ms');

    return id;
  }, []);

  /**
   * Find timer by ID or name (case-insensitive)
   */
  const findTimer = useCallback((idOrName) => {
    if (typeof idOrName === 'number') {
      return timers.find(t => t.id === idOrName);
    }
    const nameLower = idOrName.toLowerCase();
    return timers.find(t => t.name.toLowerCase() === nameLower);
  }, [timers]);

  /**
   * Pause a specific timer by ID or name
   */
  const pauseTimer = useCallback((idOrName) => {
    setTimers(prev => prev.map(timer => {
      const matches = typeof idOrName === 'number'
        ? timer.id === idOrName
        : timer.name.toLowerCase() === idOrName.toLowerCase();

      if (matches && timer.isRunning && !timer.isPaused) {
        console.log('[Timers] Paused:', timer.name);
        return { ...timer, isPaused: true };
      }
      return timer;
    }));
  }, []);

  /**
   * Resume a specific timer by ID or name
   */
  const resumeTimer = useCallback((idOrName) => {
    setTimers(prev => prev.map(timer => {
      const matches = typeof idOrName === 'number'
        ? timer.id === idOrName
        : timer.name.toLowerCase() === idOrName.toLowerCase();

      if (matches && timer.isRunning && timer.isPaused) {
        console.log('[Timers] Resumed:', timer.name);
        return { ...timer, isPaused: false };
      }
      return timer;
    }));
  }, []);

  /**
   * Remove a timer by ID or name
   */
  const removeTimer = useCallback((idOrName) => {
    setTimers(prev => {
      const timer = prev.find(t =>
        typeof idOrName === 'number'
          ? t.id === idOrName
          : t.name.toLowerCase() === idOrName.toLowerCase()
      );
      if (timer) {
        console.log('[Timers] Removed:', timer.name);
      }
      return prev.filter(t =>
        typeof idOrName === 'number'
          ? t.id !== idOrName
          : t.name.toLowerCase() !== idOrName.toLowerCase()
      );
    });
  }, []);

  /**
   * Dismiss a completed timer (same as remove but for completed timers)
   */
  const dismissTimer = useCallback((idOrName) => {
    removeTimer(idOrName);
  }, [removeTimer]);

  /**
   * Pause all running timers
   */
  const pauseAll = useCallback(() => {
    setTimers(prev => prev.map(timer => {
      if (timer.isRunning && !timer.isPaused) {
        return { ...timer, isPaused: true };
      }
      return timer;
    }));
    console.log('[Timers] Paused all');
  }, []);

  /**
   * Resume all paused timers
   */
  const resumeAll = useCallback(() => {
    setTimers(prev => prev.map(timer => {
      if (timer.isRunning && timer.isPaused) {
        return { ...timer, isPaused: false };
      }
      return timer;
    }));
    console.log('[Timers] Resumed all');
  }, []);

  /**
   * Clear all timers
   */
  const clearAll = useCallback(() => {
    setTimers([]);
    console.log('[Timers] Cleared all');
  }, []);

  // Countdown effect - runs for all active timers
  useEffect(() => {
    const hasActiveTimers = timers.some(t => t.isRunning && !t.isPaused && !t.isComplete);

    if (!hasActiveTimers) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      // PURE state update only - no side effects
      setTimers(prev => prev.map(timer => {
        if (!timer.isRunning || timer.isPaused || timer.isComplete) {
          return timer;
        }

        if (timer.timeLeft <= 100) {
          // Just mark as complete - side effects handled in separate useEffect
          return {
            ...timer,
            timeLeft: 0,
            isRunning: false,
            isComplete: true
          };
        }

        return {
          ...timer,
          timeLeft: timer.timeLeft - 100
        };
      }));
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timers]);

  // Effect to handle timer completions - triggers side effects when timers become complete
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.isComplete && !handledCompletionsRef.current.has(timer.id)) {
        handledCompletionsRef.current.add(timer.id);
        console.log('[Timers] Complete:', timer.name);
        playAlarm();
        onComplete?.(timer.name, timer.id);
      }
    });
  }, [timers, playAlarm, onComplete]);

  // Clean up handled completions when timers are removed
  useEffect(() => {
    const currentIds = new Set(timers.map(t => t.id));
    handledCompletionsRef.current.forEach(id => {
      if (!currentIds.has(id)) {
        handledCompletionsRef.current.delete(id);
      }
    });
  }, [timers]);

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

  // Add displayTime to each timer
  const timersWithDisplay = timers.map(timer => ({
    ...timer,
    displayTime: formatTime(timer.timeLeft),
    progress: timer.totalDuration > 0
      ? ((timer.totalDuration - timer.timeLeft) / timer.totalDuration) * 100
      : 0
  }));

  return {
    // State
    timers: timersWithDisplay,
    hasTimers: timers.length > 0,
    activeCount: timers.filter(t => t.isRunning && !t.isComplete).length,

    // Actions
    addTimer,
    pauseTimer,
    resumeTimer,
    removeTimer,
    dismissTimer,
    pauseAll,
    resumeAll,
    clearAll,

    // Utilities
    findTimer,
    formatTime,
    playAlarm
  };
};

export default useTimers;
