import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useHandsFree - Hook for hands-free cooking mode with TTS and Speech Recognition
 *
 * Features:
 * - Text-to-Speech for reading recipe steps aloud
 * - Speech Recognition for voice commands (Next, Previous, Repeat, Timer)
 * - Voice-activated timer control
 * - Browser compatibility detection
 * - Graceful fallbacks for unsupported features
 */
const useHandsFree = ({
  onNext,
  onPrevious,
  onRepeat,
  onTimerSet,
  onTimerPause,
  onTimerResume,
  onTimerCancel,
  isActive = true
}) => {
  // State
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  // Refs for cleanup and state tracking
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const commandTimeoutRef = useRef(null);
  const audioRef = useRef(null); // For Google Cloud TTS audio playback
  const isEnabledRef = useRef(false);
  const isActiveRef = useRef(true);
  const recognitionIdRef = useRef(0); // Track which recognition instance is current

  // Feature detection
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const srSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Command aliases mapping
  const COMMANDS = {
    next: ['next', 'next step', 'continue', 'go on', 'forward'],
    previous: ['previous', 'previous step', 'go back', 'back', 'backward'],
    repeat: ['repeat', 'repeat that', 'say again', 'read again', 'again'],
    pauseTimer: ['pause timer', 'pause the timer'],
    resumeTimer: ['resume timer', 'resume the timer', 'continue timer'],
    cancelTimer: ['cancel timer', 'stop timer', 'clear timer']
  };

  // Regex patterns for named timers (all formats supported, multi-word names)
  // Pattern 1: "Set pork roast timer for 20 minutes" → name first (multi-word)
  const TIMER_PATTERN_NAMED_1 = /set\s+(.+?)\s+timer\s+(?:for\s+)?(\d+)\s*(second|minute|sec|min)s?/i;
  // Pattern 2: "Set timer for chicken thighs 10 minutes" → name after "for" (multi-word)
  const TIMER_PATTERN_NAMED_2 = /set\s+(?:a\s+)?timer\s+(?:for\s+)?(.+?)\s+(\d+)\s*(second|minute|sec|min)s?/i;
  // Pattern 3: "Timer 5 minutes for ground beef" → name at end (multi-word)
  const TIMER_PATTERN_NAMED_3 = /timer\s+(\d+)\s*(second|minute|sec|min)s?\s+(?:for\s+)?(.+)$/i;
  // Fallback: "Set timer for 30 minutes" → unnamed (no name, just duration)
  const TIMER_PATTERN_UNNAMED = /(?:set\s+)?(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(second|minute|sec|min)s?$/i;

  // Patterns for named timer control (multi-word names)
  const PAUSE_NAMED_PATTERN = /pause\s+(?:the\s+)?(.+?)(?:\s+timer)?$/i;
  const RESUME_NAMED_PATTERN = /resume\s+(?:the\s+)?(.+?)(?:\s+timer)?$/i;
  const CANCEL_NAMED_PATTERN = /(?:cancel|stop|clear)\s+(?:the\s+)?(.+?)(?:\s+timer)?$/i;

  /**
   * Helper: Capitalize each word in a name (Title Case)
   */
  const toTitleCase = (str) => {
    return str.trim().split(/\s+/).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  /**
   * Helper: Check if a name is valid (not just articles/filler words)
   */
  const isValidTimerName = (name) => {
    const invalid = ['a', 'the', 'timer', 'my', 'for'];
    const cleaned = name.trim().toLowerCase();
    return cleaned.length > 0 && !invalid.includes(cleaned);
  };

  /**
   * Parse transcript to identify command
   * Returns object with command type, optional timer duration, and optional name
   */
  const parseCommand = useCallback((transcript) => {
    const lower = transcript.toLowerCase().trim();

    // Check for named timer set commands first
    // Pattern 1: "Set pork roast timer for 20 minutes"
    let match = lower.match(TIMER_PATTERN_NAMED_1);
    if (match && isValidTimerName(match[1])) {
      const name = match[1].trim();
      const value = parseInt(match[2], 10);
      const unit = match[3].toLowerCase();
      return {
        command: 'setTimer',
        name: toTitleCase(name),
        duration: { value, unit: unit.startsWith('min') ? 'minutes' : 'seconds' }
      };
    }

    // Pattern 2: "Set timer for chicken thighs 10 minutes"
    match = lower.match(TIMER_PATTERN_NAMED_2);
    if (match && isValidTimerName(match[1])) {
      const name = match[1].trim();
      const value = parseInt(match[2], 10);
      const unit = match[3].toLowerCase();
      return {
        command: 'setTimer',
        name: toTitleCase(name),
        duration: { value, unit: unit.startsWith('min') ? 'minutes' : 'seconds' }
      };
    }

    // Pattern 3: "Timer 5 minutes for ground beef"
    match = lower.match(TIMER_PATTERN_NAMED_3);
    if (match && isValidTimerName(match[3])) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const name = match[3].trim();
      return {
        command: 'setTimer',
        name: toTitleCase(name),
        duration: { value, unit: unit.startsWith('min') ? 'minutes' : 'seconds' }
      };
    }

    // Fallback: Unnamed timer "Set timer for 30 minutes"
    match = lower.match(TIMER_PATTERN_UNNAMED);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      return {
        command: 'setTimer',
        name: null, // No name - will default to "Timer"
        duration: { value, unit: unit.startsWith('min') ? 'minutes' : 'seconds' }
      };
    }

    // Check for named pause command: "Pause chicken thighs" or "Pause pork roast timer"
    match = lower.match(PAUSE_NAMED_PATTERN);
    if (match && isValidTimerName(match[1])) {
      return {
        command: 'pauseTimer',
        name: toTitleCase(match[1].trim())
      };
    }

    // Check for named resume command: "Resume chicken thighs"
    match = lower.match(RESUME_NAMED_PATTERN);
    if (match && isValidTimerName(match[1])) {
      return {
        command: 'resumeTimer',
        name: toTitleCase(match[1].trim())
      };
    }

    // Check for named cancel command: "Cancel pork roast" or "Stop ground beef timer"
    match = lower.match(CANCEL_NAMED_PATTERN);
    if (match && isValidTimerName(match[1])) {
      return {
        command: 'cancelTimer',
        name: toTitleCase(match[1].trim())
      };
    }

    // Check for other commands (next, previous, repeat, generic pause/resume/cancel)
    for (const [command, aliases] of Object.entries(COMMANDS)) {
      for (const alias of aliases) {
        if (lower.includes(alias)) {
          return { command };
        }
      }
    }
    return null;
  }, []);

  /**
   * Execute recognized command
   * @param {Object} parsed - Parsed command object with command type, optional duration, and optional name
   */
  const executeCommand = useCallback((parsed) => {
    const { command, duration, name } = parsed;

    // Clear previous command display after delay
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }

    // Build display command for UI feedback
    let displayCommand = command;
    if (command === 'setTimer' && duration) {
      displayCommand = name
        ? `${name} ${duration.value} ${duration.unit}`
        : `timer ${duration.value} ${duration.unit}`;
    } else if (name) {
      displayCommand = `${command} ${name}`;
    }
    setLastCommand(displayCommand);

    commandTimeoutRef.current = setTimeout(() => {
      setLastCommand(null);
    }, 2000);

    switch (command) {
      case 'next':
        onNext?.();
        break;
      case 'previous':
        onPrevious?.();
        break;
      case 'repeat':
        onRepeat?.();
        break;
      case 'setTimer':
        onTimerSet?.({ ...duration, name });
        break;
      case 'pauseTimer':
        onTimerPause?.(name);
        break;
      case 'resumeTimer':
        onTimerResume?.(name);
        break;
      case 'cancelTimer':
        onTimerCancel?.(name);
        break;
      default:
        break;
    }
  }, [onNext, onPrevious, onRepeat, onTimerSet, onTimerPause, onTimerResume, onTimerCancel]);

  /**
   * Initialize Speech Recognition
   * @param {number} instanceId - Unique ID for this recognition instance
   */
  const createRecognition = useCallback((instanceId) => {
    if (!srSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[HandsFree] Speech recognition started (instance:', instanceId, ')');
      setIsListening(true);
      setError(null);
    };

    // Additional debug events
    recognition.onaudiostart = () => {
      console.log('[HandsFree] Audio capturing started');
    };

    recognition.onsoundstart = () => {
      console.log('[HandsFree] Sound detected');
    };

    recognition.onspeechstart = () => {
      console.log('[HandsFree] Speech detected!');
    };

    recognition.onspeechend = () => {
      console.log('[HandsFree] Speech ended');
    };

    recognition.onnomatch = () => {
      console.log('[HandsFree] No match found');
    };

    recognition.onend = () => {
      console.log('[HandsFree] Speech recognition ended (instance:', instanceId, ')');

      // Only handle if this is still the current instance
      if (recognitionIdRef.current !== instanceId) {
        console.log('[HandsFree] Ignoring onend from old instance');
        return;
      }

      setIsListening(false);

      // Auto-restart if still enabled and active (using refs for current values)
      if (isEnabledRef.current && isActiveRef.current && recognitionRef.current === recognition) {
        // Add small delay to prevent rapid restart loop
        setTimeout(() => {
          if (isEnabledRef.current && isActiveRef.current && recognitionRef.current === recognition) {
            try {
              console.log('[HandsFree] Auto-restarting recognition');
              recognition.start();
            } catch (err) {
              console.log('[HandsFree] Could not restart recognition:', err.message);
            }
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      console.log('[HandsFree] Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable microphone permissions.');
        setIsEnabled(false);
      } else if (event.error === 'no-speech') {
        // Normal - no speech detected, will auto-restart via onend
      } else if (event.error === 'aborted') {
        // User or system aborted, don't show error
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const transcript = last[0].transcript;
        console.log('[HandsFree] Heard:', transcript);

        const parsed = parseCommand(transcript);
        if (parsed) {
          console.log('[HandsFree] Command recognized:', parsed.command, parsed.duration || '');
          executeCommand(parsed);
        }
      }
    };

    return recognition;
  }, [srSupported, parseCommand, executeCommand]);

  /**
   * Start speech recognition
   */
  const startListening = useCallback(() => {
    if (!srSupported) {
      console.log('[HandsFree] Speech recognition not supported');
      return;
    }

    // Stop any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        // Ignore
      }
    }

    // Create new instance with incremented ID
    const newId = ++recognitionIdRef.current;
    console.log('[HandsFree] Creating new recognition instance:', newId);
    const recognition = createRecognition(newId);
    recognitionRef.current = recognition;

    try {
      recognition?.start();
    } catch (err) {
      console.log('[HandsFree] Could not start recognition:', err.message);
    }
  }, [srSupported, createRecognition]);

  /**
   * Stop speech recognition
   */
  const stopListening = useCallback(() => {
    // Increment ID to invalidate any pending restarts from old instances
    recognitionIdRef.current++;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort(); // Use abort to prevent onend restart
      } catch (err) {
        console.log('[HandsFree] Could not stop recognition:', err.message);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  /**
   * Fallback speak using Web Speech API (used when Google Cloud TTS unavailable)
   */
  const fallbackSpeak = useCallback((text) => {
    if (!ttsSupported || !text) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/°/g, ' degrees ')
      .replace(/\n/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Samantha') || v.name.includes('Google') ||
      v.name.includes('Microsoft') || v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isEnabledRef.current && isActiveRef.current) {
        setTimeout(() => startListening(), 300);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [ttsSupported, startListening]);

  /**
   * Speak text using TTS - tries Google Cloud TTS first, falls back to Web Speech API
   */
  const speak = useCallback(async (text) => {
    if (!text) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Clean text for speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/°/g, ' degrees ')
      .replace(/\n/g, '. ')
      .trim();

    setIsSpeaking(true);

    try {
      // Try Google Cloud TTS first
      const { synthesizeSpeech } = await import('../services/ttsService');
      const audioUrl = await synthesizeSpeech(cleanText);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        console.log('[HandsFree] Google TTS ended');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (isEnabledRef.current && isActiveRef.current) {
          setTimeout(() => {
            console.log('[HandsFree] Restarting recognition after TTS');
            startListening();
          }, 300);
        }
      };

      audio.onerror = () => {
        console.warn('[HandsFree] Google TTS audio error, using fallback');
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        fallbackSpeak(cleanText);
      };

      await audio.play();
      console.log('[HandsFree] Playing Google Cloud TTS audio');

    } catch (err) {
      console.warn('[HandsFree] Google Cloud TTS failed, using Web Speech fallback:', err.message);
      fallbackSpeak(cleanText);
    }
  }, [startListening, fallbackSpeak]);

  /**
   * Stop any ongoing speech (both Google Cloud TTS and Web Speech API)
   */
  const stopSpeaking = useCallback(() => {
    if (ttsSupported) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, [ttsSupported]);

  /**
   * Toggle hands-free mode
   */
  const toggleHandsFree = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      console.log('[HandsFree] Toggled:', newState);

      if (!newState) {
        // Turning off - stop everything
        stopListening();
        stopSpeaking();
        setLastCommand(null);
        setError(null);
      }

      return newState;
    });
  }, [stopListening, stopSpeaking]);

  /**
   * Enable hands-free mode
   */
  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  /**
   * Disable hands-free mode
   */
  const disable = useCallback(() => {
    setIsEnabled(false);
    stopListening();
    stopSpeaking();
    setLastCommand(null);
    setError(null);
  }, [stopListening, stopSpeaking]);

  // Keep refs in sync with state (for use in closures)
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Start/stop listening based on enabled state
  useEffect(() => {
    if (isEnabled && isActive && srSupported) {
      console.log('[HandsFree] Starting recognition (enabled + active)');
      startListening();
    } else {
      console.log('[HandsFree] Stopping recognition');
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [isEnabled, isActive, srSupported, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
    };
  }, [stopListening, stopSpeaking]);

  // Load voices (needed for some browsers)
  useEffect(() => {
    if (ttsSupported) {
      // Voices may load asynchronously
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [ttsSupported]);

  return {
    // Feature support
    isSupported: ttsSupported, // TTS is the minimum requirement
    isSpeechRecognitionSupported: srSupported,

    // State
    isEnabled,
    isSpeaking,
    isListening,
    lastCommand,
    error,

    // Actions
    toggleHandsFree,
    enable,
    disable,
    speak,
    stopSpeaking,

    // For debugging
    ttsSupported,
    srSupported
  };
};

export default useHandsFree;
