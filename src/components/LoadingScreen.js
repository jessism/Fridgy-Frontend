import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-animation">
          <div className="spinner"></div>
        </div>
        
        <h2 className="loading-title">Analyzing your items...</h2>
        <p className="loading-subtitle">
          Our AI is identifying your groceries and checking expiration dates 🔍
        </p>
        
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 