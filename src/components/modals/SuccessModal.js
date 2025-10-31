import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import confettiIcon from '../../assets/icons/Confetti.png';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  savedItems = [], 
  itemCount = 0 
}) => {
  // Auto-close after 3 seconds if user doesn't click OK
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

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
          <img src={confettiIcon} alt="Success" className="success-icon-img" />
          <h2>Items Saved Successfully!</h2>
        </div>
        
        <div className="success-modal-content">
          <p className="success-message">
            {itemCount} item{itemCount !== 1 ? 's' : ''} saved to your inventory
          </p>
          
          {savedItems.length > 0 && (
            <div className="saved-items-list">
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