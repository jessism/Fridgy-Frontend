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
          {/* Share by Email Section */}
          <div className="share-modal__section">
            <label className="share-modal__label">Share with Trackabite users (email):</label>
            <div className="share-modal__input-group">
              <input
                type="text"
                placeholder="john@example.com, sarah@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="share-modal__input"
                disabled={loading}
              />
              <button
                onClick={handleShareByEmail}
                disabled={loading || !emails.trim()}
                className="share-modal__send-button"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
            <p className="share-modal__hint">
              Separate multiple emails with commas
            </p>
          </div>

          <div className="share-modal__divider">
            <span>OR</span>
          </div>

          {/* Share with Link Section */}
          <div className="share-modal__section">
            <label className="share-modal__label">Share with link:</label>
            <div className="share-modal__link-container">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="share-modal__input share-modal__input--readonly"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={handleCopyLink}
                className="share-modal__copy-button"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="share-modal__hint">
              Anyone with a Trackabite account can join using this link
            </p>
          </div>

          {/* Share Code Section */}
          <div className="share-modal__section">
            <label className="share-modal__label">Quick share code:</label>
            <div className="share-modal__code-container">
              <div className="share-modal__code" onClick={handleCopyCode}>
                {list.share_code}
              </div>
              <p className="share-modal__code-hint">Tap to copy</p>
            </div>
            <p className="share-modal__hint">
              Share this code verbally or via text for easy joining
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