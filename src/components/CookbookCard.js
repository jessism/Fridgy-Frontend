import React from 'react';
import DeleteIcon from './icons/DeleteIcon';
import './CookbookCard.css';

const CookbookCard = ({ cookbook, onClick, onDelete }) => {
  const { name, recipe_count = 0, preview_images = [], cover_image } = cookbook;

  // Use preview_images if available, fallback to cover_image for backward compatibility
  const images = preview_images.length > 0 ? preview_images : (cover_image ? [cover_image] : []);
  const imageCount = images.length;

  const renderCollage = () => {
    if (imageCount === 0) {
      return (
        <div className="cookbook-card__placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19.5A2.5 2.5 0 016.5 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }

    if (imageCount === 1) {
      return <img src={images[0]} alt={name} className="cookbook-card__single-image" />;
    }

    if (imageCount === 2) {
      return (
        <div className="cookbook-card__collage cookbook-card__collage--two">
          <img src={images[0]} alt={`${name} 1`} />
          <img src={images[1]} alt={`${name} 2`} />
        </div>
      );
    }

    // 3 or more images
    return (
      <div className="cookbook-card__collage cookbook-card__collage--three">
        <img src={images[0]} alt={`${name} 1`} className="cookbook-card__collage-main" />
        <div className="cookbook-card__collage-side">
          <img src={images[1]} alt={`${name} 2`} />
          <img src={images[2]} alt={`${name} 3`} />
        </div>
      </div>
    );
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete(cookbook);
    }
  };

  return (
    <div className="cookbook-card" onClick={onClick}>
      <div className="cookbook-card__image">
        {renderCollage()}
        {/* Recipe count badge */}
        <div className="cookbook-card__badge">
          {recipe_count} {recipe_count === 1 ? 'recipe' : 'recipes'}
        </div>
      </div>
      <div className="cookbook-card__info">
        <h3 className="cookbook-card__title">{name}</h3>
        {/* Delete button */}
        {onDelete && (
          <button
            className="cookbook-card__delete-btn"
            onClick={handleDelete}
            aria-label={`Delete ${name} cookbook`}
          >
            <DeleteIcon width={16} height={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Create New Cookbook Card
export const CreateCookbookCard = ({ onClick }) => {
  return (
    <div className="cookbook-card cookbook-card--create" onClick={onClick}>
      <div className="cookbook-card__image cookbook-card__image--create">
        <div className="cookbook-card__create-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="cookbook-card__info">
        <h3 className="cookbook-card__title cookbook-card__title--create">Create New</h3>
      </div>
    </div>
  );
};

export default CookbookCard;
