import React from 'react';

const SaveIcon = ({ size = 32, color = "#4fcf61" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Dollar sign */}
    <path
      d="M16 6V8M16 24V26M16 8C14.5 8 13 9 13 10.5C13 12 14.5 13 16 13H17C18.5 13 20 14 20 15.5C20 17 18.5 18 17 18H16M16 8H19M13 18H16M16 13V18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Circle around dollar sign */}
    <circle
      cx="16"
      cy="16"
      r="12"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export default SaveIcon;