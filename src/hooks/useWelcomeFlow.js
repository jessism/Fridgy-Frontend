import { useState, useEffect, useCallback } from 'react';
import {
  getWelcomeFlowState,
  saveWelcomeFlowState,
  markWelcomeFlowCompleted,
  markWelcomeFlowSkipped,
  isIOS,
  trackWelcomeFlowEvent
} from '../utils/welcomeFlowHelpers';

const TOTAL_STEPS = 5;

const STEPS = {
  WELCOME: 0,
  TOUR: 1,
  SHORTCUT: 2,
  IMPORT: 3,
  COMPLETION: 4
};

const useWelcomeFlow = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({
    // Step 1: Welcome
    welcome: {
      viewed: false
    },
    // Step 2: Tour
    tour: {
      currentSlide: 0,
      slidesViewed: [0],
      completed: false
    },
    // Step 3: Shortcut (iOS only)
    shortcut: {
      completed: false,
      skipped: false,
      isIOS: isIOS()
    },
    // Step 4: Import Tutorial (Interactive)
    import: {
      clickedImportNav: false,
      clickedImportButton: false,
      recipeImported: false,
      viewedRecipe: false,
      importUrl: 'https://www.instagram.com/p/DGioQ5qOWij/'
    },
    // Step 5: Completion
    completion: {
      viewed: false
    }
  });

  // Load saved state on mount
  useEffect(() => {
    const savedState = getWelcomeFlowState();
    if (savedState && !savedState.completed) {
      setCurrentStep(savedState.currentStep || 0);
      setStepData(savedState.stepData || stepData);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (isActive) {
      saveWelcomeFlowState({
        currentStep,
        stepData,
        isActive,
        completed: false
      });
    }
  }, [currentStep, stepData, isActive]);

  /**
   * Start the welcome flow
   */
  const startWelcomeFlow = useCallback(() => {
    console.log('[WelcomeFlow] Starting welcome flow');
    setIsActive(true);
    setCurrentStep(0);
    trackWelcomeFlowEvent('welcome_flow_started');
  }, []);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      const nextStepIndex = currentStep + 1;

      // Skip shortcut step if not iOS
      if (nextStepIndex === STEPS.SHORTCUT && !isIOS()) {
        console.log('[WelcomeFlow] Skipping shortcut step (not iOS)');
        setCurrentStep(STEPS.IMPORT);
        trackWelcomeFlowEvent('step_skipped', { step: 'shortcut', reason: 'not_ios' });
      } else {
        setCurrentStep(nextStepIndex);
        trackWelcomeFlowEvent('step_completed', { step: currentStep });
      }
    } else {
      completeWelcomeFlow();
    }
  }, [currentStep]);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      trackWelcomeFlowEvent('step_back', { step: currentStep });
    }
  }, [currentStep]);

  /**
   * Jump to specific step
   */
  const goToStep = useCallback((step) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
      trackWelcomeFlowEvent('step_jump', { from: currentStep, to: step });
    }
  }, [currentStep]);

  /**
   * Update step data
   */
  const updateStepData = useCallback((stepName, updates) => {
    setStepData(prev => ({
      ...prev,
      [stepName]: {
        ...prev[stepName],
        ...updates
      }
    }));
  }, []);

  /**
   * Complete the welcome flow
   */
  const completeWelcomeFlow = useCallback(() => {
    console.log('[WelcomeFlow] Completing welcome flow');
    markWelcomeFlowCompleted();
    setIsActive(false);
    trackWelcomeFlowEvent('welcome_flow_completed', {
      total_steps: TOTAL_STEPS,
      skipped_steps: []
    });
  }, []);

  /**
   * Skip the welcome flow
   */
  const skipWelcomeFlow = useCallback(() => {
    console.log('[WelcomeFlow] Skipping welcome flow');
    markWelcomeFlowSkipped();
    setIsActive(false);
    trackWelcomeFlowEvent('welcome_flow_skipped', { at_step: currentStep });
  }, [currentStep]);

  /**
   * Validation helpers for interactive steps
   */
  const validateImportStep = useCallback((substep, value = true) => {
    updateStepData('import', { [substep]: value });
    trackWelcomeFlowEvent('import_substep_completed', { substep });
  }, [updateStepData]);

  /**
   * Check if current step is complete and can proceed
   */
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return stepData.welcome.viewed;

      case STEPS.TOUR:
        return stepData.tour.completed;

      case STEPS.SHORTCUT:
        return stepData.shortcut.completed || stepData.shortcut.skipped;

      case STEPS.IMPORT:
        return (
          stepData.import.clickedImportNav &&
          stepData.import.clickedImportButton &&
          stepData.import.recipeImported &&
          stepData.import.viewedRecipe
        );

      case STEPS.COMPLETION:
        return stepData.completion.viewed;

      default:
        return false;
    }
  }, [currentStep, stepData]);

  /**
   * Get progress percentage
   */
  const getProgress = useCallback(() => {
    return ((currentStep + 1) / TOTAL_STEPS) * 100;
  }, [currentStep]);

  return {
    // State
    isActive,
    currentStep,
    totalSteps: TOTAL_STEPS,
    stepData,
    STEPS,

    // Actions
    startWelcomeFlow,
    nextStep,
    previousStep,
    goToStep,
    updateStepData,
    completeWelcomeFlow,
    skipWelcomeFlow,

    // Validation
    validateImportStep,
    canProceed,

    // Helpers
    getProgress,
    isIOS: isIOS()
  };
};

export default useWelcomeFlow;
