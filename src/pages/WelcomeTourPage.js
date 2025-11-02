import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuidedTourContext } from '../contexts/GuidedTourContext';
import { isIOS } from '../utils/welcomeFlowHelpers';
import './WelcomeTourPage.css';

const WelcomeTourPage = () => {
  const navigate = useNavigate();
  const { resetTour, startTour, goToStep, STEPS } = useGuidedTourContext();

  const handleBack = () => {
    navigate('/profile');
  };

  const handleStartFullTour = () => {
    console.log('[WelcomeTour] Starting full tour');
    resetTour();
    localStorage.removeItem('has_imported_recipe');

    setTimeout(() => {
      startTour();
      navigate('/home');
    }, 100);
  };

  const handleLogGroceries = () => {
    console.log('[WelcomeTour] Starting Log Groceries step (individual tour)');
    resetTour();

    setTimeout(() => {
      goToStep(STEPS.GROCERIES_INTRO, 'individual');
      navigate('/home');
    }, 100);
  };

  const handleSetupShortcut = () => {
    console.log('[WelcomeTour] Starting iOS Shortcut setup');
    resetTour();

    setTimeout(() => {
      goToStep(STEPS.SHORTCUT_INTRO);
      navigate('/home');
    }, 100);
  };

  const handleGenerateRecipes = () => {
    console.log('[WelcomeTour] Starting Generate Recipes tour');
    resetTour();

    setTimeout(() => {
      goToStep(STEPS.GENERATE_RECIPES_INTRO, 'individual');
      navigate('/home');
    }, 100);
  };

  const handleImportRecipe = () => {
    console.log('[WelcomeTour] Starting Import Recipe flow');
    resetTour();
    localStorage.removeItem('has_imported_recipe');

    setTimeout(() => {
      goToStep(STEPS.IMPORT_RECIPE_INTRO);
      navigate('/home'); // Stay on home to show modals
    }, 100);
  };

  const tourSteps = [
    {
      id: 'log-groceries',
      title: 'Log Your Groceries',
      description: 'Learn how to add items to your fridge inventory using the camera',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      onClick: handleLogGroceries,
      show: true
    },
    {
      id: 'setup-shortcut',
      title: 'Set Up iOS Shortcut',
      description: 'Install the Trackabite shortcut to save Instagram recipes in one tap',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      onClick: handleSetupShortcut,
      show: isIOS()
    },
    {
      id: 'import-recipe',
      title: 'Import a Recipe',
      description: 'Discover how to save recipes from Instagram or enter them manually',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      onClick: handleImportRecipe,
      show: true
    },
    {
      id: 'generate-recipes',
      title: 'Generate Personalized Recipes',
      description: 'Discover how AI creates custom recipes based on your inventory and preferences',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      ),
      onClick: handleGenerateRecipes,
      show: true
    }
  ];

  return (
    <div className="welcome-tour-page">
      {/* Header */}
      <div className="welcome-tour-page__header">
        <button className="welcome-tour-page__back-button" onClick={handleBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="12,19 5,12 12,5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="welcome-tour-page__title">Welcome Tour</h1>
        <div className="welcome-tour-page__header-spacer"></div>
      </div>

      {/* Description */}
      <div className="welcome-tour-page__description">
        <p>Choose which part of the tour you'd like to replay, or start the complete guided experience.</p>
      </div>

      {/* Tour Steps */}
      <div className="welcome-tour-page__steps">
        {tourSteps.filter(step => step.show).map((step) => (
          <div
            key={step.id}
            className="welcome-tour-page__step-card"
            onClick={step.onClick}
          >
            <div className="welcome-tour-page__step-icon">
              {step.icon}
            </div>
            <div className="welcome-tour-page__step-content">
              <h3 className="welcome-tour-page__step-title">{step.title}</h3>
              <p className="welcome-tour-page__step-description">{step.description}</p>
            </div>
            <div className="welcome-tour-page__step-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ))}

        {/* Complete Full Tour Option */}
        <div
          className="welcome-tour-page__step-card welcome-tour-page__step-card--featured"
          onClick={handleStartFullTour}
        >
          <div className="welcome-tour-page__step-icon welcome-tour-page__step-icon--featured">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="welcome-tour-page__step-content">
            <h3 className="welcome-tour-page__step-title">Complete Full Tour</h3>
            <p className="welcome-tour-page__step-description">Experience the entire welcome tour from the beginning</p>
          </div>
          <div className="welcome-tour-page__step-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTourPage;
