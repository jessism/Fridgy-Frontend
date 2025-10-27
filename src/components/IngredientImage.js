import React, { useState, useEffect } from 'react';
import ingredientImageService from '../services/ingredientImageService';
import { getItemIconIcons8 } from '../assets/inventory_emojis/iconHelpers';
import './IngredientImage.css';

/**
 * Component for displaying ingredient images with intelligent fallback
 */
const IngredientImage = ({ 
  item, 
  size = 48, 
  className = '', 
  preferThumbnail = false,
  showLoading = true,
  fallbackToIcon = true 
}) => {
  // Function to get category-based color class
  const getCategoryColorClass = (category) => {
    const cat = category?.toLowerCase() || '';

    if (cat.includes('fruit')) {
      return 'ingredient-image--fruit-green-bg';
    } else if (cat.includes('vegetable')) {
      return 'ingredient-image--vegetable-green-bg';
    } else if (cat.includes('dairy')) {
      return 'ingredient-image--blue-bg';
    } else if (cat.includes('protein') || cat.includes('meat') || cat.includes('fish')) {
      return 'ingredient-image--red-bg';
    } else if (cat.includes('beverage') || cat.includes('drink') || cat.includes('juice') || cat.includes('coffee') || cat.includes('tea')) {
      return 'ingredient-image--orange-bg';
    } else if (cat.includes('fats') || cat.includes('oil') || cat.includes('butter')) {
      return 'ingredient-image--yellow-bg';
    } else if (cat.includes('grain') || cat.includes('bread') || cat.includes('pasta')) {
      return 'ingredient-image--tan-bg';
    } else {
      return 'ingredient-image--pink-bg';
    }
  };
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [item?.itemName, item?.imageUrl]);

  const loadImage = async () => {
    if (!item) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      
      // If item already has imageUrl, use it directly
      if (item.imageUrl) {
        setImageUrl(item.imageUrl);
        setIsLoading(false);
        return;
      }
      
      // Otherwise, fetch from service
      const url = await ingredientImageService.getIngredientImage(item, {
        preferThumbnail,
        returnComponent: false
      });
      
      if (url && typeof url === 'string') {
        setImageUrl(url);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error('Error loading ingredient image:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    console.warn(`Image failed to load: ${imageUrl}`);
    setHasError(true);
    setImageUrl(null);
  };

  // Show Icons8 SVG icon as fallback
  if (hasError && fallbackToIcon) {
    const categoryClass = getCategoryColorClass(item?.category);
    return (
      <div 
        className={`ingredient-image ingredient-image--icon ${categoryClass} ${className}`}
        style={{ width: size, height: size }}
      >
        {getItemIconIcons8(item?.category, item?.itemName, { size })}
      </div>
    );
  }

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <div 
        className={`ingredient-image ingredient-image--loading ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="ingredient-image__spinner"></div>
      </div>
    );
  }

  // Show real image
  if (imageUrl && !hasError) {
    const categoryClass = getCategoryColorClass(item?.category);
    return (
      <div 
        className={`ingredient-image ingredient-image--photo ${categoryClass} ${className}`}
        style={{ width: size, height: size }}
      >
        <img 
          src={imageUrl}
          alt={item?.itemName || 'Ingredient'}
          onError={handleImageError}
          loading="lazy"
          style={{
            objectFit: 'contain'
          }}
        />
      </div>
    );
  }

  // Default placeholder
  return (
    <div 
      className={`ingredient-image ingredient-image--placeholder ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="ingredient-image__placeholder-icon">
        🥘
      </div>
    </div>
  );
};

export default IngredientImage;