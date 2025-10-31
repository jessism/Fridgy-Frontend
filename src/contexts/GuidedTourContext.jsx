import React, { createContext, useContext, useEffect } from 'react';
import useGuidedTour from '../hooks/useGuidedTour';

const GuidedTourContext = createContext(null);

/**
 * GuidedTourProvider - Makes guided tour state available throughout the app
 */
export const GuidedTourProvider = ({ children }) => {
  const guidedTour = useGuidedTour();

  // Check if this is first-time user and start tour
  useEffect(() => {
    const checkFirstTimeUser = () => {
      const hasSeenApp = localStorage.getItem('trackabite_has_seen_app');
      const tourData = localStorage.getItem('trackabite_guided_tour');

      // If already seen app OR tour exists, don't start
      if (hasSeenApp || tourData) {
        console.log('[GuidedTour] Not first-time user, skipping auto-start');
        return;
      }

      // This is the VERY FIRST TIME user has opened the app after signup
      console.log('[GuidedTour] First-time user detected, starting welcome tour');

      // Mark that user has now seen the app
      localStorage.setItem('trackabite_has_seen_app', 'true');

      // Start tour with welcome screen
      setTimeout(() => {
        guidedTour.startTour(); // Starts at WELCOME_SCREEN
      }, 2000);
    };

    checkFirstTimeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // NOTE: Removed auto-advance polling - it was advancing too early
  // Now the camera component will advance the step when user clicks "Add Items to Inventory"

  return (
    <GuidedTourContext.Provider value={guidedTour}>
      {children}
    </GuidedTourContext.Provider>
  );
};

/**
 * Hook to access guided tour from any component
 */
export const useGuidedTourContext = () => {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useGuidedTourContext must be used within GuidedTourProvider');
  }
  return context;
};

export default GuidedTourContext;
