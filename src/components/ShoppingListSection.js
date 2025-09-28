import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useShoppingLists from '../hooks/useShoppingLists';
import ShareListModal from './modals/ShareListModal';
import JoinListModal from './modals/JoinListModal';
import { ChevronLeft, Users, Check, Trash2, RefreshCw } from 'lucide-react';
import './ShoppingListSection.css';

const ShoppingListSection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    lists,
    loading,
    error,
    createList,
    getList,
    updateList,
    deleteList,
    addItem,
    toggleItem,
    deleteItem: deleteItemFromList,
    clearCompleted,
    shareList,
    migrateLists,
    fetchLists
  } = useShoppingLists();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [listToShare, setListToShare] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetListId, setBottomSheetListId] = useState(null);


  // Migrate local lists on component mount
  useEffect(() => {
    const migrationKey = 'shopping_lists_migrated_v1';
    if (!localStorage.getItem(migrationKey)) {
      const localLists = JSON.parse(localStorage.getItem('shoppingLists') || '[]');
      if (localLists.length > 0) {
        migrateLists(localLists).then(() => {
          localStorage.setItem(migrationKey, 'true');
          // Keep backup for 30 days
          const backupKey = `shopping_lists_backup_${Date.now()}`;
          localStorage.setItem(backupKey, JSON.stringify(localLists));
        }).catch(err => {
          console.error('Migration failed:', err);
        });
      } else {
        localStorage.setItem(migrationKey, 'true');
      }
    }
  }, [migrateLists]);




  // Handle navigation state for auto-selecting a list
  useEffect(() => {
    if (location.state?.autoSelectList && location.state?.selectedListId) {
      navigate(`/shopping-list/${location.state.selectedListId}`);
    }
  }, [location.state, navigate]);

  const handleCreateList = async () => {
    if (newListName.trim()) {
      try {
        // Get the best color for the new list
        const newColorIndex = getNextAvailableColor();

        const newList = await createList(newListName);

        // Store the color assignment for this new list
        storeListColor(newList.id, newColorIndex);

        setNewListName('');
        setShowCreateModal(false);
        // Navigate to the new list page
        navigate(`/shopping-list/${newList.id}`);
      } catch (err) {
        alert('Failed to create list. Please try again.');
      }
    }
  };


  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      setShowBottomSheet(false);
      // Refresh the lists to remove the deleted one
      fetchLists();
    } catch (err) {
      alert('Failed to delete list. Only owners can delete lists.');
    }
  };

  const handleClearCompleted = async (listId) => {
    try {
      const cleared = await clearCompleted(listId);
      // Refresh the lists to update counts
      fetchLists();
      setShowBottomSheet(false);
      alert(`Cleared ${cleared} completed items`);
    } catch (err) {
      alert('Failed to clear completed items. Please try again.');
    }
  };

  const handleShareList = async (listId, emails) => {
    try {
      await shareList(listId, emails);
      alert('List shared successfully!');
      // Refresh the lists to update member counts
      fetchLists();
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const handleRefreshList = async () => {
    // Just refresh the main lists since we're in overview mode
    try {
      fetchLists();
      setShowBottomSheet(false);
    } catch (err) {
      alert('Failed to refresh lists. Please try again.');
    }
  };

  const handleOpenShareModal = (list) => {
    setListToShare(list);
    setShowShareModal(true);
    setShowBottomSheet(false);
  };


  const getInitials = (member, listItems) => {
    // Use the same priority as getDisplayName - get the real name first
    const realName = getRealUserName(member?.user_id, listItems);
    let name = '';

    if (realName) {
      name = realName;
    } else if (member?.invited_by_name && member.invited_by_name !== 'Share Link') {
      name = member.invited_by_name;
    } else if (member?.user?.first_name) {
      name = member.user.first_name;
    } else if (member?.user?.email) {
      const emailPart = member.user.email.split('@')[0];
      return emailPart.substring(0, 2).toUpperCase();
    } else if (member?.invited_by_name) {
      name = member.invited_by_name;
    }

    if (name) {
      const first = name.charAt(0)?.toUpperCase() || '';
      const second = name.charAt(1)?.toUpperCase() || '';
      return first + (second || first);
    }

    return '?';
  };

  // Generate consistent avatar color based on user ID
  const getAvatarColor = (userId) => {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#DDA0DD', // Plum
      '#F4A460', // Sandy
      '#98D8C8', // Mint
      '#FFD93D', // Gold
    ];

    if (!userId) return colors[0];

    // Generate hash from userId for consistent color
    let hash = 0;
    const idStr = userId.toString();
    for (let i = 0; i < idStr.length; i++) {
      hash = ((hash << 5) - hash + idStr.charCodeAt(i)) & 0xffffffff;
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';

    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return '';
  };

  // Helper function to get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.trim().split(' ')[0];
  };

  // Helper function to find real user name from their item interactions
  const getRealUserName = (userId, listItems) => {
    if (!userId || !listItems) return null;

    // Find any item checked or added by this user
    const userItem = listItems.find(item =>
      item.checked_by === userId || item.added_by === userId
    );

    return userItem?.checked_by_name || userItem?.added_by_name;
  };

  // Helper function to get display name with fallbacks
  const getDisplayName = (member, listItems) => {
    // First try to get the real user name from their item interactions
    const realName = getRealUserName(member?.user_id, listItems);
    if (realName) {
      return realName;
    }

    // Then try the invited_by_name (but skip "Share Link")
    if (member?.invited_by_name && member.invited_by_name !== 'Share Link') {
      return member.invited_by_name;
    }

    // Then try user object if it exists
    if (member?.user?.first_name) {
      return member.user.first_name;
    }

    if (member?.user?.email) {
      // Extract name from email (everything before @)
      const emailName = member.user.email.split('@')[0];
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    // Fall back to invited_by_name even if it's "Share Link"
    if (member?.invited_by_name) {
      return member.invited_by_name;
    }

    return 'Unknown User';
  };

  // Color assignment storage key
  const COLOR_STORAGE_KEY = 'shopping_list_colors';

  // Get stored color assignments
  const getStoredColors = () => {
    try {
      const stored = localStorage.getItem(COLOR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  // Store color assignment for a list
  const storeListColor = (listId, colorIndex) => {
    try {
      const colors = getStoredColors();
      colors[listId] = colorIndex;
      localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(colors));
    } catch (err) {
      console.warn('Failed to store list color:', err);
    }
  };

  // Generate color for new lists avoiding recently used colors
  const getNextAvailableColor = () => {
    const totalColors = 6;
    const myLists = lists.filter(list => list.is_owner === true);

    if (myLists.length === 0) {
      return 0; // First list gets color 0
    }

    // Get colors currently in use by existing lists
    const storedColors = getStoredColors();
    const usedColors = new Set();

    myLists.forEach(list => {
      const color = storedColors[list.id] !== undefined
        ? storedColors[list.id]
        : getListColorFromId(list.id);
      usedColors.add(color);
    });

    // Find first unused color
    for (let i = 0; i < totalColors; i++) {
      if (!usedColors.has(i)) {
        return i;
      }
    }

    // If all colors are used, cycle through them
    return myLists.length % totalColors;
  };

  // Generate consistent color based on list ID (fallback for lists without stored colors)
  const getListColorFromId = (listId) => {
    if (!listId) return 0;
    // Simple hash function to convert ID to color index
    let hash = 0;
    const idStr = listId.toString();
    for (let i = 0; i < idStr.length; i++) {
      hash = ((hash << 5) - hash + idStr.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 6;
  };

  // Main color function - use for all lists
  const getListColor = (listId) => {
    const storedColors = getStoredColors();

    // Use stored color if available, otherwise fall back to ID-based color
    return storedColors[listId] !== undefined
      ? storedColors[listId]
      : getListColorFromId(listId);
  };

  // Helper function to format checked by text
  const getCheckedByText = (item) => {
    if (!item.is_checked || !item.checked_by_name) return null;

    const firstName = getFirstName(item.checked_by_name);
    const timeAgo = formatTimeAgo(item.checked_at);

    if (timeAgo && timeAgo !== '') {
      return `${firstName} • ${timeAgo}`;
    }
    return firstName;
  };

  if (loading && lists.length === 0) {
    return (
      <div className="shopping-list-section__loading">
        <p>Loading shopping lists...</p>
      </div>
    );
  }

  return (
    <div className="shopping-list-section">
      {/* Shopping List Content */}
      <div className="shopping-list-section__content">
        {/* Show list of lists */}
        {(() => {
          // Separate lists into owned and shared
          const myLists = lists.filter(list => list.is_owner === true);
          const sharedLists = lists.filter(list => list.is_owner === false);

          return (
            <>
              {/* My Lists Section */}
              <div className="shopping-list-section__header">
                <h2 className="shopping-list-section__title">My Lists</h2>
                <button
                  className="shopping-list-section__add-btn"
                  onClick={() => setShowCreateModal(true)}
                  title="Create new list"
                >
                  +
                </button>
              </div>

              <div className="shopping-list-section__lists">
                {myLists.length === 0 ? (
                  <div className="shopping-list-section__empty">
                    <p>No lists created yet</p>
                    <button
                      className="shopping-list-section__create-first-btn"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Create your first list
                    </button>
                  </div>
                ) : (
                  myLists.map((list) => (
                    <div key={list.id} className={`shopping-list-section__list-card shopping-list-section__list-card--color-${getListColor(list.id)}`}>
                      <div
                        className="shopping-list-section__list-main"
                        onClick={() => {
                          navigate(`/shopping-list/${list.id}`);
                        }}
                      >
                        <h3 className="shopping-list-section__list-name">{list.name}</h3>
                        <div className="shopping-list-section__list-meta">
                          <span className="shopping-list-section__meta-item">
                            {list.total_items || 0} {(list.total_items || 0) === 1 ? 'item' : 'items'}
                          </span>
                          {list.checked_items > 0 && (
                            <span className="shopping-list-section__meta-item shopping-list-section__checked-count">
                              {list.checked_items} checked
                            </span>
                          )}
                          {list.member_count > 1 && (
                            <span className={`shopping-list-section__shared-badge shopping-list-section__shared-badge--color-${getListColor(list.id)}`}>
                              <span className="shopping-list-section__shared-count">{list.member_count}</span> Shared
                            </span>
                          )}
                        </div>
                        {list.updated_at && (
                          <div className="shopping-list-section__list-updated">
                            Last updated: {new Date(list.updated_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        className="shopping-list-section__more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBottomSheetListId(list.id);
                          setShowBottomSheet(true);
                        }}
                      >
                        ⋮
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Shared Lists Section */}
              <div className="shopping-list-section__shared-header">
                <h2 className="shopping-list-section__title">Shared Lists</h2>
                <button
                  className="shopping-list-section__join-header-btn"
                  onClick={() => setShowJoinModal(true)}
                  title="Join shared list"
                >
                  Join
                </button>
              </div>

              <div className="shopping-list-section__lists">
                {sharedLists.length === 0 ? (
                  <div className="shopping-list-section__empty">
                    <p>No shared lists yet</p>
                    <p className="shopping-list-section__empty-hint">Click "Join" above to join a shared list</p>
                  </div>
                ) : (
                  sharedLists.map((list) => (
                    <div key={list.id} className={`shopping-list-section__list-card shopping-list-section__list-card--color-${getListColor(list.id)}`}>
                      <div
                        className="shopping-list-section__list-main"
                        onClick={() => {
                          navigate(`/shopping-list/${list.id}`);
                        }}
                      >
                        <h3 className="shopping-list-section__list-name">{list.name}</h3>
                        <div className="shopping-list-section__list-meta">
                          <span className="shopping-list-section__meta-item">
                            {list.total_items || 0} {(list.total_items || 0) === 1 ? 'item' : 'items'}
                          </span>
                          {list.checked_items > 0 && (
                            <span className="shopping-list-section__meta-item shopping-list-section__checked-count">
                              {list.checked_items} checked
                            </span>
                          )}
                          {list.member_count > 1 && (
                            <span className={`shopping-list-section__shared-badge shopping-list-section__shared-badge--color-${getListColor(list.id)}`}>
                              <span className="shopping-list-section__shared-count">{list.member_count}</span> Shared
                            </span>
                          )}
                        </div>
                        {list.updated_at && (
                          <div className="shopping-list-section__list-updated">
                            Last updated: {new Date(list.updated_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        className="shopping-list-section__more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBottomSheetListId(list.id);
                          setShowBottomSheet(true);
                        }}
                      >
                        ⋮
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          );
        })()}

      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="shopping-list-section__modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="shopping-list-section__modal" onClick={e => e.stopPropagation()}>
            <h3>Create New List</h3>
            <input
              type="text"
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              autoFocus
            />
            <div className="shopping-list-section__modal-buttons">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={handleCreateList} disabled={!newListName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <div className="shopping-list-section__bottom-sheet-overlay" onClick={() => setShowBottomSheet(false)}>
          <div className="shopping-list-section__bottom-sheet" onClick={e => e.stopPropagation()}>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={() => {
                const list = lists.find(l => l.id === bottomSheetListId);
                if (list) handleOpenShareModal(list);
              }}
            >
              <span>SHARE LIST</span>
              <Users size={20} />
            </button>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={handleRefreshList}
            >
              <span>REFRESH LIST</span>
              <RefreshCw size={20} />
            </button>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={() => {
                if (bottomSheetListId) {
                  handleClearCompleted(bottomSheetListId);
                  setShowBottomSheet(false);
                }
              }}
            >
              <span>CLEAR COMPLETED</span>
              <Check size={20} />
            </button>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={() => {
                if (bottomSheetListId) {
                  handleDeleteList(bottomSheetListId);
                }
              }}
            >
              <span>DELETE LIST</span>
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareListModal
        list={listToShare}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setListToShare(null);
        }}
        onShare={handleShareList}
      />

      {/* Join List Modal */}
      <JoinListModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};

export default ShoppingListSection;