import React from 'react';

const FridgeIcon = ({ size = 32, color = "#81e053" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simple fridge outline */}
    <rect
      x="8"
      y="4"
      width="16"
      height="24"
      rx="1"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    
    {/* Door separator line */}
    <line
      x1="8"
      y1="15"
      x2="24"
      y2="15"
      stroke={color}
      strokeWidth="2"
    />
    
    {/* Handle */}
    <line
      x1="21"
      y1="10"
      x2="21"
      y2="12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default FridgeIcon;