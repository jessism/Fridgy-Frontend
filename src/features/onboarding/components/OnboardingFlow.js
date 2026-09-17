import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import useOnboarding from '../hooks/useOnboarding';
import { STEPS, getProgress } from '../constants/onboardingConstants';
import { trackOnboardingStepViewed } from '../../../utils/onboardingTracking';
import { OnboardingVideoPreloader } from './shared';

import WelcomeScreen from './screens/WelcomeScreen';
import GoalSelectionScreen from './screens/GoalSelectionScreen';
import GoalConfirmationScreen from './screens/GoalConfirmationScreen';
import HouseholdSizeScreen from './screens/HouseholdSizeScreen';
import WeeklyBudgetScreen from './screens/WeeklyBudgetScreen';
import DietaryRestrictionsScreen from './screens/DietaryRestrictionsScreen';
import AllergiesScreen from './screens/AllergiesScreen';
import CookingTimePreferenceScreen from './screens/CookingTimePreferenceScreen';
import ReassuranceScreen from './screens/ReassuranceScreen';
import HowItHelpsScreen from './screens/HowItHelpsScreen';
import FeatureScreen from './screens/FeatureScreen';
import PushNotificationsScreen from './screens/PushNotificationsScreen';
import ReadyRoutineScreen from './screens/ReadyRoutineScreen';
import PaywallScreen from './screens/PaywallScreen';
import PaymentScreen from './screens/PaymentScreen';
import AccountCreationScreen from './screens/AccountCreationScreen';

import './OnboardingFlow.css';

const OnboardingFlow = () => {
  const {
    currentStep,
    onboardingData,
    loading,
    error,
    updateData,
    goToNextStep,
    goToPreviousStep,
    completeOnboarding,
    setError,
    jumpToStep,
  } = useOnboarding();

  // Someone who arrives already signed in has no business in the signup
  // funnel. Decided once, as soon as auth resolves: the flow signs the user
  // in itself on its last step, and that must not bounce them mid-completion.
  const { user, loading: authLoading } = useAuth();
  const signedInOnArrival = useRef(null);
  if (signedInOnArrival.current === null && !authLoading) {
    signedInOnArrival.current = Boolean(user);
  }

  // Tracked once, here. Screens used to each fire their own with a hardcoded
  // number, which is how the reported step numbers drifted from the flow.
  useEffect(() => {
    trackOnboardingStepViewed(currentStep);
  }, [currentStep]);

  // Every question screen takes the same shape.
  const stepProps = {
    data: onboardingData,
    updateData,
    onNext: goToNextStep,
    onBack: goToPreviousStep,
    progress: getProgress(currentStep),
  };

  const renderScreen = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return <WelcomeScreen onNext={goToNextStep} />;
      case STEPS.GOAL:
        return <GoalSelectionScreen {...stepProps} />;
      case STEPS.GOAL_CONFIRM:
        return <GoalConfirmationScreen {...stepProps} jumpToStep={jumpToStep} />;
      case STEPS.HOUSEHOLD:
        return <HouseholdSizeScreen {...stepProps} />;
      case STEPS.BUDGET:
        return <WeeklyBudgetScreen {...stepProps} />;
      case STEPS.DIETARY:
        return <DietaryRestrictionsScreen {...stepProps} />;
      case STEPS.ALLERGIES:
        return <AllergiesScreen {...stepProps} />;
      case STEPS.COOKING_TIME:
        return <CookingTimePreferenceScreen {...stepProps} />;
      case STEPS.REASSURANCE:
        return <ReassuranceScreen {...stepProps} />;
      case STEPS.HOW_IT_HELPS:
        return <HowItHelpsScreen {...stepProps} />;
      case STEPS.FEATURE_INVENTORY:
        return <FeatureScreen {...stepProps} featureId="inventory" />;
      case STEPS.FEATURE_RECIPES:
        return <FeatureScreen {...stepProps} featureId="recipes" />;
      case STEPS.FEATURE_MEAL_PLANNING:
        return <FeatureScreen {...stepProps} featureId="meal-planning" />;
      case STEPS.FEATURE_SHOPPING:
        return <FeatureScreen {...stepProps} featureId="shopping" />;
      case STEPS.PUSH_NOTIFICATIONS:
        return <PushNotificationsScreen {...stepProps} />;
      case STEPS.READY_ROUTINE:
        return <ReadyRoutineScreen {...stepProps} />;
      case STEPS.PAYWALL:
        return <PaywallScreen jumpToStep={jumpToStep} />;
      case STEPS.PAYMENT:
        return (
          <PaymentScreen
            updateData={updateData}
            jumpToStep={jumpToStep}
            // Back out of the card form to the paywall. The paywall's own X
            // is the deliberate free-tier exit; an X on a card form reads as
            // "cancel this".
            onBack={() => jumpToStep(STEPS.PAYWALL)}
          />
        );
      case STEPS.CREATE_ACCOUNT:
        return (
          <AccountCreationScreen
            data={onboardingData}
            updateData={updateData}
            onComplete={completeOnboarding}
            // Never back into step 18: re-entering a live Stripe intent is
            // how duplicate subscriptions get created.
            onBack={() => jumpToStep(STEPS.PAYWALL)}
            loading={loading}
            error={error}
            setError={setError}
          />
        );
      default:
        return null;
    }
  };

  if (signedInOnArrival.current) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="onboarding-flow">
      {/* Warm the 1-3.4MB feature clips before steps 11-14 need them. */}
      <OnboardingVideoPreloader active={currentStep >= STEPS.REASSURANCE} />
      <div key={currentStep} className="onboarding-flow__screen-container">
        {renderScreen()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
