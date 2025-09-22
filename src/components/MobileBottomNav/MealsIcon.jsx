import React from 'react';

const MealsIcon = ({ width = 24, height = 24, color = 'currentColor', className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Fork */}
      <path d="M7 2v6l2 2v12M7 2v4M5 2v4M9 2v4" />
      
      {/* Knife */}
      <path d="M17 2v20M17 2c2 0 3 1.5 3 3.5S19 9 17 9" />
    </svg>
  );
};

export default MealsIcon;