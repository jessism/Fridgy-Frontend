/**
 * TTS Service - Google Cloud Text-to-Speech API client
 *
 * Provides high-quality, natural-sounding speech synthesis
 * Falls back gracefully if Google Cloud TTS is not configured
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Synthesize speech from text using Google Cloud TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Optional voice name (e.g., 'en-US-Neural2-F')
 * @returns {Promise<string>} Object URL for audio blob
 * @throws {Error} 'USE_FALLBACK' if server wants client to use Web Speech API
 */
export const synthesizeSpeech = async (text, voice = null) => {
  const response = await fetch(`${API_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  // Check if TTS service wants us to use fallback
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      throw new Error('TTS request failed');
    }

    if (error.fallback) {
      throw new Error('USE_FALLBACK');
    }
    throw new Error(error.error || 'TTS failed');
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
};

/**
 * Check if Google Cloud TTS service is available
 * @returns {Promise<{available: boolean, error?: string}>}
 */
export const checkTTSHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/tts/health`);
    if (!response.ok) {
      return { available: false, error: 'Service unavailable' };
    }
    return await response.json();
  } catch (err) {
    return { available: false, error: err.message };
  }
};

/**
 * Get list of available TTS voices
 * @returns {Promise<{voices: Array}>}
 */
export const getAvailableVoices = async () => {
  try {
    const response = await fetch(`${API_URL}/tts/voices`);
    if (!response.ok) {
      return { voices: [] };
    }
    return await response.json();
  } catch {
    return { voices: [] };
  }
};
