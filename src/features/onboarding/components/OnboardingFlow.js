import React from 'react';
import useOnboarding from '../hooks/useOnboarding';
import OnboardingProgress from './OnboardingProgress';
import WelcomeScreen from './screens/WelcomeScreen';
import GoalSelectionScreen from './screens/GoalSelectionScreen';
import HouseholdSizeScreen from './screens/HouseholdSizeScreen';
import WeeklyBudgetScreen from './screens/WeeklyBudgetScreen';
import DietaryRestrictionsScreen from './screens/DietaryRestrictionsScreen';
import AllergiesScreen from './screens/AllergiesScreen';
import CuisinePreferenceScreenV2 from './screens/CuisinePreferenceScreenV2';
import CookingTimePreferenceScreen from './screens/CookingTimePreferenceScreen';
import FeatureTourScreen from './screens/FeatureTourScreen';
import PremiumUpsellScreen from './screens/PremiumUpsellScreen';
import PremiumUpsellScreenWhite from './screens/PremiumUpsellScreenWhite';
import PremiumUpsellScreenGreen from './screens/PremiumUpsellScreenGreen';
import AccountCreationScreen from './screens/AccountCreationScreen';
import './OnboardingFlow.css';

const OnboardingFlow = () => {
  const {
    currentStep,
    totalSteps,
    onboardingData,
    loading,
    error,
    updateData,
    goToNextStep,
    goToPreviousStep,
    skipStep,
    completeOnboarding,
    exitOnboarding,
    setError,
    jumpToStep
  } = useOnboarding();

  const renderScreen = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeScreen
            onNext={goToNextStep}
            onExit={exitOnboarding}
          />
        );
      case 2:
        return (
          <GoalSelectionScreen
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <HouseholdSizeScreen
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <WeeklyBudgetScreen
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={skipStep}
          />
        );
      case 5:
        return (
          <DietaryRestrictionsScreen
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 6:
        return (
          <AllergiesScreen
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 7:
        return (
          <CuisinePreferenceScreenV2
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 8:
        return (
          <CookingTimePreferenceScreen
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 9:
        return (
          <FeatureTourScreen
            data={onboardingData}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={skipStep}
          />
        );
      case 10:
        return (
          <PremiumUpsellScreenWhite
            data={onboardingData}
            updateData={updateData}
            onNext={() => {}} // Not used anymore
            onBack={goToPreviousStep}
            onSkip={() => jumpToStep(13)} // Skip directly to account creation
            jumpToStep={jumpToStep}
          />
        );
      // Alternative paywall designs (kept for future reference)
      case 11:
        return (
          <PremiumUpsellScreen
            data={onboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={skipStep}
            jumpToStep={jumpToStep}
          />
        );
      case 12:
        return (
          <PremiumUpsellScreenGreen
            data={onboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={skipStep}
            jumpToStep={jumpToStep}
          />
        );
      case 13:
        return (
          <AccountCreationScreen
            data={onboardingData}
            updateData={updateData}
            onComplete={completeOnboarding}
            onBack={goToPreviousStep}
            loading={loading}
            error={error}
            setError={setError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-flow">
      {currentStep > 1 && currentStep < 10 && (
        <OnboardingProgress
          currentStep={currentStep - 1}
          totalSteps={8}
          onBack={goToPreviousStep}
          showBack={currentStep > 2}
        />
      )}
      <div className="onboarding-flow__content">
        <div className="onboarding-flow__screen-container">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;