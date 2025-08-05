import React, { useState } from 'react';
import './ConfirmationPage.css';

const ConfirmationPage = ({ items, onConfirm, onBack }) => {
  const [checkedItems, setCheckedItems] = useState(
    items.reduce((acc, item, index) => {
      acc[index] = true; // All items checked by default
      return acc;
    }, {})
  );

  const handleCheckboxChange = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleConfirmAndSave = () => {
    const confirmedItems = items.filter((_, index) => checkedItems[index]);
    onConfirm(confirmedItems);
  };

  const checkedItemsCount = Object.values(checkedItems).filter(Boolean).length;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = (dateStr) => {
    const expiryDate = new Date(dateStr);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (dateStr) => {
    const days = getDaysUntilExpiry(dateStr);
    if (days < 0) return 'expired';
    if (days <= 3) return 'expiring-soon';
    if (days <= 7) return 'expiring-week';
    return 'fresh';
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-content">
        <div className="header-section">
          <h2 className="page-title">✅ Confirm Your Items</h2>
          <p className="page-subtitle">
            Review the items we found and uncheck any that are incorrect
          </p>
        </div>

        <div className="items-list">
          {items.map((item, index) => {
            const expiryStatus = getExpiryStatus(item.expires);
            const daysUntilExpiry = getDaysUntilExpiry(item.expires);
            
            return (
              <div key={index} className={`item-card ${!checkedItems[index] ? 'unchecked' : ''}`}>
                <div className="item-checkbox">
                  <input
                    type="checkbox"
                    id={`item-${index}`}
                    checked={checkedItems[index]}
                    onChange={() => handleCheckboxChange(index)}
                  />
                  <label htmlFor={`item-${index}`} className="checkbox-label"></label>
                </div>
                
                <div className="item-details">
                  <div className="item-main">
                    <h3 className="item-name">{item.item}</h3>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  
                  <div className="item-expiry">
                    <span className={`expiry-date ${expiryStatus}`}>
                      Expires: {formatDate(item.expires)}
                    </span>
                    <span className={`expiry-indicator ${expiryStatus}`}>
                      {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` :
                       daysUntilExpiry === 0 ? 'Today' :
                       daysUntilExpiry === 1 ? 'Tomorrow' :
                       `${daysUntilExpiry} days`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="action-section">
          <div className="items-summary">
            {checkedItemsCount} of {items.length} items selected
          </div>
          
          <div className="action-buttons">
            <button 
              className="back-btn"
              onClick={onBack}
            >
              ← Back
            </button>
            
            <button 
              className="confirm-btn"
              onClick={handleConfirmAndSave}
              disabled={checkedItemsCount === 0}
            >
              Confirm & Save ({checkedItemsCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage; 