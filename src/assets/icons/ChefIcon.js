import React from 'react';

const ChefIcon = ({ size = 32, color = "#4fcf61" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chef hat outline */}
    <path
      d="M10 14C10 10.686 12.686 8 16 8C19.314 8 22 10.686 22 14V16H10V14Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    
    {/* Hat band */}
    <line
      x1="9"
      y1="16"
      x2="23"
      y2="16"
      stroke={color}
      strokeWidth="2"
    />
    
    {/* Simple utensils */}
    <line
      x1="14"
      y1="22"
      x2="14"
      y2="26"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="22"
      x2="18"
      y2="26"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="14"
      cy="21"
      r="1"
      fill={color}
    />
    <path
      d="M17 21L19 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default ChefIcon;