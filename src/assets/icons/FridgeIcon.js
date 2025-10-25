import React from 'react';

const FridgeIcon = ({ size = 32, color = "#81e053" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Modern fridge body with rounded corners */}
    <rect
      x="7"
      y="3"
      width="18"
      height="26"
      rx="2"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />

    {/* Top freezer section */}
    <path
      d="M7 11 H25"
      stroke={color}
      strokeWidth="2"
    />

    {/* Shelf lines for depth */}
    <path
      d="M9 15 H23"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.4"
    />
    <path
      d="M9 20 H23"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.4"
    />

    {/* Modern handle - top door */}
    <rect
      x="21.5"
      y="6"
      width="1.5"
      height="3"
      rx="0.75"
      fill={color}
    />

    {/* Modern handle - bottom door */}
    <rect
      x="21.5"
      y="17"
      width="1.5"
      height="4"
      rx="0.75"
      fill={color}
    />

    {/* Fresh food indicator dots */}
    <circle cx="11" cy="7.5" r="1" fill={color} opacity="0.6" />
    <circle cx="14" cy="7.5" r="1" fill={color} opacity="0.6" />
    <circle cx="17" cy="7.5" r="1" fill={color} opacity="0.6" />
  </svg>
);

export default FridgeIcon;