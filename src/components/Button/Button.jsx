import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  href,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClass = 'button';
  const classes = `${baseClass} ${baseClass}--${variant} ${baseClass}--${size} ${className}`.trim();

  // If href is provided, render as Link or anchor
  if (href) {
    return (
      <a 
        href={href} 
        className={classes}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;