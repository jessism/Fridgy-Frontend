import React, { useState } from 'react';
import { PlusIcon } from './icons';
import './ShoppingListSelectionModal.css';

const ShoppingListSelectionModal = ({
  isOpen,
  onClose,
  item,
  shoppingLists,
  onAddToExistingList,
  onCreateNewListAndAdd
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToList = async (listId, listName) => {
    try {
      await onAddToExistingList(listId, listName);
      onClose();
    } catch (error) {
      console.error('Failed to add item to list:', error);
    }
  };

  const handleCreateNewList = async () => {
    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateNewListAndAdd(newListName.trim());
      setNewListName('');
      setShowCreateForm(false);
      onClose();
    } catch (error) {
      console.error('Failed to create new list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateNewList();
    } else if (e.key === 'Escape') {
      setShowCreateForm(false);
      setNewListName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shopping-list-selection-modal__overlay" onClick={handleBackdropClick}>
      <div className="shopping-list-selection-modal__bottom-sheet">
        {/* Header */}
        <div className="shopping-list-selection-modal__header">
          <div className="shopping-list-selection-modal__handle"></div>
          <h3 className="shopping-list-selection-modal__title">
            Add "{item?.itemName}" to...
          </h3>
        </div>

        {/* Content */}
        <div className="shopping-list-selection-modal__content">
          {/* Existing Lists */}
          {shoppingLists && shoppingLists.length > 0 && (
            <div className="shopping-list-selection-modal__section">
              <h4 className="shopping-list-selection-modal__section-title">
                Existing Lists
              </h4>
              <div className="shopping-list-selection-modal__lists">
                {shoppingLists.map((list) => (
                  <button
                    key={list.id}
                    className="shopping-list-selection-modal__list-card"
                    onClick={() => handleAddToList(list.id, list.name)}
                  >
                    <div className="shopping-list-selection-modal__list-info">
                      <div className="shopping-list-selection-modal__list-name">
                        {list.name}
                      </div>
                      <div className="shopping-list-selection-modal__list-meta">
                        {list.total_items || 0} {(list.total_items || 0) === 1 ? 'item' : 'items'}
                        {list.member_count > 1 && (
                          <span className="shopping-list-selection-modal__shared-badge">
                            • Shared with {list.member_count - 1} others
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shopping-list-selection-modal__list-arrow">
                      →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create New List Section */}
          <div className="shopping-list-selection-modal__section">
            {!showCreateForm ? (
              <button
                className="shopping-list-selection-modal__create-btn"
                onClick={() => setShowCreateForm(true)}
              >
                <PlusIcon width={20} height={20} />
                <span>Create New List</span>
              </button>
            ) : (
              <div className="shopping-list-selection-modal__create-form">
                <h4 className="shopping-list-selection-modal__section-title">
                  Create New List
                </h4>
                <div className="shopping-list-selection-modal__form-group">
                  <input
                    type="text"
                    placeholder="Enter list name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="shopping-list-selection-modal__input"
                    autoFocus
                  />
                  <div className="shopping-list-selection-modal__form-actions">
                    <button
                      className="shopping-list-selection-modal__form-btn shopping-list-selection-modal__form-btn--cancel"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewListName('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="shopping-list-selection-modal__form-btn shopping-list-selection-modal__form-btn--create"
                      onClick={handleCreateNewList}
                      disabled={!newListName.trim() || isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create & Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListSelectionModal;