import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AIRecipeSection.css';

const AIRecipeSection = () => {
  const navigate = useNavigate();

  const handleStartPersonalizedRecipes = () => {
    navigate('/ai-recipes');
  };

  return (
    <section className="ai-recipe-section">
      {/* Section Header */}
      <div className="section-header">
        <div className="header-content">
          <h2 className="section-title">
            Get perfect match with AI
          </h2>
          <p className="section-description">
            Let your AI chef create personalized recipes based on the ingredients you already have and your preference.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="section-content">
        {/* Duplicated Log Your Meal Button */}
        <div className="meal-plans-page__ai-access" onClick={handleStartPersonalizedRecipes}>
          <div className="meal-plans-page__ai-access-item">
            <div className="meal-plans-page__ai-access-icon">
            </div>
            <div className="meal-plans-page__ai-access-label">
              Start personalized recipes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIRecipeSection;