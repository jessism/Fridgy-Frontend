import React from 'react';
import './SuccessPage.css';

const SuccessPage = ({ onStartOver }) => {
  return (
    <div className="success-page">
      <div className="success-content">
        <div className="success-animation">
          <div className="checkmark">✅</div>
        </div>
        
        <h2 className="success-title">Items Saved Successfully! 🎉</h2>
        <p className="success-subtitle">
          Your fridge inventory has been updated. You can now track your groceries and their expiration dates.
        </p>
        
        <div className="success-features">
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span className="feature-text">Items saved to your inventory</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⏰</span>
            <span className="feature-text">Expiration dates tracked</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔔</span>
            <span className="feature-text">Ready for future notifications</span>
          </div>
        </div>
        
        <div className="action-section">
          <button 
            className="start-over-btn"
            onClick={onStartOver}
          >
            📸 Add More Items
          </button>
        </div>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>Take more photos to add items</li>
            <li>Set up notifications for expiring items</li>
            <li>View your complete inventory</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage; 