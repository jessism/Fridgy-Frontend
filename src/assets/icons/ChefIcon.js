import React from 'react';

const ChefIcon = ({ size = 32, color = "#81e053" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Elegant chef hat - top puffy part */}
    <path
      d="M12 11 C12 9 13 7 15 7 C15.5 5 17.5 5 18 7 C20 7 21 9 21 11 L21 14 L12 14 L12 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Chef hat band */}
    <path
      d="M11 14 L22 14 C22 14 22.5 14.5 22.5 16 L22.5 17 C22.5 17.5 22 18 21.5 18 L11.5 18 C11 18 10.5 17.5 10.5 17 L10.5 16 C10.5 14.5 11 14 11 14Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Cooking pan */}
    <ellipse
      cx="16"
      cy="24"
      rx="5"
      ry="2"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />

    {/* Pan handle */}
    <path
      d="M21 24 L24 24"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* Steam wisps - modern touch */}
    <path
      d="M14 21 C14 21 14 20 14.5 20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M16 21 C16 21 16 19.5 16.5 19.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M18 21 C18 21 18 20 18.5 20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

export default ChefIcon;