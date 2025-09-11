import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './DeductionSuccessModal.css';

const DeductionSuccessModal = ({ 
  isOpen, 
  onClose,
  deductionResults = null,
  mealName = 'Your meal'
}) => {
  // Auto-close after 10 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !deductionResults) return null;

  const handleOkClick = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Extract successful and failed deductions
  const successfulDeductions = deductionResults.deducted || [];
  const failedDeductions = deductionResults.errors || [];
  const summary = deductionResults.summary || {};

  const modalContent = (
    <div className="deduction-modal-overlay" onClick={handleOverlayClick}>
      <div className="deduction-modal">
        {/* Close button */}
        <button 
          className="deduction-modal-close"
          onClick={onClose}
          title="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        {/* Success icon */}
        <div className="deduction-success-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        
        {/* Header */}
        <div className="deduction-modal-header">
          <h2>Meal Logged 🎉</h2>
          <p className="deduction-subtitle">{mealName} saved to your history.</p>
        </div>
        
        <div className="deduction-modal-content">
          {/* Successful deductions section */}
          {successfulDeductions.length > 0 && (
            <div className="deduction-section success-section">
              <div className="section-header">
                <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="16 10 10 16 8 14"/>
                </svg>
<span className="deducted-section-title">Deducted from inventory</span>
              </div>
              
              <div className="deduction-items">
                {successfulDeductions.map((item, index) => (
                  <div key={index} className="deduction-item">
                    <div className="item-info">
                      <span className="item-name">{item.itemName || item.ingredient}</span>
                      <span className="item-quantity">{item.deducted} {item.unit}</span>
                    </div>
                    <span className="item-status">
                      {item.newQuantity === 0 ? 'depleted' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Failed deductions section */}
          {failedDeductions.length > 0 && (
            <div className="deduction-section warning-section">
              <div className="section-header">
                <svg className="section-icon warning" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
<span className="missing-section-title">Missing from inventory</span>
              </div>
              
              <div className="deduction-items">
                {failedDeductions.map((item, index) => (
                  <div key={index} className="deduction-item">
                    <div className="item-info">
                      <span className="item-name">{item.ingredient}</span>
                    </div>
                    <button className="add-to-inventory-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add to inventory
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer buttons */}
        <div className="deduction-modal-footer">
          {failedDeductions.length > 0 && (
            <button 
              className="deduction-button secondary"
              onClick={() => console.log('Fix items clicked')}
            >
              Fix Items
            </button>
          )}
          <button 
            className="deduction-button primary"
            onClick={handleOkClick}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  // Render using portal to break out of any parent containers
  return createPortal(modalContent, document.body);
};

export default DeductionSuccessModal;