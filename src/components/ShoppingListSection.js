import React, { useState, useEffect, useRef } from 'react';
import useShoppingLists from '../hooks/useShoppingLists';
import ShareListModal from './modals/ShareListModal';
import JoinListModal from './modals/JoinListModal';
import './ShoppingListSection.css';

const ShoppingListSection = () => {
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

  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemCategory, setItemCategory] = useState('Other');
  const [showShareModal, setShowShareModal] = useState(false);
  const [listToShare, setListToShare] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetListId, setBottomSheetListId] = useState(null);
  const [editingListNameId, setEditingListNameId] = useState(null);
  const [tempListName, setTempListName] = useState('');
  const [togglingItemId, setTogglingItemId] = useState(null); // Track which item is being toggled

  // Refs for direct DOM access - instant operations
  const itemNameInputRef = useRef(null);
  const itemAmountInputRef = useRef(null);

  // Categories for dropdown
  const categories = ['Other', 'Fruits', 'Vegetables', 'Dairy', 'Protein', 'Grains', 'Beverages', 'Snacks'];

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

  // Load full list details when selecting a list
  useEffect(() => {
    if (selectedListId) {
      getList(selectedListId).then(list => {
        setSelectedList(list);
      }).catch(err => {
        console.error('Failed to load list:', err);
      });
    }
  }, [selectedListId, getList]);

  // Auto-refresh shared lists when returning to app
  useEffect(() => {
    // Only for shared lists
    if (!selectedList?.shopping_list_members || selectedList.shopping_list_members.length <= 1) {
      return;
    }

    let lastRefresh = Date.now();

    const handleVisibilityChange = () => {
      // When user returns to the app/tab
      if (document.visibilityState === 'visible') {
        const timeSinceRefresh = Date.now() - lastRefresh;

        // Only refresh if been away for 30+ seconds
        if (timeSinceRefresh > 30000) {
          console.log('Refreshing shared list after returning to app');
          getList(selectedListId).then(list => {
            setSelectedList(list);
            lastRefresh = Date.now();
            // Also refresh the main lists to update counts
            fetchLists();
          }).catch(err => {
            console.error('Failed to refresh list on return:', err);
          });
        }
      }
    };

    // Listen for both visibility change and focus events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [selectedList, selectedListId, getList, fetchLists]);

  // Auto-refresh list counts when returning to main list view
  useEffect(() => {
    // Only when viewing the main list (not inside a specific list)
    if (selectedListId || editingListId) {
      return;
    }

    let lastRefresh = Date.now();

    const handleMainViewVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceRefresh = Date.now() - lastRefresh;

        // Refresh if been away for 30+ seconds
        if (timeSinceRefresh > 30000) {
          console.log('Refreshing list counts after returning to app');
          fetchLists();
          lastRefresh = Date.now();
        }
      }
    };

    document.addEventListener('visibilitychange', handleMainViewVisibilityChange);
    window.addEventListener('focus', handleMainViewVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleMainViewVisibilityChange);
      window.removeEventListener('focus', handleMainViewVisibilityChange);
    };
  }, [selectedListId, editingListId, fetchLists]);

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
        // Immediately enter edit mode for the new list
        setSelectedListId(newList.id);
        setEditingListId(newList.id);
      } catch (err) {
        alert('Failed to create list. Please try again.');
      }
    }
  };

  const handleAddItem = async () => {
    // Read directly from DOM refs - no state delay
    const tempName = itemNameInputRef.current?.value?.trim();
    const tempAmount = itemAmountInputRef.current?.value?.trim() || '1';

    if (tempName && editingListId) {
      // Clear inputs via DOM - instant, no React re-render
      if (itemNameInputRef.current) itemNameInputRef.current.value = '';
      if (itemAmountInputRef.current) itemAmountInputRef.current.value = '';

      // Keep focus on name input - no blur/focus cycle
      itemNameInputRef.current?.focus();

      // Generate temporary ID for instant UI update
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const tempItem = {
        id: tempId,
        name: tempName,
        quantity: tempAmount,
        unit: '',
        category: 'Other',
        is_checked: false
      };

      // Add temporary item for instant feedback
      setSelectedList(prevList => ({
        ...prevList,
        shopping_list_items: [tempItem, ...(prevList.shopping_list_items || [])]
      }));

      try {
        // Make API call and wait for real item with database ID
        const realItem = await addItem(editingListId, {
          name: tempName,
          quantity: tempAmount,
          category: 'Other'
        });

        // Replace temporary item with real item from backend
        if (realItem) {
          setSelectedList(prevList => ({
            ...prevList,
            shopping_list_items: prevList.shopping_list_items.map(item =>
              item.id === tempId ? realItem : item
            )
          }));
          console.log('Item added successfully with ID:', realItem.id);
        }
      } catch (err) {
        // On error, remove the optimistic item and restore inputs
        console.error('Failed to add item:', err);
        setSelectedList(prevList => ({
          ...prevList,
          shopping_list_items: prevList.shopping_list_items.filter(item => item.id !== tempId)
        }));
        // Restore values to DOM refs
        if (itemNameInputRef.current) itemNameInputRef.current.value = tempName;
        if (itemAmountInputRef.current) itemAmountInputRef.current.value = tempAmount;
        alert('Failed to add item. Your input has been restored.');
      }
    }
  };

  // Handle Enter key on item field - move to amount field
  const handleItemKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move focus to amount field using ref - instant, no DOM search
      itemAmountInputRef.current?.focus();
    }
  };

  // Handle Enter key on amount field - add item
  const handleAmountKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleToggleItem = async (listId, itemId) => {
    console.log('handleToggleItem called with:', { listId, itemId });

    // Prevent multiple simultaneous toggles
    if (togglingItemId === itemId) {
      console.log('Already toggling this item, ignoring click');
      return;
    }

    setTogglingItemId(itemId);

    try {
      console.log('Calling toggleItem...');
      await toggleItem(listId, itemId);
      console.log('Toggle successful, refreshing list...');

      // Refresh the list
      const updatedList = await getList(listId);
      console.log('Updated list received:', updatedList);
      setSelectedList(updatedList);

      // Also refresh the main lists to update counts
      fetchLists();
    } catch (err) {
      console.error('Failed to toggle item - Full error:', err);
      alert(`Failed to toggle item: ${err.message || 'Unknown error'}`);
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    try {
      await deleteItemFromList(listId, itemId);
      // Refresh the list
      const updatedList = await getList(listId);
      setSelectedList(updatedList);
    } catch (err) {
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      setSelectedListId(null);
      setSelectedList(null);
      setEditingListId(null);
      setShowBottomSheet(false);
    } catch (err) {
      alert('Failed to delete list. Only owners can delete lists.');
    }
  };

  const handleClearCompleted = async (listId) => {
    try {
      const cleared = await clearCompleted(listId);
      // Refresh the list
      const updatedList = await getList(listId);
      setSelectedList(updatedList);
      alert(`Cleared ${cleared} completed items`);
    } catch (err) {
      alert('Failed to clear completed items. Please try again.');
    }
  };

  const handleShareList = async (listId, emails) => {
    try {
      await shareList(listId, emails);
      alert('List shared successfully!');
      // Refresh the list to show new members
      const updatedList = await getList(listId);
      setSelectedList(updatedList);
      setListToShare(updatedList);
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const handleOpenShareModal = (list) => {
    setListToShare(list);
    setShowShareModal(true);
    setShowBottomSheet(false);
  };

  const handleSaveListName = async () => {
    if (tempListName.trim() && editingListNameId) {
      try {
        await updateList(editingListNameId, { name: tempListName.trim() });
        setEditingListNameId(null);
        setTempListName('');
        fetchLists(); // Refresh lists
      } catch (err) {
        alert('Failed to update list name. Please try again.');
      }
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';

    if (first && last) {
      return first + last;
    } else if (first) {
      return first + firstName?.charAt(1)?.toUpperCase() || first;
    } else if (lastName) {
      return lastName.substring(0, 2).toUpperCase();
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
        {/* Show list of lists when not editing */}
        {!editingListId && !selectedListId && (() => {
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
                          setSelectedListId(list.id);
                          setEditingListId(list.id);
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
                            <span className="shopping-list-section__shared-badge">
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
                          setSelectedListId(list.id);
                          setEditingListId(list.id);
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
                            <span className="shopping-list-section__shared-badge">
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

        {/* Edit mode for a list */}
        {editingListId && selectedList && (
          <div className="shopping-list-section__edit-mode">
            <div className="shopping-list-section__edit-header">
              <button
                className="shopping-list-section__back-icon"
                onClick={() => {
                  setEditingListId(null);
                  setSelectedListId(null);
                  setSelectedList(null);
                }}
                aria-label="Go back"
              >
                ←
              </button>
              <h1 className="shopping-list-section__list-title">
                {selectedList.name}
              </h1>
              <div className="shopping-list-section__header-actions">
                <button
                  className="shopping-list-section__add-icon"
                  onClick={() => document.querySelector('.shopping-list-section__item-name-input')?.focus()}
                  aria-label="Add item"
                >
                  +
                </button>
                <button
                  className="shopping-list-section__more-icon"
                  onClick={() => {
                    setBottomSheetListId(selectedList.id);
                    setShowBottomSheet(true);
                  }}
                  aria-label="More options"
                >
                  ⋮
                </button>
              </div>
            </div>

            {/* Add item form at the top */}
            <div className="shopping-list-section__item-minimal shopping-list-section__item-input">
              <span className="shopping-list-section__item-circle">○</span>
              <div className="shopping-list-section__item-info">
                <input
                  ref={itemNameInputRef}
                  type="text"
                  onKeyPress={handleItemKeyPress}
                  className="shopping-list-section__item-name-input"
                  placeholder=""
                  autoFocus
                />
                <input
                  ref={itemAmountInputRef}
                  type="text"
                  onKeyPress={handleAmountKeyPress}
                  className="shopping-list-section__item-amount-input"
                  placeholder=""
                />
              </div>
            </div>

            {/* Items list below the input */}
            <div className="shopping-list-section__items-clean">
              {selectedList.shopping_list_items && selectedList.shopping_list_items.length > 0 && (
                // Sort items: unchecked first, then checked
                [...selectedList.shopping_list_items]
                  .sort((a, b) => {
                    if (a.is_checked === b.is_checked) return 0;
                    return a.is_checked ? 1 : -1;
                  })
                  .map(item => (
                    <div key={item.id} className={`shopping-list-section__item-minimal ${item.is_checked ? 'shopping-list-section__item-minimal--checked' : ''}`}>
                      <span
                        className={`shopping-list-section__item-circle ${item.is_checked ? 'shopping-list-section__item-circle--checked' : ''} ${togglingItemId === item.id ? 'shopping-list-section__item-circle--loading' : ''}`}
                        onClick={() => handleToggleItem(selectedList.id, item.id)}
                        style={{ opacity: togglingItemId === item.id ? 0.5 : 1 }}
                      >
                        {togglingItemId === item.id ? '⟳' : (item.is_checked ? '✓' : '○')}
                      </span>
                      <div className="shopping-list-section__item-info">
                        <div className="shopping-list-section__item-name-line">
                          {item.name}
                        </div>
                        {item.quantity && (
                          <div className="shopping-list-section__item-amount-line">
                            {item.quantity} {item.unit || ''}
                          </div>
                        )}
                      </div>
                      {/* Show who checked the item in shared lists */}
                      {selectedList.shopping_list_members && selectedList.shopping_list_members.length > 1 && item.is_checked && item.checked_by_name && (
                        <div className="shopping-list-section__checked-by">
                          ✓ by {getCheckedByText(item)}
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteItem(selectedList.id, item.id)}
                        className="shopping-list-section__item-delete-btn"
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Members section if shared */}
            {selectedList.shopping_list_members && selectedList.shopping_list_members.length > 1 && (
              <div className="shopping-list-section__members">
                {/* List Owner Section */}
                {(() => {
                  const owner = selectedList.shopping_list_members.find(m => m.role === 'owner');
                  return owner && (
                    <div className="shopping-list-section__members-section">
                      <h5 className="shopping-list-section__members-title">List Owner</h5>
                      <div className="shopping-list-section__member-row">
                        <div
                          className="shopping-list-section__member-avatar shopping-list-section__member-avatar--owner"
                          style={{ backgroundColor: getAvatarColor(owner.user_id) }}
                        >
                          {owner.user?.first_name || owner.user?.last_name ?
                            getInitials(owner.user?.first_name, owner.user?.last_name) :
                            ''
                          }
                        </div>
                        <div className="shopping-list-section__member-info">
                          <div className="shopping-list-section__member-name">
                            {owner.user?.first_name || 'Unknown'} {owner.user?.last_name || ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Collaborators Section */}
                {(() => {
                  const collaborators = selectedList.shopping_list_members.filter(m => m.role !== 'owner');
                  return collaborators.length > 0 && (
                    <div className="shopping-list-section__members-section">
                      <h5 className="shopping-list-section__members-title">
                        Collaborators ({collaborators.length})
                      </h5>
                      <div className="shopping-list-section__members-grid">
                        {collaborators.map(member => (
                          <div key={member.id} className="shopping-list-section__member-row">
                            <div
                              className="shopping-list-section__member-avatar"
                              style={{ backgroundColor: getAvatarColor(member.user_id) }}
                            >
                              {member.user?.first_name || member.user?.last_name ?
                                getInitials(member.user?.first_name, member.user?.last_name) :
                                ''
                              }
                            </div>
                            <div className="shopping-list-section__member-info">
                              <div className="shopping-list-section__member-name">
                                {member.user?.first_name || 'Unknown'} {member.user?.last_name || ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
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
                const list = lists.find(l => l.id === bottomSheetListId) || selectedList;
                handleOpenShareModal(list);
              }}
            >
              <span>SHARE LIST</span>
              <span>👥</span>
            </button>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={() => {
                handleClearCompleted(bottomSheetListId || selectedList.id);
                setShowBottomSheet(false);
              }}
            >
              <span>CLEAR COMPLETED</span>
              <span>✓</span>
            </button>
            <button
              className="shopping-list-section__bottom-sheet-option shopping-list-section__bottom-sheet-option--danger"
              onClick={() => {
                handleDeleteList(bottomSheetListId || selectedList.id);
              }}
            >
              <span>DELETE LIST</span>
              <span>🗑</span>
            </button>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={() => setShowBottomSheet(false)}
            >
              <span>CANCEL</span>
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