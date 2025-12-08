import React, { useState } from 'react';
import './CreateCookbookModal.css';

const CreateCookbookModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a cookbook name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onCreated(name.trim());
      setName('');
      // Parent will close modal and open AddRecipesModal
    } catch (err) {
      setError(err.message || 'Failed to create cookbook');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="create-cookbook-modal__overlay" onClick={handleOverlayClick}>
      <div className="create-cookbook-modal__content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="create-cookbook-modal__close"
          onClick={handleClose}
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

        {/* Cookbook icon */}
        <div className="create-cookbook-modal__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19.5A2.5 2.5 0 016.5 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 7h8M8 11h5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Header */}
        <div className="create-cookbook-modal__header">
          <h2>Create Cookbook</h2>
          <p>Give your cookbook a name to organize your recipes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="create-cookbook-modal__input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cookbook name"
              className="create-cookbook-modal__input"
              maxLength={100}
              autoFocus
            />
            {error && <p className="create-cookbook-modal__error">{error}</p>}
          </div>

          {/* Footer buttons */}
          <div className="create-cookbook-modal__footer">
            <button
              type="button"
              className="create-cookbook-modal__button create-cookbook-modal__button--secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-cookbook-modal__button create-cookbook-modal__button--primary"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCookbookModal;
