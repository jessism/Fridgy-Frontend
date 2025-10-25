import { useState, useEffect, useCallback } from 'react';
import { isIOS } from '../utils/welcomeFlowHelpers';

const STORAGE_KEY = 'trackabite_guided_tour';

/**
 * Guided Tour Steps - Sequential contextual hints
 */
const STEPS = {
  NOT_STARTED: 'not_started',
  WELCOME_SCREEN: 'welcome_screen',         // Step 0: Welcome prompt
  ADD_GROCERIES: 'add_groceries',           // Step 1: Tooltip on navbar "+"
  ADD_ITEMS_MENU: 'add_items_menu',         // Step 2: Tooltip on "Add items" in menu
  ITEMS_ADDED: 'items_added',               // After items scanned
  GO_TO_MEALS: 'go_to_meals',               // Celebration: Items added successfully
  RECIPE_INTRO: 'recipe_intro',             // Part 2: Intro to recipe import
  INSTALL_SHORTCUT: 'install_shortcut',     // Part 2: iOS shortcut installation
  IMPORT_RECIPE: 'import_recipe',           // Step 4: Tooltip on Import button
  PASTE_URL: 'paste_url',                   // Step 5: Tooltip on URL input
  RECIPE_IMPORTED: 'recipe_imported',       // Step 6: Success toast
  COMPLETED: 'completed'                    // Tour finished
};

const useGuidedTour = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.NOT_STARTED);
  const [isActive, setIsActive] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('[useGuidedTour] Loading saved state:', saved);

      if (saved) {
        const data = JSON.parse(saved);
        console.log('[useGuidedTour] Parsed data:', data);

        // If tour is not completed, set the current step
        if (data.currentStep !== STEPS.COMPLETED) {
          console.log('[useGuidedTour] Restoring tour:', data.currentStep, 'isActive:', data.isActive);
          setCurrentStep(data.currentStep || STEPS.NOT_STARTED);
          setIsActive(data.isActive !== false);
        }
      } else {
        console.log('[useGuidedTour] No saved state found');
      }
    } catch (error) {
      console.error('[useGuidedTour] Error loading state:', error);
    }
  }, []);

  // Save progress whenever step changes
  useEffect(() => {
    if (currentStep !== STEPS.NOT_STARTED) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentStep,
          isActive,
          lastUpdated: new Date().toISOString()
        }));
      } catch (error) {
        console.error('[GuidedTour] Error saving state:', error);
      }
    }
  }, [currentStep, isActive]);

  /**
   * Start the guided tour
   */
  const startTour = useCallback(() => {
    console.log('[GuidedTour] Starting tour with welcome screen');
    setCurrentStep(STEPS.WELCOME_SCREEN);
    setIsActive(true);

    // Immediately save to localStorage
    try {
      localStorage.setItem('trackabite_guided_tour', JSON.stringify({
        currentStep: STEPS.WELCOME_SCREEN,
        isActive: true,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('[GuidedTour] Error saving on start:', error);
    }
  }, []);

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    const stepOrder = Object.values(STEPS);
    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentIndex < stepOrder.length - 1) {
      let next = stepOrder[currentIndex + 1];

      // Auto-skip INSTALL_SHORTCUT if not iOS
      if (next === STEPS.INSTALL_SHORTCUT && !isIOS()) {
        console.log('[GuidedTour] Skipping INSTALL_SHORTCUT (not iOS)');
        const nextIndex = currentIndex + 2;
        next = nextIndex < stepOrder.length ? stepOrder[nextIndex] : STEPS.COMPLETED;
      }

      console.log('[GuidedTour] Moving to step:', next);
      setCurrentStep(next);
    }
  }, [currentStep]);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step) => {
    console.log('[GuidedTour] Jumping to step:', step);
    setCurrentStep(step);
  }, []);

  /**
   * Complete the tour
   */
  const completeTour = useCallback(() => {
    console.log('[GuidedTour] Tour completed!');
    setCurrentStep(STEPS.COMPLETED);
    setIsActive(false);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep: STEPS.COMPLETED,
      isActive: false,
      completedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Dismiss/skip the tour
   */
  const dismissTour = useCallback(() => {
    console.log('[GuidedTour] Tour dismissed');
    setCurrentStep(STEPS.COMPLETED);
    setIsActive(false);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep: STEPS.COMPLETED,
      isActive: false,
      dismissed: true,
      dismissedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Reset the tour (for replay)
   */
  const resetTour = useCallback(() => {
    console.log('[GuidedTour] Tour reset');
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(STEPS.NOT_STARTED);
    setIsActive(false);
  }, []);

  /**
   * Check if should show tooltip for specific step
   */
  const shouldShowTooltip = useCallback((step) => {
    const result = isActive && currentStep === step;
    if (result) {
      console.log('[useGuidedTour] shouldShowTooltip TRUE for step:', step);
    }
    return result;
  }, [isActive, currentStep]);

  /**
   * Mark step as completed and move to next
   */
  const completeStep = useCallback((step) => {
    if (currentStep === step) {
      nextStep();
    }
  }, [currentStep, nextStep]);

  return {
    // State
    currentStep,
    isActive,
    STEPS,

    // Actions
    startTour,
    nextStep,
    goToStep,
    completeTour,
    dismissTour,
    resetTour,

    // Helpers
    shouldShowTooltip,
    completeStep,

    // Status checks
    isCompleted: currentStep === STEPS.COMPLETED,
    isFirstStep: currentStep === STEPS.ADD_GROCERIES
  };
};

export default useGuidedTour;
