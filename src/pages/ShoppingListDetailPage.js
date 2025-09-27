import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useShoppingLists from '../hooks/useShoppingLists';
import ShareListModal from '../components/modals/ShareListModal';
import { ChevronLeft, Users, Check, Trash2, RefreshCw } from 'lucide-react';
import '../components/ShoppingListSection.css';

const ShoppingListDetailPage = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    lists,
    getList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    toggleItem,
    deleteItem: deleteItemFromList,
    clearCompleted,
    shareList,
    fetchLists
  } = useShoppingLists();

  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [listToShare, setListToShare] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [editingListNameId, setEditingListNameId] = useState(null);
  const [tempListName, setTempListName] = useState('');
  const [togglingItemId, setTogglingItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [tempItemName, setTempItemName] = useState('');
  const [tempItemQuantity, setTempItemQuantity] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [recentlyCheckedItems, setRecentlyCheckedItems] = useState([]);

  // Refs for direct DOM access - instant operations
  const itemNameInputRef = useRef(null);
  const itemAmountInputRef = useRef(null);
  const listTitleInputRef = useRef(null);
  const editItemNameInputRef = useRef(null);
  const editItemQuantityInputRef = useRef(null);
  const delayedMoveTimersRef = useRef(new Map());

  // Load list details - use navigation state first, fallback to API
  useEffect(() => {
    if (listId) {
      // Check if we have list data from navigation state (instant loading)
      if (location.state?.listData) {
        console.log('Using navigation state data for instant loading');
        setSelectedList(location.state.listData);
        setLoading(false);
      } else {
        // Fallback to API call if no navigation state
        console.log('No navigation data, fetching from API');
        setLoading(true);
        getList(listId).then(list => {
          setSelectedList(list);
          setLoading(false);
        }).catch(err => {
          console.error('Failed to load list:', err);
          setLoading(false);
          // Navigate back if list not found
          navigate('/inventory/shopping-list');
        });
      }
    }
  }, [listId, location.state, getList, navigate]);

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
          getList(listId).then(list => {
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
  }, [selectedList, listId, getList, fetchLists]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      delayedMoveTimersRef.current.forEach(timer => clearTimeout(timer));
      delayedMoveTimersRef.current.clear();
    };
  }, []);

  const handleAddItem = async () => {
    // Read directly from DOM refs - no state delay
    const tempName = itemNameInputRef.current?.value?.trim();
    const tempAmount = itemAmountInputRef.current?.value?.trim() || '1';

    if (tempName && selectedList) {
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
        const realItem = await addItem(selectedList.id, {
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

    // Find the current item to check if it's being checked or unchecked
    const currentItem = selectedList.shopping_list_items.find(item => item.id === itemId);
    const isBeingChecked = currentItem && !currentItem.is_checked;

    // Optimistic update - immediately toggle the item in local state
    const originalList = selectedList;
    setSelectedList(prevList => ({
      ...prevList,
      shopping_list_items: prevList.shopping_list_items.map(item =>
        item.id === itemId
          ? {
              ...item,
              is_checked: !item.is_checked,
              checked_at: !item.is_checked ? new Date().toISOString() : null,
              checked_by_name: !item.is_checked ? 'You' : null // Temporary placeholder
            }
          : item
      )
    }));

    // If item is being checked (unchecked -> checked), add to recently checked items
    if (isBeingChecked) {
      // Clear any existing timer for this item
      if (delayedMoveTimersRef.current.has(itemId)) {
        clearTimeout(delayedMoveTimersRef.current.get(itemId));
      }

      // Add to recently checked items (prevents immediate sorting to bottom)
      setRecentlyCheckedItems(prev => [...prev.filter(id => id !== itemId), itemId]);

      // Set timer to remove from recently checked items after 800ms
      const timer = setTimeout(() => {
        setRecentlyCheckedItems(prev => prev.filter(id => id !== itemId));
        delayedMoveTimersRef.current.delete(itemId);
      }, 800);

      delayedMoveTimersRef.current.set(itemId, timer);
    } else {
      // If item is being unchecked, remove from recently checked items immediately
      setRecentlyCheckedItems(prev => prev.filter(id => id !== itemId));
      if (delayedMoveTimersRef.current.has(itemId)) {
        clearTimeout(delayedMoveTimersRef.current.get(itemId));
        delayedMoveTimersRef.current.delete(itemId);
      }
    }

    try {
      console.log('Calling toggleItem...');
      await toggleItem(listId, itemId);
      console.log('Toggle successful');

      // Refresh the main lists to update counts
      fetchLists();

      // Get the updated item details from server (for accurate checked_by_name, etc.)
      const updatedList = await getList(listId);
      setSelectedList(updatedList);
    } catch (err) {
      console.error('Failed to toggle item - Full error:', err);

      // Revert optimistic update on error
      setSelectedList(originalList);
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
      // Navigate back to shopping list overview after deletion
      navigate('/inventory/shopping-list');
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

  const handleRefreshList = async () => {
    if (selectedList) {
      try {
        const updatedList = await getList(selectedList.id);
        setSelectedList(updatedList);
        fetchLists(); // Also refresh main lists
        setShowBottomSheet(false);
      } catch (err) {
        alert('Failed to refresh list. Please try again.');
      }
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
        // Update the selectedList state to reflect the change immediately
        if (selectedList && selectedList.id === editingListNameId) {
          setSelectedList({ ...selectedList, name: tempListName.trim() });
        }
        setEditingListNameId(null);
        setTempListName('');
        fetchLists(); // Refresh lists
      } catch (err) {
        alert('Failed to update list name. Please try again.');
      }
    }
  };

  const handleDoubleClickTitle = () => {
    if (selectedList) {
      setEditingListNameId(selectedList.id);
      setTempListName(selectedList.name);
      // Use setTimeout to ensure the input is rendered before focusing
      setTimeout(() => {
        if (listTitleInputRef.current) {
          listTitleInputRef.current.focus();
          listTitleInputRef.current.select(); // Select all text
        }
      }, 0);
    }
  };

  const handleCancelEditListName = () => {
    setEditingListNameId(null);
    setTempListName('');
  };

  const handleListNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveListName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditListName();
    }
  };

  // Item editing handlers
  const handleStartEditItem = (item, focusField = 'name') => {
    setEditingItemId(item.id);
    setTempItemName(item.name);
    setTempItemQuantity(item.quantity || '');
    // Use setTimeout to ensure the input is rendered before focusing
    setTimeout(() => {
      if (focusField === 'quantity' && editItemQuantityInputRef.current) {
        editItemQuantityInputRef.current.focus();
        editItemQuantityInputRef.current.select();
      } else if (editItemNameInputRef.current) {
        editItemNameInputRef.current.focus();
        editItemNameInputRef.current.select();
      }
    }, 0);
  };

  const handleSaveItemEdit = async () => {
    if (editingItemId && tempItemName.trim()) {
      setUpdatingItemId(editingItemId);

      try {
        const updates = {
          name: tempItemName.trim(),
          quantity: tempItemQuantity.trim() || null
        };

        await updateItem(selectedList.id, editingItemId, updates);

        // Update the local state optimistically
        setSelectedList(prevList => ({
          ...prevList,
          shopping_list_items: prevList.shopping_list_items.map(item =>
            item.id === editingItemId
              ? { ...item, ...updates }
              : item
          )
        }));

        // Reset edit state
        setEditingItemId(null);
        setTempItemName('');
        setTempItemQuantity('');
      } catch (err) {
        console.error('Failed to update item:', err);
        alert('Failed to update item. Please try again.');
      } finally {
        setUpdatingItemId(null);
      }
    }
  };

  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setTempItemName('');
    setTempItemQuantity('');
  };

  const handleItemNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveItemEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelItemEdit();
    } else if (e.key === 'Tab') {
      // Allow tab to move to quantity field
      e.preventDefault();
      editItemQuantityInputRef.current?.focus();
    }
  };

  const handleItemQuantityKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveItemEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelItemEdit();
    }
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

  if (loading) {
    return (
      <div className="shopping-list-section__loading">
        <p>Loading shopping list...</p>
      </div>
    );
  }

  if (!selectedList) {
    return (
      <div className="shopping-list-section__loading">
        <p>Shopping list not found.</p>
      </div>
    );
  }

  return (
    <div className="shopping-list-section">
      <div className="shopping-list-section__content">
        {/* Edit mode for a list */}
        <div className="shopping-list-section__edit-mode">
          <div className="shopping-list-section__edit-header">
            <button
              className="shopping-list-section__back-icon"
              onClick={() => navigate('/inventory/shopping-list')}
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            {editingListNameId === selectedList.id ? (
              <input
                ref={listTitleInputRef}
                type="text"
                value={tempListName}
                onChange={(e) => setTempListName(e.target.value)}
                onKeyDown={handleListNameKeyPress}
                onBlur={handleSaveListName}
                className="shopping-list-section__list-title-input"
              />
            ) : (
              <h1
                className="shopping-list-section__list-title"
                onClick={handleDoubleClickTitle}
              >
                {selectedList.name}
              </h1>
            )}
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
                onClick={() => setShowBottomSheet(true)}
                aria-label="More options"
              >
                ⋮
              </button>
            </div>
          </div>

          {/* Add item form at the top */}
          <div className="shopping-list-section__item-minimal shopping-list-section__item-input">
            <span className="shopping-list-section__item-circle"></span>
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
              // Sort items: unchecked first, then checked (but keep recently checked in place)
              [...selectedList.shopping_list_items]
                .sort((a, b) => {
                  const aIsRecentlyChecked = recentlyCheckedItems.includes(a.id);
                  const bIsRecentlyChecked = recentlyCheckedItems.includes(b.id);

                  // Treat recently checked items as unchecked for sorting purposes
                  const aEffectivelyChecked = a.is_checked && !aIsRecentlyChecked;
                  const bEffectivelyChecked = b.is_checked && !bIsRecentlyChecked;

                  if (aEffectivelyChecked === bEffectivelyChecked) return 0;
                  return aEffectivelyChecked ? 1 : -1;
                })
                .map(item => (
                  <div key={item.id} className={`shopping-list-section__item-minimal ${item.is_checked ? 'shopping-list-section__item-minimal--checked' : ''}`}>
                    <span
                      className={`shopping-list-section__item-circle ${item.is_checked ? 'shopping-list-section__item-circle--checked' : ''} ${togglingItemId === item.id ? 'shopping-list-section__item-circle--loading' : ''}`}
                      onClick={() => handleToggleItem(selectedList.id, item.id)}
                      style={{ opacity: togglingItemId === item.id ? 0.5 : 1 }}
                    >
                    </span>
                    <div className="shopping-list-section__item-info">
                      {editingItemId === item.id ? (
                        // Edit mode - show input fields
                        <>
                          <input
                            ref={editItemNameInputRef}
                            type="text"
                            value={tempItemName}
                            onChange={(e) => setTempItemName(e.target.value)}
                            onKeyDown={handleItemNameKeyPress}
                            onBlur={handleSaveItemEdit}
                            className="shopping-list-section__item-name-input"
                            disabled={updatingItemId === item.id}
                          />
                          <input
                            ref={editItemQuantityInputRef}
                            type="text"
                            value={tempItemQuantity}
                            onChange={(e) => setTempItemQuantity(e.target.value)}
                            onKeyDown={handleItemQuantityKeyPress}
                            onBlur={handleSaveItemEdit}
                            className="shopping-list-section__item-amount-input"
                            placeholder="1"
                            disabled={updatingItemId === item.id}
                          />
                        </>
                      ) : (
                        // Display mode - show text with click handlers
                        <>
                          <div
                            className="shopping-list-section__item-name-line shopping-list-section__item-name-line--editable"
                            onClick={() => !item.is_checked && handleStartEditItem(item, 'name')}
                          >
                            {item.name}
                          </div>
                          <div
                            className="shopping-list-section__item-amount-line shopping-list-section__item-amount-line--editable"
                            onClick={() => !item.is_checked && handleStartEditItem(item, 'quantity')}
                          >
                            {item.quantity ? `${item.quantity} ${item.unit || ''}` : 'Add quantity'}
                          </div>
                        </>
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
                        {getInitials(owner, selectedList.shopping_list_items)}
                      </div>
                      <div className="shopping-list-section__member-info">
                        <div className="shopping-list-section__member-name">
                          {getDisplayName(owner, selectedList.shopping_list_items)}
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
                            {getInitials(member, selectedList.shopping_list_items)}
                          </div>
                          <div className="shopping-list-section__member-info">
                            <div className="shopping-list-section__member-name">
                              {getDisplayName(member, selectedList.shopping_list_items)}
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
      </div>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <div className="shopping-list-section__bottom-sheet-overlay" onClick={() => setShowBottomSheet(false)}>
          <div className="shopping-list-section__bottom-sheet" onClick={e => e.stopPropagation()}>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={() => handleOpenShareModal(selectedList)}
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
                handleClearCompleted(selectedList.id);
                setShowBottomSheet(false);
              }}
            >
              <span>CLEAR COMPLETED</span>
              <Check size={20} />
            </button>
            <button
              className="shopping-list-section__bottom-sheet-option"
              onClick={() => {
                handleDeleteList(selectedList.id);
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
    </div>
  );
};

export default ShoppingListDetailPage;