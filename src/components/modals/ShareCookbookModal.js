import React, { useState, useEffect, useCallback } from 'react';
import { X, Copy, Check, Users, Trash2 } from 'lucide-react';
import useCookbooks from '../../hooks/useCookbooks';
import './ShareCookbookModal.css';

const ShareCookbookModal = ({ cookbook, isOpen, onClose }) => {
  const { generateShareCode, getMembers, removeMember } = useCookbooks();

  const [shareCode, setShareCode] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');
  const [removingMember, setRemovingMember] = useState(null);

  // Fetch share code and members when modal opens
  const fetchShareData = useCallback(async () => {
    if (!cookbook?.id) return;

    setLoading(true);
    setError('');

    try {
      // Get or generate share code
      const shareData = await generateShareCode(cookbook.id);
      setShareCode(shareData.shareCode);
      setShareLink(shareData.shareLink);

      // Get members
      const memberList = await getMembers(cookbook.id);
      setMembers(memberList);
    } catch (err) {
      console.error('Error fetching share data:', err);
      setError('Failed to load sharing info. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [cookbook?.id, generateShareCode, getMembers]);

  useEffect(() => {
    if (isOpen && cookbook) {
      fetchShareData();
    }
  }, [isOpen, cookbook, fetchShareData]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this cookbook?`)) return;

    setRemovingMember(memberId);
    try {
      await removeMember(cookbook.id, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member. Please try again.');
    } finally {
      setRemovingMember(null);
    }
  };

  if (!isOpen || !cookbook) return null;

  return (
    <div className="share-cookbook-modal__overlay" onClick={onClose}>
      <div className="share-cookbook-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="share-cookbook-modal__header">
          <h2 className="share-cookbook-modal__title">Share Cookbook</h2>
          <button className="share-cookbook-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="share-cookbook-modal__content">
          {loading ? (
            <div className="share-cookbook-modal__loading">
              <div className="share-cookbook-modal__spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* Share Code Section */}
              <div className="share-cookbook-modal__section">
                <label className="share-cookbook-modal__label">Share Code</label>
                <div className="share-cookbook-modal__code-container">
                  <div className="share-cookbook-modal__code" onClick={handleCopyCode}>
                    {shareCode || '----'}
                    {copiedCode && <span className="share-cookbook-modal__copied">Copied!</span>}
                  </div>
                  <p className="share-cookbook-modal__hint">Tap code to copy</p>
                </div>
              </div>

              {/* Share Link Section */}
              <div className="share-cookbook-modal__section">
                <label className="share-cookbook-modal__label">Share Link</label>
                <div className="share-cookbook-modal__link-row">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="share-cookbook-modal__input"
                  />
                  <button
                    className="share-cookbook-modal__copy-btn"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="share-cookbook-modal__hint">
                  Anyone with this link can join and add recipes to this cookbook
                </p>
              </div>

              {/* Members Section */}
              {members.length > 0 && (
                <div className="share-cookbook-modal__section">
                  <label className="share-cookbook-modal__label">
                    <Users size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Members ({members.length})
                  </label>
                  <div className="share-cookbook-modal__members">
                    {members.map(member => (
                      <div key={member.id} className="share-cookbook-modal__member">
                        <div className="share-cookbook-modal__member-info">
                          <span className="share-cookbook-modal__member-name">
                            {member.name}
                          </span>
                          {member.role === 'owner' && (
                            <span className="share-cookbook-modal__member-badge">Owner</span>
                          )}
                        </div>
                        {member.role !== 'owner' && (
                          <button
                            className="share-cookbook-modal__remove-btn"
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            disabled={removingMember === member.id}
                            title="Remove member"
                          >
                            {removingMember === member.id ? (
                              <div className="share-cookbook-modal__mini-spinner"></div>
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="share-cookbook-modal__error">{error}</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="share-cookbook-modal__footer">
          <button
            className="share-cookbook-modal__btn share-cookbook-modal__btn--secondary"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareCookbookModal;
