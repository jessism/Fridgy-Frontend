import React from 'react';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  savedItems = [], 
  itemCount = 0 
}) => {
  if (!isOpen) return null;

  const handleOkClick = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="success-modal-overlay" onClick={handleOverlayClick}>
      <div className="success-modal">
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
};

export default SuccessModal;