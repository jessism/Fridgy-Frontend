import { useState, useEffect, useCallback } from 'react';

const FONT_PREFERENCE_KEY = 'fridgy_font_preference';
const DEFAULT_FONT = 'dm-sans';

// Available fonts configuration
const FONT_OPTIONS = [
  { id: 'dm-sans', name: 'DM Sans', description: 'Modern & Clean' },
  { id: 'sf-pro', name: 'SF Pro', description: 'Apple System' },
  { id: 'raleway', name: 'Raleway', description: 'Elegant & Thin' },
  { id: 'lato', name: 'Lato', description: 'Friendly & Warm' }
];

const useFontPreference = () => {
  const [fontPreference, setFontPreference] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem(FONT_PREFERENCE_KEY);
    // Validate saved preference
    const isValidFont = saved && FONT_OPTIONS.some(font => font.id === saved);
    return isValidFont ? saved : DEFAULT_FONT;
  });

  // Apply font class to root element
  const applyFontClass = useCallback((font) => {
    const root = document.documentElement;

    // Remove all font classes
    FONT_OPTIONS.forEach(option => {
      root.classList.remove(`font-${option.id}`);
    });

    // Add the selected font class
    root.classList.add(`font-${font}`);
  }, []);

  // Cycle through fonts
  const cycleFont = useCallback(() => {
    const currentIndex = FONT_OPTIONS.findIndex(font => font.id === fontPreference);
    const nextIndex = (currentIndex + 1) % FONT_OPTIONS.length;
    const newFont = FONT_OPTIONS[nextIndex].id;

    setFontPreference(newFont);
    localStorage.setItem(FONT_PREFERENCE_KEY, newFont);
    applyFontClass(newFont);
  }, [fontPreference, applyFontClass]);

  // Set a specific font
  const setFont = useCallback((font) => {
    setFontPreference(font);
    localStorage.setItem(FONT_PREFERENCE_KEY, font);
    applyFontClass(font);
  }, [applyFontClass]);

  // Apply font on mount and when preference changes
  useEffect(() => {
    applyFontClass(fontPreference);
  }, [fontPreference, applyFontClass]);

  // Get current font info
  const getCurrentFontInfo = () => {
    return FONT_OPTIONS.find(font => font.id === fontPreference) || FONT_OPTIONS[0];
  };

  // Get human-readable font name
  const getFontDisplayName = () => {
    const fontInfo = getCurrentFontInfo();
    return fontInfo.name;
  };

  return {
    fontPreference,
    cycleFont,
    setFont,
    getFontDisplayName,
    getCurrentFontInfo,
    availableFonts: FONT_OPTIONS,
    // Backward compatibility
    toggleFont: cycleFont,
    isDMSans: fontPreference === 'dm-sans',
    isSFPro: fontPreference === 'sf-pro',
    isRaleway: fontPreference === 'raleway',
    isLato: fontPreference === 'lato'
  };
};

export default useFontPreference;