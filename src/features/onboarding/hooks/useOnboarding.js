import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { safeJSONStringify } from '../../../utils/jsonSanitizer';

const ONBOARDING_STORAGE_KEY = 'fridgy_onboarding_data';
const ONBOARDING_STEP_KEY = 'fridgy_onboarding_step';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useOnboarding = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    primaryGoal: '',
    householdSize: 1,
    weeklyBudget: null,
    budgetCurrency: 'USD',
    dietaryRestrictions: [],
    allergies: [],
    customAllergies: '',
    preferredCuisines: [],
    cookingTimePreference: '',
    notificationPreferences: {
      mealReminders: false,
      expirationAlerts: true,
      weeklyReports: false
    },
    showFeatureTour: true,
    accountData: {
      firstName: '',
      email: '',
      password: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 13;

  useEffect(() => {
    // Always start fresh - clear any existing onboarding data
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    
    // Ensure we start from step 1 with fresh data
    setCurrentStep(1);
    setOnboardingData({
      primaryGoal: '',
      householdSize: 1,
      weeklyBudget: null,
      budgetCurrency: 'USD',
      dietaryRestrictions: [],
      allergies: [],
      customAllergies: '',
      preferredCuisines: [],
      cookingTimePreference: '',
      notificationPreferences: {
        mealReminders: false,
        expirationAlerts: true,
        weeklyReports: false
      },
      showFeatureTour: true,
      accountData: {
        firstName: '',
        email: '',
        password: ''
      }
    });
  }, []);

  const saveToLocalStorage = useCallback((data, step) => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, safeJSONStringify(data));
      localStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
    } catch (e) {
      console.error('Failed to save onboarding data:', e);
    }
  }, []);

  const updateData = useCallback((updates) => {
    setOnboardingData(prev => {
      const newData = { ...prev, ...updates };
      saveToLocalStorage(newData, currentStep);
      return newData;
    });
  }, [currentStep, saveToLocalStorage]);

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveToLocalStorage(onboardingData, nextStep);
    }
  }, [currentStep, totalSteps, onboardingData, saveToLocalStorage]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveToLocalStorage(onboardingData, prevStep);
    }
  }, [currentStep, onboardingData, saveToLocalStorage]);

  const skipStep = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/onboarding/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: safeJSONStringify({
          step: currentStep,
          data: onboardingData
        })
      });

      if (!response.ok) {
        console.error('Failed to save onboarding progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      const { accountData, ...preferences } = onboardingData;
      
      const user = await signUp(accountData);
      
      if (user) {
        const token = localStorage.getItem('fridgy_token');
        
        const dietaryData = {
          dietary_restrictions: preferences.dietaryRestrictions,
          allergies: preferences.allergies,
          custom_allergies: preferences.customAllergies,
          preferred_cuisines: preferences.preferredCuisines,
          cooking_time_preference: preferences.cookingTimePreference,
          cuisine_cooking_time: {
            cuisines: preferences.preferredCuisines,
            cookingTime: preferences.cookingTimePreference
          },
          onboarding_source: 'onboarding_flow'
        };

        await fetch(`${API_BASE_URL}/user-preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: safeJSONStringify(dietaryData)
        });

        const onboardingResponse = await fetch(`${API_BASE_URL}/onboarding/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: safeJSONStringify({
            primary_goal: preferences.primaryGoal,
            household_size: preferences.householdSize,
            weekly_budget: preferences.weeklyBudget,
            budget_currency: preferences.budgetCurrency,
            notification_preferences: preferences.notificationPreferences,
            onboarding_completed: true,
            onboarding_version: '1.0'
          })
        });

        if (!onboardingResponse.ok) {
          console.error('Failed to save onboarding data, but account was created');
        }

        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        localStorage.removeItem(ONBOARDING_STEP_KEY);
        
        navigate('/home');
      }
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const exitOnboarding = () => {
    const confirmExit = window.confirm(
      'Are you sure you want to exit? Your progress will be saved.'
    );
    
    if (confirmExit) {
      saveProgress();
      navigate('/');
    }
  };

  const clearOnboardingData = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setOnboardingData({
      primaryGoal: '',
      householdSize: 1,
      weeklyBudget: null,
      budgetCurrency: 'USD',
      dietaryRestrictions: [],
      allergies: [],
      customAllergies: '',
      preferredCuisines: [],
      cookingTimePreference: '',
      notificationPreferences: {
        mealReminders: false,
        expirationAlerts: true,
        weeklyReports: false
      },
      showFeatureTour: true,
      accountData: {
        firstName: '',
        email: '',
        password: ''
      }
    });
    setCurrentStep(1);
  };

  // Debug function to jump to specific steps
  const jumpToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      saveToLocalStorage(onboardingData, step);
    }
  }, [totalSteps, onboardingData, saveToLocalStorage]);

  return {
    currentStep,
    totalSteps,
    onboardingData,
    loading,
    error,
    updateData,
    goToNextStep,
    goToPreviousStep,
    skipStep,
    saveProgress,
    completeOnboarding,
    exitOnboarding,
    clearOnboardingData,
    setError,
    jumpToStep
  };
};

export default useOnboarding;