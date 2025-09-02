import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const DeductionSuccessModal = ({ 
  isOpen, 
  onClose,
  deductionResults = null
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
          ✕
        </button>
        
        <div className="deduction-modal-header">
          <div className="deduction-icon">✅</div>
          <h2>Meal Logged Successfully!</h2>
        </div>
        
        <div className="deduction-modal-content">
          {/* Summary */}
          <p className="deduction-summary">
            Deducted <strong>{summary.successfulDeductions || 0}</strong> item{summary.successfulDeductions !== 1 ? 's' : ''} from your inventory
          </p>
          
          {/* Successful deductions */}
          {successfulDeductions.length > 0 && (
            <div className="deduction-items-list">
              <h4 className="deduction-section-title">Items Deducted:</h4>
              <ul className="deduction-list">
                {successfulDeductions.map((item, index) => (
                  <li key={index} className="deduction-item success">
                    <span className="deduction-indicator">−</span>
                    <div className="deduction-details">
                      <span className="item-name">{item.itemName || item.ingredient}</span>
                      <span className="item-amounts">
                        <strong>−{item.deducted} {item.unit}</strong>
                        {item.newQuantity > 0 && (
                          <span className="remaining"> ({item.newQuantity} {item.unit} remaining)</span>
                        )}
                        {item.newQuantity === 0 && (
                          <span className="depleted"> (depleted)</span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Failed deductions */}
          {failedDeductions.length > 0 && (
            <div className="deduction-errors-list">
              <h4 className="deduction-section-title error-title">⚠️ Could not deduct:</h4>
              <ul className="deduction-list">
                {failedDeductions.map((item, index) => (
                  <li key={index} className="deduction-item failed">
                    <span className="error-indicator">!</span>
                    <div className="deduction-details">
                      <span className="item-name">{item.ingredient}</span>
                      <span className="error-reason">{item.reason || 'Not in inventory'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="deduction-modal-footer">
          <button 
            className="deduction-ok-button"
            onClick={handleOkClick}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  // Render using portal to break out of any parent containers
  return createPortal(modalContent, document.body);
};

export default DeductionSuccessModal;