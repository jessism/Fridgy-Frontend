import React, { createContext, useContext, useEffect } from 'react';
import useGuidedTour from '../hooks/useGuidedTour';

const GuidedTourContext = createContext(null);

/**
 * GuidedTourProvider - Makes guided tour state available throughout the app
 */
export const GuidedTourProvider = ({ children }) => {
  const guidedTour = useGuidedTour();

  // Check if this is first launch and start tour
  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasToken = !!localStorage.getItem('fridgy_token');
      const tourData = localStorage.getItem('trackabite_guided_tour');

      // Don't start if tour is already completed or in progress
      if (!hasToken || tourData) {
        console.log('[GuidedTour] Tour already exists or no token, skipping auto-start');
        return;
      }

      // Check if user has any imported recipes in the database
      try {
        const token = localStorage.getItem('fridgy_token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/saved-recipes?filter=imported&limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const hasRecipes = data.recipes && data.recipes.length > 0;

          if (hasRecipes) {
            console.log('[GuidedTour] User already has recipes, NOT starting tour');
            localStorage.setItem('has_imported_recipe', 'true');
            return;
          }
        }
      } catch (error) {
        console.error('[GuidedTour] Error checking recipes:', error);
        // If error checking recipes, don't auto-start tour
        return;
      }

      // Start tour only if user is authenticated and has NO recipes
      console.log('[GuidedTour] First-time user detected (no recipes), starting tour');
      setTimeout(() => {
        guidedTour.startTour();
      }, 2000); // Wait 2 seconds after app loads
    };

    checkFirstLaunch();
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
