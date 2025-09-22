import React from 'react';

const ListIcon = ({ width = 24, height = 24, color = 'currentColor', className = '' }) => {
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
      {/* First dot and line */}
      <circle cx="5" cy="6" r="1.5" fill={color} stroke="none" />
      <line x1="10" y1="6" x2="19" y2="6" />
      
      {/* Second dot and line */}
      <circle cx="5" cy="12" r="1.5" fill={color} stroke="none" />
      <line x1="10" y1="12" x2="19" y2="12" />
      
      {/* Third dot and line */}
      <circle cx="5" cy="18" r="1.5" fill={color} stroke="none" />
      <line x1="10" y1="18" x2="19" y2="18" />
    </svg>
  );
};

export default ListIcon;