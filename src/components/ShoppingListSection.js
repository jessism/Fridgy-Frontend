import React, { useState, useEffect } from 'react';
import useShoppingLists from '../hooks/useShoppingLists';
import ShareListModal from './modals/ShareListModal';
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
  const [itemInput, setItemInput] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemCategory, setItemCategory] = useState('Other');
  const [showShareModal, setShowShareModal] = useState(false);
  const [listToShare, setListToShare] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetListId, setBottomSheetListId] = useState(null);
  const [editingListNameId, setEditingListNameId] = useState(null);
  const [tempListName, setTempListName] = useState('');

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
    if (selectedListId && !editingListId) {
      getList(selectedListId).then(list => {
        setSelectedList(list);
      }).catch(err => {
        console.error('Failed to load list:', err);
      });
    }
  }, [selectedListId, editingListId, getList]);

  const handleCreateList = async () => {
    if (newListName.trim()) {
      try {
        const newList = await createList(newListName);
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
    if (itemInput.trim() && editingListId) {
      try {
        await addItem(editingListId, {
          name: itemInput,
          quantity: itemQuantity || '1',
          category: itemCategory
        });

        // Refresh the list
        const updatedList = await getList(editingListId);
        setSelectedList(updatedList);

        // Clear inputs
        setItemInput('');
        setItemQuantity('');
        setItemCategory('Other');
      } catch (err) {
        alert('Failed to add item. Please try again.');
      }
    }
  };

  const handleToggleItem = async (listId, itemId) => {
    try {
      await toggleItem(listId, itemId);
      // Refresh the list
      const updatedList = await getList(listId);
      setSelectedList(updatedList);

      // Also refresh the main lists to update counts
      fetchLists();
    } catch (err) {
      console.error('Failed to toggle item:', err);
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
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteList(listId);
        setSelectedListId(null);
        setSelectedList(null);
        setEditingListId(null);
        setShowBottomSheet(false);
      } catch (err) {
        alert('Failed to delete list. Only owners can delete lists.');
      }
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        {!editingListId && !selectedListId && (
          <>
            <div className="shopping-list-section__header">
              <h2 className="shopping-list-section__title">Create your list</h2>
              <button
                className="shopping-list-section__add-btn"
                onClick={() => setShowCreateModal(true)}
                title="Create new list"
              >
                +
              </button>
            </div>

            <div className="shopping-list-section__lists">
              {lists.length === 0 ? (
                <div className="shopping-list-section__empty">
                  <p>No shopping lists yet</p>
                  <button
                    className="shopping-list-section__create-first-btn"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create your first list
                  </button>
                </div>
              ) : (
                lists.map(list => (
                  <div key={list.id} className="shopping-list-section__list-card">
                    <div
                      className="shopping-list-section__list-main"
                      onClick={() => {
                        setSelectedListId(list.id);
                        setEditingListId(list.id);
                      }}
                    >
                      <h3 className="shopping-list-section__list-name">{list.name}</h3>
                      <div className="shopping-list-section__list-meta">
                        <span>{list.total_items || 0} items</span>
                        {list.checked_items > 0 && (
                          <span className="shopping-list-section__checked-count">
                            ({list.checked_items} checked)
                          </span>
                        )}
                        {list.member_count > 1 && (
                          <span className="shopping-list-section__shared-badge">
                            👥 Shared
                          </span>
                        )}
                      </div>
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
        )}

        {/* Edit mode for a list */}
        {editingListId && selectedList && (
          <div className="shopping-list-section__edit-mode">
            <div className="shopping-list-section__edit-header">
              <button
                className="shopping-list-section__back-btn"
                onClick={() => {
                  setEditingListId(null);
                  setSelectedListId(null);
                  setSelectedList(null);
                }}
              >
                ← Back
              </button>
              {editingListNameId === selectedList.id ? (
                <div className="shopping-list-section__edit-name">
                  <input
                    type="text"
                    value={tempListName}
                    onChange={(e) => setTempListName(e.target.value)}
                    onBlur={handleSaveListName}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveListName()}
                    className="shopping-list-section__name-input"
                    autoFocus
                  />
                </div>
              ) : (
                <h2
                  className="shopping-list-section__edit-title"
                  onClick={() => {
                    setEditingListNameId(selectedList.id);
                    setTempListName(selectedList.name);
                  }}
                >
                  {selectedList.name}
                </h2>
              )}
              <button
                className="shopping-list-section__more-btn"
                onClick={() => {
                  setBottomSheetListId(selectedList.id);
                  setShowBottomSheet(true);
                }}
              >
                ⋮
              </button>
            </div>

            {/* Add item form */}
            <div className="shopping-list-section__add-item-form">
              <input
                type="text"
                placeholder="Add item..."
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                className="shopping-list-section__item-input"
              />
              <input
                type="text"
                placeholder="Qty"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                className="shopping-list-section__quantity-input"
              />
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="shopping-list-section__category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={handleAddItem}
                className="shopping-list-section__add-item-btn"
                disabled={!itemInput.trim()}
              >
                Add
              </button>
            </div>

            {/* Items list */}
            <div className="shopping-list-section__items">
              {selectedList.shopping_list_items && selectedList.shopping_list_items.length > 0 ? (
                selectedList.shopping_list_items.map(item => (
                  <div key={item.id} className={`shopping-list-section__item ${item.is_checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={item.is_checked}
                      onChange={() => handleToggleItem(selectedList.id, item.id)}
                      className="shopping-list-section__item-checkbox"
                    />
                    <div className="shopping-list-section__item-details">
                      <span className="shopping-list-section__item-name">
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="shopping-list-section__item-quantity">
                          {item.quantity} {item.unit}
                        </span>
                      )}
                      {item.is_checked && item.checked_by_name && (
                        <span className="shopping-list-section__checked-by">
                          ✓ {getInitials(item.checked_by_name)}
                        </span>
                      )}
                    </div>
                    <span className="shopping-list-section__item-category">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(selectedList.id, item.id)}
                      className="shopping-list-section__item-delete"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="shopping-list-section__no-items">No items in this list yet</p>
              )}
            </div>

            {/* Members section if shared */}
            {selectedList.shopping_list_members && selectedList.shopping_list_members.length > 1 && (
              <div className="shopping-list-section__members">
                <h4>Shared with:</h4>
                {selectedList.shopping_list_members.map(member => (
                  <div key={member.id} className="shopping-list-section__member">
                    <span>{member.user?.first_name} {member.user?.last_name}</span>
                    {member.role === 'owner' && <span className="shopping-list-section__owner-badge">Owner</span>}
                  </div>
                ))}
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
    </div>
  );
};

export default ShoppingListSection;