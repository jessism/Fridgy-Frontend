import React from 'react';
import ReactDOM from 'react-dom';
import './GuidedTour.css';

/**
 * RecipeImportSuccessModal - Success confirmation after recipe import
 * Shows when recipe has been successfully imported
 */
const RecipeImportSuccessModal = ({ recipe, onViewRecipes, onContinue }) => {
  return ReactDOM.createPortal(
    <div className="guided-tour__celebration-overlay">
      <div className="guided-tour__celebration-card">
        {/* Success Icon */}
        <div className="guided-tour__celebration-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="guided-tour__celebration-message">
          Congrats on importing your first recipe!
        </h2>

        {/* Description */}
        <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6', margin: '0 0 2rem 0', maxWidth: '340px' }}>
          You're now ready to start cooking and tracking your meals.
        </p>

        {/* Recipe Preview (if available) */}
        {recipe && recipe.image && (
          <div style={{
            width: '100%',
            maxWidth: '280px',
            height: '180px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <img
              src={recipe.image}
              alt={recipe.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <button
            className="guided-tour__celebration-button"
            onClick={onViewRecipes || onContinue}
          >
            {onViewRecipes ? 'View My Recipes' : 'Continue'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RecipeImportSuccessModal;
