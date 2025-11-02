import React, { createContext, useContext, useEffect } from 'react';
import useGuidedTour from '../hooks/useGuidedTour';
import { useAuth } from '../features/auth/context/AuthContext';

const GuidedTourContext = createContext(null);

/**
 * GuidedTourProvider - Makes guided tour state available throughout the app
 */
export const GuidedTourProvider = ({ children }) => {
  const guidedTour = useGuidedTour();
  const { user, loading: authLoading } = useAuth();

  // Check if this is first-time user and start tour
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[GuidedTour] Waiting for auth to load...');
      return;
    }

    // No user logged in, skip tour
    if (!user) {
      console.log('[GuidedTour] No user logged in, skipping tour');
      return;
    }

    // Backend is the PRIMARY source of truth
    // If backend says user hasn't seen tour, show it regardless of localStorage
    if (user.hasSeenWelcomeTour !== true) {
      console.log('[GuidedTour] First-time user detected (backend hasSeenWelcomeTour=false), starting welcome tour');

      // Start tour with welcome screen after short delay
      setTimeout(() => {
        guidedTour.startTour(); // Starts at WELCOME_SCREEN
      }, 1000);
    } else {
      console.log('[GuidedTour] Backend says tour already completed (hasSeenWelcomeTour=true), skipping');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Re-run when user or auth loading state changes

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
