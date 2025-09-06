import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AIRecipeSection.css';

const AIRecipeSection = () => {
  const navigate = useNavigate();

  const handleStartPersonalizedRecipes = () => {
    navigate('/ai-recipes');
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Text Section - Same level as other content */}
      <div className="ai-recipe-text-section">
        <h2 className="ai-recipe-title">
          Get perfect match with AI
        </h2>
        <p className="ai-recipe-description">
          AI-powered recipes using your ingredients.
        </p>
      </div>

      {/* Button - Same level as Log Your Meal */}
      <div className="meal-plans-page__ai-access" onClick={handleStartPersonalizedRecipes}>
        <div className="meal-plans-page__ai-access-item">
          <div className="meal-plans-page__ai-access-icon">
          </div>
          <div className="meal-plans-page__ai-access-label">
            Start personalized recipes
          </div>
        </div>
      </div>
    </>
  );
};

export default AIRecipeSection;