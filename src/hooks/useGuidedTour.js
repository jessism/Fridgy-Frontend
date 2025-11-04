import { useState, useEffect, useCallback } from 'react';
import { isIOS } from '../utils/welcomeFlowHelpers';

const STORAGE_KEY = 'trackabite_guided_tour';

/**
 * Guided Tour Steps - Sequential contextual hints
 */
const STEPS = {
  NOT_STARTED: 'not_started',
  WELCOME_SCREEN: 'welcome_screen',         // Step 0: Welcome prompt

  // 1. Log Groceries Flow
  GROCERIES_INTRO: 'groceries_intro',       // "Let's start by logging your first item"
  ADD_GROCERIES: 'add_groceries',           // Step 1: Tooltip on navbar "+"
  ADD_ITEMS_MENU: 'add_items_menu',         // Step 2: Tooltip on "Add items" in menu
  ITEMS_ADDED: 'items_added',               // After items scanned
  GO_TO_MEALS: 'go_to_meals',               // Celebration: Items added successfully
  VIEWING_INVENTORY: 'viewing_inventory',   // Waiting period to view inventory

  // 2. Personalize Recipe with AI Flow (moved up from #4)
  GENERATE_RECIPES_INTRO: 'generate_recipes_intro',           // "Let's generate personalized recipes" intro
  GENERATE_RECIPES_NAV_TO_MEALS: 'generate_recipes_nav_to_meals', // Tooltip: Navigate to Meals page
  GENERATE_RECIPES_START_BUTTON: 'generate_recipes_start_button',  // Tooltip: Click "Start personalized recipes"
  GENERATE_RECIPES_QUESTIONNAIRE: 'generate_recipes_questionnaire', // Tooltip: Answer questions
  GENERATE_RECIPES_SUCCESS: 'generate_recipes_success',       // Success: Recipes generated!

  // 3. Import Shortcut Flow (moved down from #2)
  SHORTCUT_INTRO: 'shortcut_intro',         // "Let's install your shortcut" intro
  INSTALL_SHORTCUT: 'install_shortcut',     // iOS shortcut installation (Copy Magic Key)
  SHORTCUT_CONFIRMATION: 'shortcut_confirmation',   // "Have you installed your shortcut?"
  SHORTCUT_SUCCESS_BRIDGE: 'shortcut_success_bridge', // "Awesome! Now let's import..."

  // 4. Import IG Recipes Flow (moved down from #3)
  RECIPE_INTRO: 'recipe_intro',             // Intro to recipe import (after shortcut)
  IMPORT_RECIPE_INTRO: 'import_recipe_intro',       // "Let's import your first recipe"
  IMPORT_RECIPE_PREFLIGHT: 'import_recipe_preflight', // Check notifications + shortcut
  IMPORT_RECIPE_STEP_1: 'import_recipe_step_1',     // Step 1: Open Instagram post
  IMPORT_RECIPE_STEP_2: 'import_recipe_step_2',     // Step 2: Tap share icon
  IMPORT_RECIPE_STEP_3: 'import_recipe_step_3',     // Step 3: Scroll down and select
  IMPORT_RECIPE_STEP_4: 'import_recipe_step_4',     // Step 4: Allow Instagram to send items
  IMPORT_RECIPE_STEP_5: 'import_recipe_step_5',     // Step 5: View your recipe
  IMPORT_RECIPE_STEP_6: 'import_recipe_step_6',     // Step 6: Start importing (action)
  IMPORT_RECIPE_SUCCESS: 'import_recipe_success',   // Success modal
  IMPORT_RECIPE: 'import_recipe',           // Legacy: Tooltip on Import button
  PASTE_URL: 'paste_url',                   // Step 5: Tooltip on URL input
  RECIPE_IMPORTED: 'recipe_imported',       // Step 6: Success toast

  PUSH_NOTIFICATION_PROMPT: 'push_notification_prompt', // Push notification setup

  COMPLETED: 'completed'                    // Tour finished
};

const useGuidedTour = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.NOT_STARTED);
  const [isActive, setIsActive] = useState(false);
  const [tourSource, setTourSource] = useState('full'); // 'individual' or 'full'
  const [demoInventoryItems, setDemoInventoryItems] = useState([]); // Virtual inventory for tour

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
          setTourSource(data.tourSource || 'full');
          setDemoInventoryItems(data.demoInventoryItems || []);
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
          tourSource,
          demoInventoryItems,
          lastUpdated: new Date().toISOString()
        }));
      } catch (error) {
        console.error('[GuidedTour] Error saving state:', error);
      }
    }
  }, [currentStep, isActive, tourSource, demoInventoryItems]);

  /**
   * Start the guided tour
   */
  const startTour = useCallback((source = 'full') => {
    console.log(`[GuidedTour] Starting tour with welcome screen (source: ${source})`);
    setCurrentStep(STEPS.WELCOME_SCREEN);
    setIsActive(true);
    setTourSource(source);

    // Immediately save to localStorage
    try {
      localStorage.setItem('trackabite_guided_tour', JSON.stringify({
        currentStep: STEPS.WELCOME_SCREEN,
        isActive: true,
        tourSource: source,
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
  const goToStep = useCallback((step, source = null) => {
    console.log('[GuidedTour] Jumping to step:', step, 'source:', source);
    setCurrentStep(step);
    setIsActive(true);
    if (source) {
      setTourSource(source);
    }
  }, []);

  /**
   * Complete the tour
   */
  const completeTour = useCallback(async () => {
    console.log('[GuidedTour] Tour completed - clearing demo inventory');
    setCurrentStep(STEPS.COMPLETED);
    setIsActive(false);
    setDemoInventoryItems([]); // Clear demo items

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep: STEPS.COMPLETED,
      isActive: false,
      demoInventoryItems: [], // Clear in storage
      completedAt: new Date().toISOString()
    }));

    // Mark welcome tour as completed on backend
    try {
      const token = localStorage.getItem('fridgy_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      await fetch(`${apiUrl}/auth/welcome-tour/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[GuidedTour] Backend marked tour as completed');
    } catch (error) {
      console.error('[GuidedTour] Failed to mark tour complete on backend:', error);
      // Continue anyway - localStorage fallback will work
    }
  }, []);

  /**
   * Dismiss/skip the tour
   */
  const dismissTour = useCallback(async () => {
    console.log('[GuidedTour] Tour dismissed - clearing demo inventory');
    setCurrentStep(STEPS.COMPLETED);
    setIsActive(false);
    setDemoInventoryItems([]); // Clear demo items

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep: STEPS.COMPLETED,
      isActive: false,
      demoInventoryItems: [], // Clear in storage
      dismissed: true,
      dismissedAt: new Date().toISOString()
    }));

    // Mark welcome tour as completed on backend (dismissed counts as completed)
    try {
      const token = localStorage.getItem('fridgy_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      await fetch(`${apiUrl}/auth/welcome-tour/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[GuidedTour] Backend marked tour as completed (dismissed)');
    } catch (error) {
      console.error('[GuidedTour] Failed to mark tour complete on backend:', error);
      // Continue anyway - localStorage fallback will work
    }
  }, []);

  /**
   * Reset the tour (for replay)
   */
  const resetTour = useCallback(() => {
    console.log('[GuidedTour] Tour reset - clearing demo inventory');
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(STEPS.NOT_STARTED);
    setIsActive(false);
    setDemoInventoryItems([]); // Clear demo items
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

  /**
   * Add demo inventory items (for virtual tour inventory)
   */
  const addDemoInventoryItems = useCallback((items) => {
    console.log('[GuidedTour] 🎯 Adding', items.length, 'demo inventory items:', items);
    setDemoInventoryItems(items);
    console.log('[GuidedTour] ✅ Demo inventory state updated');
  }, []);

  /**
   * Clear demo inventory items
   */
  const clearDemoInventoryItems = useCallback(() => {
    console.log('[GuidedTour] Clearing demo inventory items');
    setDemoInventoryItems([]);
  }, []);

  return {
    // State
    currentStep,
    isActive,
    STEPS,
    tourSource,
    demoInventoryItems,

    // Actions
    startTour,
    nextStep,
    goToStep,
    completeTour,
    dismissTour,
    resetTour,
    setTourSource,

    // Helpers
    shouldShowTooltip,
    completeStep,

    // Demo Inventory Management
    addDemoInventoryItems,
    clearDemoInventoryItems,

    // Status checks
    isCompleted: currentStep === STEPS.COMPLETED,
    isFirstStep: currentStep === STEPS.ADD_GROCERIES,
    isIndividualTour: tourSource === 'individual',
    isFullTour: tourSource === 'full'
  };
};

export default useGuidedTour;
