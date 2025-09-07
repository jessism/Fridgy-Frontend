import React, { useState, useEffect } from 'react';
import FridgyLogo from '../../../assets/images/Logo.png';
import './AIRecipeLoadingScreen.css';

const AIRecipeLoadingScreen = () => {
  const [activeSteps, setActiveSteps] = useState([]);
  
  // Progressively activate steps
  useEffect(() => {
    const timers = [];
    
    // Activate first step immediately
    timers.push(setTimeout(() => setActiveSteps(['inventory']), 500));
    
    // Activate second step after 1.5 seconds
    timers.push(setTimeout(() => setActiveSteps(['inventory', 'preferences']), 2000));
    
    // Activate third step after 3 seconds
    timers.push(setTimeout(() => setActiveSteps(['inventory', 'preferences', 'recipes']), 3500));
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const isStepActive = (step) => activeSteps.includes(step);
  const isStepComplete = (step) => {
    const stepIndex = ['inventory', 'preferences', 'recipes'].indexOf(step);
    const activeIndex = activeSteps.length - 1;
    return stepIndex < activeIndex;
  };

  return (
    <div className="ai-recipe-loading-screen">
      <div className="ai-recipe-loading-content">
        {/* Animated Logo with Spinner */}
        <div className="ai-recipe-loading-logo-container">
          <div className="ai-recipe-loading-spinner"></div>
          <img 
            src={FridgyLogo} 
            alt="Fridgy" 
            className="ai-recipe-loading-logo"
          />
        </div>
        
        {/* Main Headline */}
        <h2 className="ai-recipe-loading-title">
          Fridgy is creating your own personalized recipes
        </h2>
        
        {/* Status Messages */}
        <div className="ai-recipe-loading-steps">
          <div className={`ai-recipe-loading-step ${isStepActive('inventory') ? 'active' : ''} ${isStepComplete('inventory') ? 'complete' : ''}`}>
            <span className="ai-recipe-loading-step-icon">
              {isStepComplete('inventory') ? '✓' : isStepActive('inventory') ? '⚪' : '○'}
            </span>
            <span className="ai-recipe-loading-step-text">Analyzing your inventory</span>
          </div>
          
          <div className={`ai-recipe-loading-step ${isStepActive('preferences') ? 'active' : ''} ${isStepComplete('preferences') ? 'complete' : ''}`}>
            <span className="ai-recipe-loading-step-icon">
              {isStepComplete('preferences') ? '✓' : isStepActive('preferences') ? '⚪' : '○'}
            </span>
            <span className="ai-recipe-loading-step-text">Checking your preferences</span>
          </div>
          
          <div className={`ai-recipe-loading-step ${isStepActive('recipes') ? 'active' : ''} ${isStepComplete('recipes') ? 'complete' : ''}`}>
            <span className="ai-recipe-loading-step-icon">
              {isStepComplete('recipes') ? '✓' : isStepActive('recipes') ? '⚪' : '○'}
            </span>
            <span className="ai-recipe-loading-step-text">Generating recipes</span>
          </div>
        </div>
        
        {/* Loading Dots Animation */}
        <div className="ai-recipe-loading-dots">
          <span className="ai-recipe-loading-dot"></span>
          <span className="ai-recipe-loading-dot"></span>
          <span className="ai-recipe-loading-dot"></span>
        </div>
      </div>
    </div>
  );
};

export default AIRecipeLoadingScreen;