import React, { useState, useEffect } from 'react';
import './ShareListModal.css';

const ShareListModal = ({ list, isOpen, onClose, onShare }) => {
  const [emails, setEmails] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (list && list.share_code) {
      const link = `${window.location.origin}/join/${list.share_code}`;
      setShareLink(link);
    }
  }, [list]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (list && list.share_code) {
      navigator.clipboard.writeText(list.share_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareByEmail = async () => {
    if (!emails.trim()) return;

    setLoading(true);
    setError('');

    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
      await onShare(list.id, emailList);
      setEmails('');
      onClose();
    } catch (err) {
      setError('Failed to share list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !list) return null;

  return (
    <div className="share-modal__overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal__header">
          <h2 className="share-modal__title">Share "{list.name}"</h2>
          <button className="share-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="share-modal__content">
          {/* Share Code Section */}
          <div className="share-modal__section">
            <label className="share-modal__label">Share code:</label>
            <div className="share-modal__code-container">
              <div className="share-modal__code" onClick={handleCopyCode}>
                {list.share_code}
              </div>
              <p className="share-modal__code-hint">Tap to copy</p>
            </div>
            <p className="share-modal__hint">
              Share this code with others to let them join your list
            </p>
          </div>

          {/* Current Members Section (if list has members) */}
          {list.shopping_list_members && list.shopping_list_members.length > 0 && (
            <div className="share-modal__section">
              <label className="share-modal__label">Current members ({list.shopping_list_members.length}):</label>
              <div className="share-modal__members-list">
                {list.shopping_list_members.map((member, index) => (
                  <div key={member.id || index} className="share-modal__member">
                    <span className="share-modal__member-name">
                      {member.user?.first_name && member.user?.last_name
                        ? `${member.user.first_name} ${member.user.last_name}`
                        : member.user?.email || 'Unknown User'}
                    </span>
                    {member.role === 'owner' && (
                      <span className="share-modal__member-role">Owner</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="share-modal__error">{error}</div>
          )}
        </div>

        <div className="share-modal__footer">
          <button onClick={onClose} className="share-modal__button share-modal__button--secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareListModal;