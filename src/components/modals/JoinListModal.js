import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinListModal.css';

const JoinListModal = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const extractShareCode = (input) => {
    const trimmed = input.trim();

    // Check if it's a full URL
    if (trimmed.includes('/join/')) {
      const parts = trimmed.split('/join/');
      return parts[parts.length - 1].split(/[?#]/)[0]; // Remove any query params
    }

    // Check if it's just the share code
    // Share codes are typically uppercase alphanumeric with hyphens
    if (/^[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    // Try to use it as-is (might be a different format)
    return trimmed;
  };

  const handleJoin = () => {
    const shareCode = extractShareCode(input);

    if (!shareCode) {
      setError('Please enter a valid share link or code');
      return;
    }

    setLoading(true);
    setError('');

    // Navigate to the join route with the share code
    navigate(`/join/${shareCode}`);

    // Close the modal
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleJoin();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="join-list-modal__overlay" onClick={onClose}>
      <div className="join-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="join-list-modal__header">
          <h2 className="join-list-modal__title">Join a Shopping List</h2>
          <button
            className="join-list-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="join-list-modal__content">
          <div className="join-list-modal__section">
            <label className="join-list-modal__label">
              Enter share link or code:
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste link or enter code (e.g., AB12-CD34)"
              className="join-list-modal__input"
              autoFocus
              disabled={loading}
            />
            <p className="join-list-modal__hint">
              You can paste the full link or just enter the share code
            </p>
          </div>

          {error && (
            <div className="join-list-modal__error">
              {error}
            </div>
          )}

          <div className="join-list-modal__examples">
            <p className="join-list-modal__examples-title">Examples:</p>
            <ul className="join-list-modal__examples-list">
              <li>Full link: http://localhost:3000/join/AB12-CD34</li>
              <li>Just code: AB12-CD34</li>
            </ul>
          </div>
        </div>

        <div className="join-list-modal__footer">
          <button
            onClick={onClose}
            className="join-list-modal__button join-list-modal__button--secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="join-list-modal__button join-list-modal__button--primary"
            disabled={!input.trim() || loading}
          >
            {loading ? 'Joining...' : 'Join List'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinListModal;