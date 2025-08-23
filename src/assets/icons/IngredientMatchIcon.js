import React from 'react';

const IngredientMatchIcon = ({ size = 20, color = "#81e053" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Checkmark circle background */}
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    
    {/* Checkmark */}
    <path
      d="M8 12L11 15L16 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Small dots representing ingredients */}
    <circle cx="6" cy="6" r="1.5" fill={color} opacity="0.7" />
    <circle cx="18" cy="6" r="1.5" fill={color} opacity="0.7" />
    <circle cx="18" cy="18" r="1.5" fill={color} opacity="0.7" />
  </svg>
);

export default IngredientMatchIcon;