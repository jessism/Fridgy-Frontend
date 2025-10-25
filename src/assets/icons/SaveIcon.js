import React from 'react';

const SaveIcon = ({ size = 32, color = "#81e053" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Piggy bank body - modern rounded shape */}
    <ellipse
      cx="16"
      cy="17"
      rx="9"
      ry="7"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />

    {/* Piggy bank head/snout */}
    <ellipse
      cx="24"
      cy="16"
      rx="2.5"
      ry="2"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />

    {/* Piggy bank ear */}
    <path
      d="M10 12 C10 12 9 11 9 9.5 C9 8.5 9.5 8 10 8 C10.5 8 11 8.5 11 9.5 C11 11 10 12 10 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Coin slot on top */}
    <path
      d="M14 11 L18 11"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Legs */}
    <path
      d="M11 23 L11 26"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15 23.5 L15 26"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17 23.5 L17 26"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 23 L21 26"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Eye */}
    <circle
      cx="19"
      cy="15"
      r="1.2"
      fill={color}
    />

    {/* Sparkle effect - savings indicator */}
    <path
      d="M5 15 L6 15 M5.5 14.5 L5.5 15.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M27 20 L28 20 M27.5 19.5 L27.5 20.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export default SaveIcon;