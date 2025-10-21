import React from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, itemType = 'recipe' }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="delete-confirm-overlay" onClick={handleOverlayClick}>
      <div className="delete-confirm-modal">
        {/* Close button */}
        <button
          className="delete-confirm-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Warning icon */}
        <div className="delete-warning-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M5.07 19h13.86c1.65 0 2.74-1.74 2.01-3.21l-6.93-14a2.18 2.18 0 00-3.96 0l-6.93 14C2.33 17.26 3.42 19 5.07 19z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Modal content */}
        <div className="delete-confirm-header">
          <h2>Delete {itemType}?</h2>
          <p className="delete-subtitle">
            Are you sure you want to delete "{itemName}"? This action cannot be undone.
          </p>
        </div>

        {/* Footer buttons */}
        <div className="delete-confirm-footer">
          <button
            className="delete-button secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="delete-button danger"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;