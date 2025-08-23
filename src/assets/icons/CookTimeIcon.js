import React from 'react';

const CookTimeIcon = ({ size = 20, color = "#81e053" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Clock face */}
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    
    {/* Clock hands */}
    <path
      d="M12 6V12L16 16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Hour markers */}
    <circle cx="12" cy="4" r="1" fill={color} opacity="0.6" />
    <circle cx="20" cy="12" r="1" fill={color} opacity="0.6" />
    <circle cx="12" cy="20" r="1" fill={color} opacity="0.6" />
    <circle cx="4" cy="12" r="1" fill={color} opacity="0.6" />
  </svg>
);

export default CookTimeIcon;