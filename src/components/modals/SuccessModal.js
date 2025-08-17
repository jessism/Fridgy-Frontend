import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  savedItems = [], 
  itemCount = 0 
}) => {
  // Auto-close after 2 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOkClick = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className="success-modal-overlay" onClick={handleOverlayClick}>
      <div className="success-modal">
        {/* Close button */}
        <button 
          className="success-modal-close"
          onClick={onClose}
          title="Close"
        >
          ✕
        </button>
        
        <div className="success-modal-header">
          <div className="success-icon">🎉</div>
          <h2>Items Saved Successfully!</h2>
        </div>
        
        <div className="success-modal-content">
          <p className="success-message">
            Successfully saved <strong>{itemCount}</strong> item{itemCount !== 1 ? 's' : ''} to your inventory!
          </p>
          
          {savedItems.length > 0 && (
            <div className="saved-items-list">
              <h4>Items saved:</h4>
              <ul>
                {savedItems.map((item, index) => (
                  <li key={index}>
                    <span className="item-name">{item.name || item.item}</span>
                    <span className="item-quantity">({item.quantity})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="success-modal-footer">
          <button 
            className="success-ok-button"
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

export default SuccessModal;