import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { EditIcon, DeleteIcon, PlusIcon } from '../components/icons';
import useInventory from '../hooks/useInventory';
import useShoppingLists from '../hooks/useShoppingLists';
import { useSubscription } from '../hooks/useSubscription';
import useFirstBatchCompletion from '../hooks/useFirstBatchCompletion';
import IOSInstallPrompt from '../components/IOSInstallPrompt';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { useGuidedTourContext } from '../contexts/GuidedTourContext';
import CelebrationModal from '../components/guided-tour/CelebrationModal';
import IntroductionModal from '../components/guided-tour/IntroductionModal';
import ShortcutInstallModal from '../components/guided-tour/ShortcutInstallModal';
import PushNotificationPromptModal from '../components/guided-tour/PushNotificationPromptModal';
import { isIOS } from '../utils/welcomeFlowHelpers';
import '../components/guided-tour/GuidedTour.css';
import { getItemIconIcons8, getExpiryStatus, formatQuantity } from '../assets/inventory_emojis/iconHelpers.js';
import IngredientImage from '../components/IngredientImage';
import ShoppingListSection from '../components/ShoppingListSection';
import ShoppingListSelectionModal from '../components/ShoppingListSelectionModal';
import './InventoryPage.css';

const InventoryPage = ({ defaultTab }) => {
  const { items: inventoryItems, loading, error, refreshInventory, deleteItem, updateItem } = useInventory();
  const { lists: shoppingLists, addItem: addToShoppingList, createList } = useShoppingLists();
  const { canAccess } = useSubscription();
  const { shouldShowTooltip, nextStep, dismissTour, completeTour, goToStep, STEPS, isActive, demoInventoryItems, isIndividualTour, isFullTour } = useGuidedTourContext();

  // Track first batch completion for PWA install prompt
  const { shouldShowInstallPrompt, dismissPrompt } = useFirstBatchCompletion(inventoryItems);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab || 'inventory'); // New state for tab navigation
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '', current: 0, limit: 0 });
  const [clickedIcon, setClickedIcon] = useState(null); // Track which icon was clicked
  const [selectedCategory, setSelectedCategory] = useState(null); // Track selected category from URL

  // Touch/swipe state for mobile navigation
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  // Shopping list selection modal state
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [selectedItemForList, setSelectedItemForList] = useState(null);

  // Show ONLY demo items during tour, otherwise show real items
  const items = useMemo(() => {
    // During grocery tour steps: Show ONLY demo items (hide real inventory)
    if (isActive &&
        demoInventoryItems &&
        demoInventoryItems.length > 0 &&
        (shouldShowTooltip(STEPS.GO_TO_MEALS) ||
         shouldShowTooltip(STEPS.VIEWING_INVENTORY) ||
         shouldShowTooltip(STEPS.PUSH_NOTIFICATION_PROMPT))) {
      console.log('[Inventory] 🎯 Demo mode active - Showing ONLY', demoInventoryItems.length, 'demo items (hiding real items)');
      return demoInventoryItems;
    }

    console.log('[Inventory] Normal mode - Showing', inventoryItems.length, 'real items');
    return inventoryItems;
  }, [isActive, demoInventoryItems, inventoryItems, shouldShowTooltip, STEPS]);

  // No more auto-advance - user must explicitly finish/continue tour
  // (Removed auto-advance to keep demo items visible)

  // Handle tab switching based on props and URL changes
  useEffect(() => {
    // Handle direct navigation or prop changes
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname === '/inventory/shopping-list') {
      setActiveTab('shopping-list');
    } else if (location.pathname === '/inventory') {
      setActiveTab('inventory');
    }
  }, [location, defaultTab]);

  // Handle category navigation from HomePage
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');

    if (categoryParam) {
      // Set filter to by-category and ensure we're on inventory tab
      setActiveFilter('by-category');
      setSelectedCategory(categoryParam); // Store the selected category
      setActiveTab('inventory');

      // Scroll to category after a short delay to ensure DOM is updated
      setTimeout(() => {
        scrollToCategory(categoryParam);
      }, 100);
    }
  }, [location.search]);

  // Swipe gesture handlers for mobile tab navigation
  const handleTouchStart = (e) => {
    setTouchEndX(null); // Reset touchEnd
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX || !touchEndX || !touchStartY || !touchEndY || !isSwiping) {
      setIsSwiping(false);
      return;
    }

    const horizontalDistance = touchStartX - touchEndX;
    const verticalDistance = Math.abs(touchStartY - touchEndY);
    const minSwipeDistance = 50;

    // Only trigger tab switch if horizontal swipe is dominant
    // Horizontal distance must be at least 2x the vertical distance
    const isHorizontalSwipe = Math.abs(horizontalDistance) > verticalDistance * 1.5;
    const isSignificantSwipe = Math.abs(horizontalDistance) >= minSwipeDistance;

    if (isHorizontalSwipe && isSignificantSwipe) {
      const isLeftSwipe = horizontalDistance > 0;
      const isRightSwipe = horizontalDistance < 0;

      if (isLeftSwipe && activeTab === 'inventory') {
        // Swipe left: go to shopping list
        setActiveTab('shopping-list');
        navigate('/inventory/shopping-list');
      } else if (isRightSwipe && activeTab === 'shopping-list') {
        // Swipe right: go to inventory
        setActiveTab('inventory');
        navigate('/inventory');
      }
    }

    setIsSwiping(false);
  };

  // Function to scroll to a specific category section
  const scrollToCategory = (category) => {
    // Try to find the category header element
    // Look for both desktop table view and mobile card view
    const categorySelector = `[data-category="${category}"], tr[data-category="${category}"]`;
    const categoryElement = document.querySelector(categorySelector);

    if (categoryElement) {
      categoryElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: try to find by text content
      const elements = document.querySelectorAll('tr, h3');
      for (const element of elements) {
        if (element.textContent && element.textContent.trim().toUpperCase() === category.toUpperCase()) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          break;
        }
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Good':
        return '#4CAF50';
      case 'Low Stock':
        return '#FF9800';
      case 'Need Attention':
        return '#FF5722';
      case 'Expired':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getShelfLifeText = (dateString) => {
    const daysLeft = getDaysUntilExpiry(dateString);
    if (daysLeft < 0) {
      return `Shelf life left: - ${Math.abs(daysLeft)} days`;
    } else if (daysLeft === 0) {
      return 'Shelf life left: Expires today';
    } else if (daysLeft === 1) {
      return 'Shelf life left: 1 day';
    } else {
      return `Shelf life left: ${daysLeft} days`;
    }
  };

  const getShelfLifeColorClass = (dateString) => {
    const daysLeft = getDaysUntilExpiry(dateString);
    if (daysLeft < 0) {
      return 'inventory-page__card-shelf-life--expired';
    } else if (daysLeft >= 0 && daysLeft <= 4) {
      return 'inventory-page__card-shelf-life--expiring';
    } else {
      return 'inventory-page__card-shelf-life--fresh';
    }
  };

  const getCategoryColor = (category) => {
    // Define category-specific colors with very pastel backgrounds and subtle text
    const categoryColors = {
      'Fruits': { bg: '#fff5e6', text: '#8b6914' },           // Very soft peach
      'Vegetables': { bg: '#f0f9f0', text: '#4a6741' },       // Very soft green
      'Protein': { bg: '#fff0f0', text: '#8b4561' },          // Very soft pink
      'Dairy': { bg: '#e6f3ff', text: '#4a6b8b' },           // Very soft blue
      'Grains': { bg: '#fff7e6', text: '#8b6332' },          // Light tan
      'Fats and oils': { bg: '#fffde7', text: '#827717' },   // Light yellow
      'Beverages': { bg: '#ffe8cc', text: '#cc6600' },       // Light orange
      'Seasonings': { bg: '#e0f2f1', text: '#2e7d6e' },      // Light mint
      'Snacks': { bg: '#fffcf0', text: '#8b7d4a' },          // Very soft yellow
      'Pantry': { bg: '#f7f0ff', text: '#6b4a8b' },          // Very soft lavender
      'Frozen': { bg: '#f0faff', text: '#4a7a8b' },          // Very soft cyan
      'Other': { bg: '#f5f5f5', text: '#666666' },           // Very soft gray
      'Uncategorized': { bg: '#f5f5f5', text: '#666666' }    // Very soft gray
    };

    // Return the specific color for the category, or default gray if not found
    return categoryColors[category] || categoryColors['Other'];
  };

  const getExpirationColor = (status) => {
    // Define expiration status colors with very pastel backgrounds
    const statusColors = {
      'Expired': { bg: '#fff0f0', text: '#8b4561' },          // Very soft red
      'Need Attention': { bg: '#fff8f0', text: '#8b6914' },   // Very soft orange
      'Good': { bg: '#f0f9f0', text: '#4a6741' }             // Very soft green
    };

    // Return the specific color for the status, or default to Good if not found
    return statusColors[status] || statusColors['Good'];
  };

  // Check limit before adding items
  const handleAddItemClick = () => {
    const check = canAccess('grocery_items');

    if (!check.allowed) {
      // User hit the limit, show upgrade modal
      setUpgradeModal({
        isOpen: true,
        feature: 'grocery items',
        current: check.current,
        limit: check.limit
      });
      return;
    }

    // User has not hit limit, proceed to camera
    navigate('/batchcamera');
  };

  const handleDeleteItem = (item) => {
    console.log('Delete button clicked for item:', item);
    setItemToDelete(item);
    setShowDeleteModal(true);
    console.log('Modal should now be shown');
  };

  const handleDeleteConfirm = async (reason) => {
    if (!itemToDelete) return;
    
    try {
      // Pass the delete reason to the backend for analytics
      await deleteItem(itemToDelete.id, reason);
      console.log(`Item deleted with reason: ${reason}`);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Shopping list handler - now opens modal for selection
  const handleAddToShoppingList = (item) => {
    setClickedIcon(`add-${item.id}`);
    setTimeout(() => setClickedIcon(null), 300); // Reset after 300ms

    setSelectedItemForList(item);
    setShowShoppingListModal(true);
  };

  // Handle adding item to existing shopping list
  const handleAddToExistingList = async (listId, listName) => {
    try {
      const shoppingItem = {
        name: selectedItemForList.itemName,
        quantity: '1', // Default quantity
        category: selectedItemForList.category || 'Other'
      };

      // Add item to shopping list
      const newItem = await addToShoppingList(listId, shoppingItem);

      // Find the existing list data
      const existingList = shoppingLists.find(list => list.id === listId);

      // Construct updated list data with new item
      const updatedListData = {
        ...existingList,
        name: listName,
        shopping_list_items: [
          ...(existingList?.shopping_list_items || []),
          {
            id: newItem?.id || Date.now(), // Use API response ID or temp ID
            name: shoppingItem.name,
            quantity: shoppingItem.quantity,
            category: shoppingItem.category,
            is_checked: false,
            created_at: new Date().toISOString()
          }
        ],
        total_items: (existingList?.total_items || 0) + 1
      };

      // Navigate directly to list detail page with the updated data
      navigate(`/shopping-list/${listId}`, {
        state: {
          listData: updatedListData
        }
      });
    } catch (error) {
      console.error('Failed to add item to shopping list:', error);
      alert('Failed to add item to shopping list. Please try again.');
    }
  };

  // Handle creating new list with item
  const handleCreateNewListAndAdd = async (listName) => {
    try {
      const shoppingItem = {
        name: selectedItemForList.itemName,
        quantity: '1', // Default quantity
        category: selectedItemForList.category || 'Other'
      };

      // Create list with the item already included
      const newList = await createList(listName, '#4fcf61', [shoppingItem]);

      // Construct the new list data with the item already included
      const newListData = {
        ...newList,
        shopping_list_items: [
          {
            id: Date.now(), // Temporary ID
            name: shoppingItem.name,
            quantity: shoppingItem.quantity,
            category: shoppingItem.category,
            is_checked: false,
            created_at: new Date().toISOString()
          }
        ],
        total_items: 1
      };

      // Navigate directly to the new list detail page with the data
      navigate(`/shopping-list/${newList.id}`, {
        state: {
          listData: newListData
        }
      });
    } catch (error) {
      console.error('Failed to create new shopping list:', error);
      alert('Failed to create new shopping list. Please try again.');
    }
  };

  // Close shopping list modal
  const handleCloseShoppingListModal = () => {
    setShowShoppingListModal(false);
    setSelectedItemForList(null);
  };


  // Edit handlers
  const handleEditItem = (item) => {
    setClickedIcon(`edit-${item.id}`);
    setTimeout(() => setClickedIcon(null), 300); // Reset after 300ms
    setItemToEdit(item);
    setShowEditModal(true);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setItemToEdit(null);
  };

  const handleEditConfirm = async (updatedData) => {
    if (!itemToEdit) return;
    
    try {
      await updateItem(itemToEdit.id, updatedData);
      console.log('Item updated successfully');
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setShowEditModal(false);
      setItemToEdit(null);
    }
  };




  // Filter items based on active filter and search term
  const getFilteredItems = () => {
    if (!items) return [];

    // First filter by search term if provided
    let filtered = items;  // ← Use merged items instead of inventoryItems
    if (searchTerm.trim()) {
      filtered = items.filter(item =>  // ← Use merged items instead of inventoryItems
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    // Apply sorting for recently-added filter
    if (activeFilter === 'recently-added') {
      return [...filtered].sort((a, b) => {
        // Use createdAt if available, otherwise fall back to uploadedAt
        const dateA = new Date(a.createdAt || a.uploadedAt || 0);
        const dateB = new Date(b.createdAt || b.uploadedAt || 0);
        return dateB - dateA; // Descending order (most recent first)
      });
    }

    // No special handling for other filters
    return filtered;
  };

  // Group items by category or expiration status
  const getGroupedItems = () => {
    const filtered = getFilteredItems();

    if (activeFilter === 'by-category') {
      const grouped = {};
      filtered.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(item);
      });

      // If a specific category is selected (from URL), show only that category
      if (selectedCategory) {
        return grouped[selectedCategory] ? { [selectedCategory]: grouped[selectedCategory] } : {};
      }

      // Sort categories alphabetically
      const sortedGrouped = {};
      Object.keys(grouped).sort().forEach(category => {
        sortedGrouped[category] = grouped[category];
      });

      return sortedGrouped;
    }
    
    if (activeFilter === 'by-expiration') {
      const grouped = {
        'Expired': [],
        'Need Attention': [],
        'Good': []
      };
      
      filtered.forEach(item => {
        const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
        const { status } = getExpiryStatus(daysUntilExpiry);
        
        if (grouped[status]) {
          grouped[status].push(item);
        } else {
          // Default to Good for any unrecognized status
          grouped['Good'].push(item);
        }
      });
      
      // Sort items within each group by expiry date (earliest first)
      Object.keys(grouped).forEach(status => {
        grouped[status].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      });
      
      // Return in priority order, but only include groups that have items
      const priorityOrder = ['Expired', 'Need Attention', 'Good'];
      const sortedGrouped = {};
      priorityOrder.forEach(status => {
        if (grouped[status].length > 0) {
          sortedGrouped[status] = grouped[status];
        }
      });
      
      return sortedGrouped;
    }
    
    return { ungrouped: filtered };
  };

  const filteredItems = getFilteredItems();
  const groupedItems = getGroupedItems();

  // Shopping List Handlers

  return (
    <div className="inventory-page">
      <AppNavBar />

      {/* Inventory Content */}
      <div style={{paddingTop: '60px', minHeight: '100vh', background: 'white'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem', overflow: 'visible'}}>
          {/* Row 1: Title Only */}
          <div style={{ marginBottom: '1rem', marginTop: '0' }}>
            <h1 className="inventory-page__title">
              Inventory
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="inventory-page__tabs">
            <button 
              className={`inventory-page__tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('inventory');
                navigate('/inventory');
              }}
            >
              Your Fridge
            </button>
            <button
              className={`inventory-page__tab ${activeTab === 'shopping-list' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('shopping-list');
                navigate('/inventory/shopping-list');
              }}
            >
              Shopping List
            </button>
          </div>

          {/* Conditional Content Based on Active Tab - Touch enabled for swipe navigation */}
          <div
            className="inventory-page__content-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
          {activeTab === 'inventory' ? (
            <>
          {/* Row 2: Search Bar + Plus Button */}
          <div className="inventory-page__actions-row">
            {/* Search Bar */}
            <div className="inventory-page__search-container">
              <svg className="inventory-page__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search your fridge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="inventory-page__search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inventory-page__search-clear"
                  title="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Add Item Plus Button */}
            <button
              className="inventory-page__add-button"
              onClick={handleAddItemClick}
              title="Add item"
            >
              +
            </button>
          </div>

          {/* Filter Pills */}
          {!loading && !error && inventoryItems.length > 0 && (
            <div 
              className="inventory-page__filter-pills"
              style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              alignItems: 'center',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingRight: '1rem'
            }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'by-category', label: 'Category' },
                { key: 'by-expiration', label: 'Expiration' },
                { key: 'recently-added', label: 'Recently added' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    setActiveFilter(filter.key);
                    // Reset selected category when switching away from by-category filter
                    if (filter.key !== 'by-category') {
                      setSelectedCategory(null);
                    }
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '25px',
                    border: activeFilter === filter.key ? 'none' : '1px solid #e0e0e0',
                    background: activeFilter === filter.key ? 'var(--primary-green)' : 'white',
                    color: activeFilter === filter.key ? 'white' : '#666',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--header-font)',
                    fontWeight: '400',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content',
                    flexShrink: 0,
                    boxShadow: activeFilter === filter.key ? '0 4px 15px rgba(129, 224, 83, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== filter.key) {
                      e.target.style.borderColor = '#c0c0c0';
                      e.target.style.background = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== filter.key) {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid var(--primary-green)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  animation: 'spin 2s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ color: '#666', margin: 0 }}>Loading your inventory...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              background: '#ffe6e6',
              border: '1px solid #ff9999',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              color: '#cc0000'
            }}>
              <strong>Error loading inventory:</strong> {error}
              <button 
                onClick={refreshInventory}
                style={{
                  marginLeft: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && inventoryItems.length === 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#666', marginBottom: '1rem' }}>No items in your inventory yet</h3>
              <p style={{ color: '#999', marginBottom: '2rem' }}>Start by scanning some food items with your camera!</p>
              <button
                style={{
                  padding: '0.875rem 2.5rem',
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={handleAddItemClick}
                onMouseEnter={(e) => {
                  e.target.style.background = '#45b857';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--primary-green)';
                }}
              >
                Scan Items
              </button>
            </div>
          )}

          {/* No Results State */}
          {!loading && !error && inventoryItems.length > 0 && filteredItems.length === 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#666', marginBottom: '1rem' }}>No items match your filter</h3>
              <p style={{ color: '#999', marginBottom: '2rem' }}>Try selecting a different filter or add more items to your inventory.</p>
              {/* Only show "Show All Items" button if there are items that would show when filter is set to 'all' */}
              {activeFilter !== 'all' && inventoryItems.filter(item =>
                !searchTerm.trim() || item.itemName.toLowerCase().includes(searchTerm.toLowerCase().trim())
              ).length > 0 && (
                <button
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveFilter('all');
                    setSelectedCategory(null);
                  }}
                >
                  Show All Items
                </button>
              )}
            </div>
          )}

          {/* Inventory Table - Desktop */}
          {!loading && !error && inventoryItems.length > 0 && filteredItems.length > 0 && (
            <div className="inventory-page__table-container" style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                overflowX: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem'
                }}>
                <thead>
                  <tr style={{
                    background: '#f8f9fa',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <input type="checkbox" readOnly style={{marginRight: '0.5rem'}} />
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Category
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Item Name
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Quantity
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Expiry Date
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(activeFilter === 'by-category' || activeFilter === 'by-expiration') ? (
                    // Grouped view
                    Object.entries(groupedItems).map(([category, items]) => (
                      <React.Fragment key={category}>
                        {/* Group header row */}
                        <tr data-category={category} style={{
                          backgroundColor: activeFilter === 'by-category'
                            ? getCategoryColor(category).bg
                            : getExpirationColor(category).bg,
                          borderTop: '2px solid #e9ecef'
                        }}>
                          <td colSpan="7" style={{
                            padding: '0.75rem 1rem',
                            fontWeight: '600',
                            fontSize: '1rem',
                            color: activeFilter === 'by-category'
                              ? getCategoryColor(category).text
                              : getExpirationColor(category).text,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {category} ({items.length})
                          </td>
                        </tr>
                        {/* Group items */}
                        {items.map((item) => {
                          const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                          return (
                            <tr key={item.id} style={{
                              borderBottom: '1px solid #f0f0f0',
                              transition: 'background-color 0.2s'
                            }} onMouseEnter={(e) => {
                              e.target.closest('tr').style.backgroundColor = '#f8f9fa';
                            }} onMouseLeave={(e) => {
                              e.target.closest('tr').style.backgroundColor = 'transparent';
                            }}>
                              <td style={{padding: '1rem'}}>
                                <input type="checkbox" readOnly />
                              </td>
                              <td style={{padding: '1rem'}}>
                                <span style={{
                                  padding: '0.25rem 0.75rem',
                                  background: '#f8f9fa',
                                  color: '#333',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500',
                                  border: '1px solid #e0e0e0'
                                }}>
                                  {item.category}
                                </span>
                              </td>
                              <td style={{padding: '1rem', fontWeight: '500'}}>
                                {item.itemName}
                              </td>
                              <td style={{padding: '1rem', color: '#666'}}>
                                {item.quantity}
                              </td>
                              <td style={{padding: '1rem'}}>
                                <div>
                                  <div style={{fontWeight: '500'}}>
                                    {formatDate(item.expiryDate)}
                                  </div>
                                  <div style={{
                                    fontSize: '0.8rem',
                                    color: daysUntilExpiry < 0 ? '#F44336' : 
                                           daysUntilExpiry <= 3 ? '#FF5722' : '#666'
                                  }}>
                                    {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` :
                                     daysUntilExpiry === 0 ? 'Today' :
                                     daysUntilExpiry === 1 ? 'Tomorrow' :
                                     `${daysUntilExpiry} days left`}
                                  </div>
                                </div>
                              </td>
                              <td style={{padding: '1rem'}}>
                                <span style={{
                                  padding: '0.25rem 0.75rem',
                                  background: `${getStatusColor(item.status)}20`,
                                  color: getStatusColor(item.status),
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500'
                                }}>
                                  {item.status}
                                </span>
                              </td>
                              <td style={{padding: '1rem'}}>
                                <div style={{
                                  display: 'flex',
                                  gap: '0.5rem',
                                  alignItems: 'center'
                                }}>
                                  <button style={{
                                    background: '#f8f9fa',
                                    border: '1px solid #e0e0e0',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    color: '#666',
                                    fontSize: '1rem',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }} 
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#e9ecef';
                                    e.target.style.borderColor = '#adb5bd';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = '#f8f9fa';
                                    e.target.style.borderColor = '#e0e0e0';
                                  }}
                                  onClick={() => handleEditItem(item)}
                                  title="Edit">
                                    <EditIcon />
                                  </button>
                                  <button style={{
                                    background: '#f8f9fa',
                                    border: '1px solid #e0e0e0',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    color: '#666',
                                    fontSize: '1rem',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#e9ecef';
                                    e.target.style.borderColor = '#adb5bd';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = '#f8f9fa';
                                    e.target.style.borderColor = '#e0e0e0';
                                  }}
                                  onClick={() => handleDeleteItem(item)}
                                  title="Delete">
                                    <DeleteIcon />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))
                  ) : (
                    // Regular list view
                    filteredItems.map((item) => {
                      const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                      return (
                        <tr key={item.id} style={{
                          borderBottom: '1px solid #f0f0f0',
                          transition: 'background-color 0.2s'
                        }} onMouseEnter={(e) => {
                          e.target.closest('tr').style.backgroundColor = '#f8f9fa';
                        }} onMouseLeave={(e) => {
                          e.target.closest('tr').style.backgroundColor = 'transparent';
                        }}>
                          <td style={{padding: '1rem'}}>
                            <input type="checkbox" readOnly />
                          </td>
                          <td style={{padding: '1rem'}}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: '#f8f9fa',
                              color: '#333',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              border: '1px solid #e0e0e0'
                            }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{padding: '1rem', fontWeight: '500'}}>
                            {item.itemName}
                          </td>
                          <td style={{padding: '1rem', color: '#666'}}>
                            {item.quantity}
                          </td>
                          <td style={{padding: '1rem'}}>
                            <div>
                              <div style={{fontWeight: '500'}}>
                                {formatDate(item.expiryDate)}
                              </div>
                              <div style={{
                                fontSize: '0.8rem',
                                color: daysUntilExpiry < 0 ? '#F44336' : 
                                       daysUntilExpiry <= 3 ? '#FF5722' : '#666'
                              }}>
                                {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` :
                                 daysUntilExpiry === 0 ? 'Today' :
                                 daysUntilExpiry === 1 ? 'Tomorrow' :
                                 `${daysUntilExpiry} days left`}
                              </div>
                            </div>
                          </td>
                          <td style={{padding: '1rem'}}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: `${getStatusColor(item.status)}20`,
                              color: getStatusColor(item.status),
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{padding: '1rem'}}>
                            <div style={{
                              display: 'flex',
                              gap: '0.5rem',
                              alignItems: 'center'
                            }}>
                              <button style={{
                                background: '#f8f9fa',
                                border: '1px solid #e0e0e0',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                color: '#666',
                                fontSize: '1rem',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }} 
                              onMouseEnter={(e) => {
                                e.target.style.background = '#e9ecef';
                                e.target.style.borderColor = '#adb5bd';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#f8f9fa';
                                e.target.style.borderColor = '#e0e0e0';
                              }}
                              onClick={() => handleEditItem(item)}
                              title="Edit">
                                <EditIcon />
                              </button>
                              <button style={{
                                background: '#f8f9fa',
                                border: '1px solid #e0e0e0',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                color: '#666',
                                fontSize: '1rem',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#e9ecef';
                                e.target.style.borderColor = '#adb5bd';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#f8f9fa';
                                e.target.style.borderColor = '#e0e0e0';
                              }}
                              onClick={() => handleDeleteItem(item)}
                              title="Delete">
                                <DeleteIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {/* Inventory Cards - Mobile */}
          {!loading && !error && inventoryItems.length > 0 && filteredItems.length > 0 && (
            <div className="inventory-page__mobile-cards">
              {(activeFilter === 'by-category' || activeFilter === 'by-expiration') ? (
                // Grouped view
                Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    {/* Group header */}
                    <h3 data-category={category} style={{
                      margin: '1.5rem 0 1rem 0',
                      padding: '0.5rem 1rem',
                      background: activeFilter === 'by-category'
                        ? getCategoryColor(category).bg
                        : getExpirationColor(category).bg,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: activeFilter === 'by-category'
                        ? getCategoryColor(category).text
                        : getExpirationColor(category).text,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      border: '1px solid #e9ecef'
                    }}>
                      {category} ({items.length})
                    </h3>
                    {/* Group items */}
                    {items.map((item) => {
                      const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                      const { status, urgency } = getExpiryStatus(daysUntilExpiry);
                      const formattedQuantity = formatQuantity(item.quantity);
                      
                      const getStatusPillClass = (urgency) => {
                        switch (urgency) {
                          case 'expired': return 'inventory-page__card-status-pill--expired';
                          case 'expiring': return 'inventory-page__card-status-pill--expiring';
                          case 'warning': return 'inventory-page__card-status-pill--warning';
                          case 'good': return 'inventory-page__card-status-pill--good';
                          default: return 'inventory-page__card-status-pill--good';
                        }
                      };

                      return (
                        <div key={item.id} className="inventory-page__mobile-card-wrapper">
                          <div className="inventory-page__mobile-card">
                            {/* Left: Ingredient image */}
                            <div className="inventory-page__card-icon">
                              <IngredientImage
                                item={item}
                                size={64}
                                className="inventory-page__card-image"
                                fallbackToIcon={true}
                              />
                            </div>
                            
                            {/* Right: Content */}
                            <div className="inventory-page__card-content">
                            {/* Top: Item name + status pill on same line */}
                            <div className="inventory-page__card-name-row">
                              <h3 className="inventory-page__card-item-name">{item.itemName}</h3>
                              {/* Status pills temporarily hidden - uncomment to re-enable
                              {urgency !== 'warning' && urgency !== 'good' && (
                                <span className={`inventory-page__card-status-pill ${getStatusPillClass(urgency)}`}>
                                  {status}
                                </span>
                              )}
                              */}
                            </div>
                            
                            {/* Bottom: Details row with quantity and category */}
                            <div className="inventory-page__card-details-row">
                              <span className="inventory-page__card-text-info">
                                Qty: {formattedQuantity}
                                {/* Show partial indicator for fractional quantities */}
                                {item.quantity && item.quantity % 1 !== 0 && (
                                  <span style={{ color: '#FF9800', fontSize: '0.85em', marginLeft: '4px' }}>
                                    (partial)
                                  </span>
                                )}
                                {item.weight_equivalent && (
                                  <span style={{ color: '#888', fontSize: '0.9em' }}>
                                    {' '}({item.weight_equivalent} {item.weight_unit})
                                  </span>
                                )}
                              </span>
                              <span className="inventory-page__card-text-info">
                                {item.category}
                              </span>
                            </div>
                            
                            {/* Shelf life text - Third row */}
                            <div className={`inventory-page__card-shelf-life ${getShelfLifeColorClass(item.expiryDate)}`}>
                              {getShelfLifeText(item.expiryDate)}
                            </div>

                            {/* Action icons row */}
                            <div className="inventory-page__card-actions">
                              <button
                                className={`inventory-page__action-icon ${clickedIcon === `edit-${item.id}` ? 'inventory-page__action-icon--clicked' : ''}`}
                                onClick={() => handleEditItem(item)}
                                title="Edit item"
                              >
                                <EditIcon width={16} height={16} />
                              </button>
                              <button
                                className={`inventory-page__action-icon ${clickedIcon === `add-${item.id}` ? 'inventory-page__action-icon--clicked' : ''}`}
                                onClick={() => handleAddToShoppingList(item)}
                                title="Add to shopping list"
                              >
                                <PlusIcon width={16} height={16} />
                              </button>
                              <button
                                className={`inventory-page__action-icon inventory-page__action-icon--delete ${clickedIcon === `delete-${item.id}` ? 'inventory-page__action-icon--clicked' : ''}`}
                                onClick={() => handleDeleteItem(item)}
                                title="Delete item"
                              >
                                <DeleteIcon width={16} height={16} />
                              </button>
                            </div>
                          </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                // Regular list view
                filteredItems.map((item) => {
                  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                  const { status, urgency } = getExpiryStatus(daysUntilExpiry);
                  const formattedQuantity = formatQuantity(item.quantity);
                  
                  const getStatusPillClass = (urgency) => {
                    switch (urgency) {
                      case 'expired': return 'inventory-page__card-status-pill--expired';
                      case 'expiring': return 'inventory-page__card-status-pill--expiring';
                      case 'warning': return 'inventory-page__card-status-pill--warning';
                      case 'good': return 'inventory-page__card-status-pill--good';
                      default: return 'inventory-page__card-status-pill--good';
                    }
                  };

                  return (
                    <div key={item.id} className="inventory-page__mobile-card-wrapper">
                      <div className="inventory-page__mobile-card">
                        {/* Left: Ingredient image */}
                        <div className="inventory-page__card-icon">
                          <IngredientImage
                            item={item}
                            size={64}
                            className="inventory-page__card-image"
                            fallbackToIcon={true}
                          />
                        </div>
                        
                        {/* Right: Content */}
                        <div className="inventory-page__card-content">
                        {/* Top: Item name + status pill on same line */}
                        <div className="inventory-page__card-name-row">
                          <h3 className="inventory-page__card-item-name">{item.itemName}</h3>
                          {/* Status pills temporarily hidden - uncomment to re-enable
                          {urgency !== 'warning' && urgency !== 'good' && (
                            <span className={`inventory-page__card-status-pill ${getStatusPillClass(urgency)}`}>
                              {status}
                            </span>
                          )}
                          */}
                        </div>
                        
                        {/* Bottom: Details row with quantity and category */}
                        <div className="inventory-page__card-details-row">
                          <span className="inventory-page__card-text-info">
                            Qty: {formattedQuantity}
                            {/* Show partial indicator for fractional quantities */}
                            {item.quantity && item.quantity % 1 !== 0 && (
                              <span style={{ color: '#FF9800', fontSize: '0.85em', marginLeft: '4px' }}>
                                (partial)
                              </span>
                            )}
                            {item.weight_equivalent && (
                              <span style={{ color: '#888', fontSize: '0.9em' }}>
                                {' '}({item.weight_equivalent} {item.weight_unit})
                              </span>
                            )}
                          </span>
                          <span className="inventory-page__card-text-info">
                            {item.category}
                          </span>
                        </div>
                        
                        {/* Shelf life text - Third row */}
                        <div className={`inventory-page__card-shelf-life ${getShelfLifeColorClass(item.expiryDate)}`}>
                          {getShelfLifeText(item.expiryDate)}
                        </div>

                        {/* Action icons row */}
                        <div className="inventory-page__card-actions">
                          <button
                            className={`inventory-page__action-icon ${clickedIcon === `edit-${item.id}` ? 'inventory-page__action-icon--clicked' : ''}`}
                            onClick={() => handleEditItem(item)}
                            title="Edit item"
                          >
                            <EditIcon width={16} height={16} />
                          </button>
                          <button
                            className={`inventory-page__action-icon ${clickedIcon === `add-${item.id}` ? 'inventory-page__action-icon--clicked' : ''}`}
                            onClick={() => handleAddToShoppingList(item)}
                            title="Add to shopping list"
                          >
                            <PlusIcon width={16} height={16} />
                          </button>
                          <button
                            className={`inventory-page__action-icon inventory-page__action-icon--delete ${clickedIcon === `delete-${item.id}` ? 'inventory-page__action-icon--clicked' : ''}`}
                            onClick={() => handleDeleteItem(item)}
                            title="Delete item"
                          >
                            <DeleteIcon width={16} height={16} />
                          </button>
                        </div>
                      </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
            </>
          ) : (
            /* Shopping List Tab Content */
            <ShoppingListSection />
          )}
          </div>
        </div>
      </div>
      

      {/* Edit Item Modal */}
      {showEditModal && itemToEdit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 10001,
            position: 'relative'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Edit {itemToEdit.itemName}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleEditConfirm({
                itemName: formData.get('itemName'),
                quantity: formData.get('quantity'),
                category: formData.get('category'),
                expiryDate: formData.get('expiryDate')
              });
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Item Name
                </label>
                <input 
                  type="text" 
                  name="itemName"
                  defaultValue={itemToEdit.itemName}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Quantity
                </label>
                <input 
                  type="text" 
                  name="quantity"
                  defaultValue={itemToEdit.quantity}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Category
                </label>
                <input 
                  type="text" 
                  name="category"
                  defaultValue={itemToEdit.category}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Expiry Date
                </label>
                <input 
                  type="date" 
                  name="expiryDate"
                  defaultValue={itemToEdit.expiryDate ? new Date(itemToEdit.expiryDate).toISOString().split('T')[0] : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Delete {itemToDelete.itemName}?
            </h3>
            <p style={{
              margin: '0 0 2rem 0',
              color: '#666',
              fontSize: '0.95rem'
            }}>
              What happened to this item?
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => handleDeleteConfirm('mistake')}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#856404',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ffeaa7';
                  e.target.style.borderColor = '#fdcb6e';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff3cd';
                  e.target.style.borderColor = '#ffeaa7';
                }}
              >
                I didn't mean to log this
              </button>
              
              <button
                onClick={() => handleDeleteConfirm('used_up')}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#155724',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c3e6cb';
                  e.target.style.borderColor = '#b8dabd';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#d4edda';
                  e.target.style.borderColor = '#c3e6cb';
                }}
              >
                I used it up
              </button>
              
              <button
                onClick={() => handleDeleteConfirm('thrown_away')}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#721c24',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f5c6cb';
                  e.target.style.borderColor = '#f1b0b7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8d7da';
                  e.target.style.borderColor = '#f5c6cb';
                }}
              >
                I'm throwing it away
              </button>
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#6c757d',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Shopping List Selection Modal */}
      <ShoppingListSelectionModal
        isOpen={showShoppingListModal}
        onClose={handleCloseShoppingListModal}
        item={selectedItemForList}
        shoppingLists={shoppingLists}
        onAddToExistingList={handleAddToExistingList}
        onCreateNewListAndAdd={handleCreateNewListAndAdd}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false, feature: '', current: 0, limit: 0 })}
        feature={upgradeModal.feature}
        current={upgradeModal.current}
        limit={upgradeModal.limit}
      />

      {/* Celebration Modal - Part 1 Complete */}
      {shouldShowTooltip(STEPS.GO_TO_MEALS) && (
        <CelebrationModal
          message="You've added your first item. Great job!"
          onContinue={() => {
            console.log('[Inventory] Part 1 complete - closing modal and advancing to VIEWING_INVENTORY');
            nextStep(); // Advances to VIEWING_INVENTORY (modal closes immediately)
          }}
          continueLabel="Continue"
        />
      )}

      {/* Groceries Tour End Modal - Individual or Full Tour */}
      {shouldShowTooltip(STEPS.VIEWING_INVENTORY) && demoInventoryItems && demoInventoryItems.length > 0 && (
        <IntroductionModal
          title={isIndividualTour ? "You've completed logging groceries!" : "Great! Your items are saved"}
          message={isIndividualTour
            ? "Your 4 items are now in your fridge inventory. You can view them anytime and track expiry dates."
            : "Now let's continue to the next part of the tour and see what else you can do!"}
          emoji={isIndividualTour ? "🎉" : "✅"}
          onContinue={() => {
            if (isIndividualTour) {
              console.log('[Inventory] User finished groceries tour (individual) - completing tour');
              completeTour();
            } else {
              console.log('[Inventory] User continuing full tour - advancing to next section');
              goToStep(STEPS.GENERATE_RECIPES_INTRO);
            }
          }}
          continueLabel={isIndividualTour ? "Finish Tour" : "Continue Tour"}
        />
      )}

      {/* Push Notification Prompt Modal - Shows after 4 second delay */}
      {shouldShowTooltip(STEPS.PUSH_NOTIFICATION_PROMPT) && (
        <PushNotificationPromptModal
          onContinue={(enabled) => {
            console.log('[Inventory] Push notification prompt completed, enabled:', enabled);
            nextStep(); // Advances to SHORTCUT_INTRO
          }}
        />
      )}

      {/* Shortcut Introduction Modal - Uses same design as standalone shortcut installation */}
      {shouldShowTooltip(STEPS.SHORTCUT_INTRO) && (
        <IntroductionModal
          title="Let's install your shortcut"
          message="We'll help you set up a quick way to import recipes from Instagram."
          onContinue={() => {
            console.log('[Inventory] Shortcut intro - advancing to INSTALL_SHORTCUT');
            nextStep(); // Advances to INSTALL_SHORTCUT
          }}
          onClose={() => {
            console.log('[Inventory] User skipped installing shortcut');
            dismissTour();
          }}
          continueLabel="Continue"
          skipLabel="Skip installing shortcut"
        />
      )}

      {/* Introduction Modal - Part 2: Recipe Import */}
      {shouldShowTooltip(STEPS.RECIPE_INTRO) && (
        <IntroductionModal
          message="Great! Now let's import your first recipe"
          onContinue={() => {
            console.log('[Inventory] Starting Part 2 - advancing to shortcut install');
            nextStep(); // Advances to INSTALL_SHORTCUT or skips to IMPORT_RECIPE if not iOS
          }}
          onClose={() => {
            console.log('[Inventory] User closed recipe intro');
            dismissTour();
          }}
          continueLabel="Continue"
        />
      )}

      {/* Shortcut Install Modal - iOS Only */}
      {shouldShowTooltip(STEPS.INSTALL_SHORTCUT) && isIOS() && (
        <ShortcutInstallModal
          onInstall={() => {
            console.log('[Inventory] User clicked Install Shortcut');
            nextStep(); // Advances to IMPORT_RECIPE
          }}
          onSkip={() => {
            console.log('[Inventory] User skipped shortcut install');
            nextStep(); // Advances to IMPORT_RECIPE
          }}
        />
      )}

      {/* iOS Install Prompt - Shows after first batch of items added */}
      <IOSInstallPrompt
        isVisible={shouldShowInstallPrompt}
        onDismiss={dismissPrompt}
      />

      <MobileBottomNav />
    </div>
  );
};

export default InventoryPage; 