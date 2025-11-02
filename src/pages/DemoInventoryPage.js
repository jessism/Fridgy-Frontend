import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuidedTourContext } from '../contexts/GuidedTourContext';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { EditIcon, DeleteIcon, PlusIcon } from '../components/icons';
import IngredientImage from '../components/IngredientImage';
import CelebrationModal from '../components/guided-tour/CelebrationModal';
import GenerateRecipesIntroModal from '../components/guided-tour/GenerateRecipesIntroModal';
import PushNotificationPromptModal from '../components/guided-tour/PushNotificationPromptModal';
import IntroductionModal from '../components/guided-tour/IntroductionModal';
import { getExpiryStatus, formatQuantity } from '../assets/inventory_emojis/iconHelpers.js';
import './InventoryPage.css';

const DemoInventoryPage = () => {
  const navigate = useNavigate();
  const { demoInventoryItems, shouldShowTooltip, nextStep, dismissTour, completeTour, isIndividualTour, isFullTour, STEPS } = useGuidedTourContext();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // State for notification flow (local to this page, not tour steps)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showNotificationSkipMessage, setShowNotificationSkipMessage] = useState(false);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // If no demo items, redirect to real inventory
  useEffect(() => {
    if (!demoInventoryItems || demoInventoryItems.length === 0) {
      console.log('[DemoInventory] No demo items found, redirecting to real inventory');
      navigate('/inventory');
    }
  }, [demoInventoryItems, navigate]);

  // Helper function to calculate days until expiry
  const getDaysUntilExpiry = (expirationDate) => {
    if (!expirationDate) return null;
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry - today;
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

  // Dummy handlers for buttons (non-functional in demo mode)
  const handleAddItemClick = () => {
    console.log('[DemoInventory] Add item clicked (demo mode - no action)');
  };

  const handleEditItem = (item) => {
    console.log('[DemoInventory] Edit item clicked (demo mode - no action):', item.itemName);
  };

  const handleDeleteItem = (item) => {
    console.log('[DemoInventory] Delete item clicked (demo mode - no action):', item.itemName);
  };

  const handleAddToShoppingList = (item) => {
    console.log('[DemoInventory] Add to shopping list clicked (demo mode - no action):', item.itemName);
  };

  console.log('[DemoInventory] Rendering', demoInventoryItems.length, 'demo items');

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
              onClick={() => setActiveTab('inventory')}
            >
              Your Fridge
            </button>
            <button
              className={`inventory-page__tab ${activeTab === 'shopping-list' ? 'active' : ''}`}
              onClick={() => setActiveTab('shopping-list')}
            >
              Shopping List
            </button>
          </div>

          {/* Content Container */}
          <div className="inventory-page__content-container">
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
                {demoInventoryItems.length > 0 && (
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
                    }}
                  >
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'by-category', label: 'Category' },
                      { key: 'by-expiration', label: 'Expiration' },
                      { key: 'recently-added', label: 'Recently added' }
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
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
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Inventory Cards - Mobile */}
                {demoInventoryItems.length > 0 && (
                  <div className="inventory-page__mobile-cards">
                    {demoInventoryItems.map((item) => {
                      const daysUntilExpiry = getDaysUntilExpiry(item.expirationDate);
                      const { status, urgency } = getExpiryStatus(daysUntilExpiry);
                      const formattedQuantity = formatQuantity(item.quantity);

                      return (
                        <div key={item.id} className="inventory-page__mobile-card-wrapper">
                          <div className="inventory-page__mobile-card">
                            {/* Left: Ingredient image */}
                            <div className="inventory-page__card-icon">
                              <IngredientImage
                                item={{
                                  itemName: item.itemName,
                                  category: item.category,
                                  imageUrl: item.imageUrl
                                }}
                                size={64}
                                className="inventory-page__card-image"
                                fallbackToIcon={true}
                              />
                            </div>

                            {/* Right: Content */}
                            <div className="inventory-page__card-content">
                              {/* Top: Item name */}
                              <div className="inventory-page__card-name-row">
                                <h3 className="inventory-page__card-item-name">{item.itemName}</h3>
                              </div>

                              {/* Bottom: Details row with quantity and category */}
                              <div className="inventory-page__card-details-row">
                                <span className="inventory-page__card-text-info">
                                  Qty: {formattedQuantity}
                                </span>
                                <span className="inventory-page__card-text-info">
                                  {item.category}
                                </span>
                              </div>

                              {/* Shelf life text - Third row */}
                              <div className={`inventory-page__card-shelf-life ${getShelfLifeColorClass(item.expirationDate)}`}>
                                {getShelfLifeText(item.expirationDate)}
                              </div>

                              {/* Action icons row */}
                              <div className="inventory-page__card-actions">
                                <button
                                  className="inventory-page__action-icon"
                                  onClick={() => handleEditItem(item)}
                                  title="Edit item"
                                >
                                  <EditIcon width={16} height={16} />
                                </button>
                                <button
                                  className="inventory-page__action-icon"
                                  onClick={() => handleAddToShoppingList(item)}
                                  title="Add to shopping list"
                                >
                                  <PlusIcon width={16} height={16} />
                                </button>
                                <button
                                  className="inventory-page__action-icon inventory-page__action-icon--delete"
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
                )}
              </>
            ) : (
              /* Shopping List Tab - Empty for demo */
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '12px',
                color: '#666'
              }}>
                <p style={{ margin: 0 }}>Shopping list not available in demo mode</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />

      {/* GO_TO_MEALS Celebration Modal */}
      {shouldShowTooltip(STEPS.GO_TO_MEALS) && (
        <CelebrationModal
          message="Great job! Your items are now in your fridge. Let's see what meals you can make with them."
          onContinue={() => {
            console.log('[DemoInventory] User acknowledged GO_TO_MEALS - advancing tour');
            nextStep();
          }}
          continueLabel="Continue"
        />
      )}

      {/* VIEWING_INVENTORY auto-advance (after 3 seconds) */}
      {shouldShowTooltip(STEPS.VIEWING_INVENTORY) && <ViewingInventoryAutoAdvance />}

      {/* SHORTCUT_INTRO - Congratulations Modal (Both Tours) */}
      {shouldShowTooltip(STEPS.SHORTCUT_INTRO) && !showNotificationPrompt && !showNotificationSuccess && (
        <CelebrationModal
          title="Congratulations! You've finished logging your items"
          onContinue={() => {
            console.log('[DemoInventory] User clicked Continue - showing notification prompt');
            setShowNotificationPrompt(true);
          }}
          continueLabel="Continue"
        />
      )}

      {/* Notification Prompt Modal */}
      {showNotificationPrompt && !showNotificationSkipMessage && !showNotificationSuccess && (
        <PushNotificationPromptModal
          onContinue={(enabled) => {
            console.log('[DemoInventory] Notification prompt completed, enabled:', enabled);
            setNotificationEnabled(enabled);
            if (enabled) {
              // Show success modal (this will hide notification prompt due to condition)
              setShowNotificationSuccess(true);
            } else {
              // User clicked "Maybe Later" - show skip message (this will hide notification prompt due to condition)
              setShowNotificationSkipMessage(true);
            }
          }}
        />
      )}

      {/* Notification Skip Message Modal */}
      {showNotificationSkipMessage && (
        <IntroductionModal
          title="No worries!"
          message="You can turn this on later in Profile > Notifications"
          onContinue={() => {
            console.log('[DemoInventory] User acknowledged notification skip message');
            setShowNotificationSkipMessage(false);
            setShowNotificationSuccess(true); // Show final completion modal
          }}
          continueLabel="Got it"
          showClose={false}
        />
      )}

      {/* Final Modal - Different based on notification status and tour type */}
      {showNotificationSuccess && (
        notificationEnabled ? (
          // Notification was enabled - show success message
          <CelebrationModal
            title="You're all set!"
            description="You'll now receive helpful updates about your inventory"
            onContinue={() => {
              console.log('[DemoInventory] Notification success acknowledged');
              setShowNotificationSuccess(false);
              if (isIndividualTour) {
                completeTour();
                navigate('/home');
              } else {
                // Full tour: continue to shortcuts
                navigate('/home');
              }
            }}
            continueLabel={isIndividualTour ? "Finish" : "Continue to Save Recipes"}
          />
        ) : (
          // Notification was skipped - show completion message
          <CelebrationModal
            title={isIndividualTour ? "You finished the tour!" : "Congratulations on finishing grocery logging!"}
            description={isIndividualTour ? "" : "Ready to continue learning how to save recipes?"}
            onContinue={() => {
              console.log('[DemoInventory] Final modal acknowledged');
              setShowNotificationSuccess(false);
              if (isIndividualTour) {
                completeTour();
                navigate('/home');
              } else {
                // Full tour: continue to shortcuts
                navigate('/home');
              }
            }}
            continueLabel={isIndividualTour ? "Complete Tour" : "Continue"}
          />
        )
      )}

      {/* GENERATE_RECIPES_INTRO Modal */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_INTRO) && (
        <GenerateRecipesIntroModal
          onContinue={() => {
            console.log('[DemoInventory] User wants to learn recipe generation - advancing tour');
            nextStep();
          }}
          onSkip={() => {
            console.log('[DemoInventory] User skipped recipe generation - dismissing tour');
            dismissTour();
          }}
        />
      )}
    </div>
  );
};

// Helper component for auto-advancing after viewing inventory
const ViewingInventoryAutoAdvance = () => {
  const { nextStep } = useGuidedTourContext();

  useEffect(() => {
    console.log('[DemoInventory] VIEWING_INVENTORY - setting 4s timer');
    const timer = setTimeout(() => {
      console.log('[DemoInventory] 4s elapsed - advancing tour');
      nextStep();
    }, 4000);

    return () => clearTimeout(timer);
  }, [nextStep]);

  return null;
};

export default DemoInventoryPage;
