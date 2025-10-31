import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
import { useGuidedTourContext } from '../contexts/GuidedTourContext';
import WelcomePrompt from '../components/guided-tour/WelcomePrompt';
import IntroductionModal from '../components/guided-tour/IntroductionModal';
import GenerateRecipesIntroModal from '../components/guided-tour/GenerateRecipesIntroModal';
import GuidedTooltip from '../components/guided-tour/GuidedTooltip';
import ShortcutInstallModal from '../components/guided-tour/ShortcutInstallModal';
import ShortcutConfirmationModal from '../components/guided-tour/ShortcutConfirmationModal';
import ShortcutSuccessBridgeModal from '../components/guided-tour/ShortcutSuccessBridgeModal';
import PreFlightCheckModal from '../components/guided-tour/PreFlightCheckModal';
import RecipeImportIntroModal from '../components/guided-tour/RecipeImportIntroModal';
import RecipeImportStepModal from '../components/guided-tour/RecipeImportStepModal';
import RecipeImportSuccessModal from '../components/guided-tour/RecipeImportSuccessModal';
import { isIOS } from '../utils/welcomeFlowHelpers';
import { detectRecipeImport } from '../utils/recipeImportDetection';
import { checkNotificationPermission, requestNotificationPermission } from '../utils/shortcutDetection';
import useInventory from '../hooks/useInventory';
import IOSInstallPrompt from '../components/IOSInstallPrompt';
import { usePWADetection } from '../hooks/usePWADetection';
import PWANotificationPrompt from '../components/PWANotificationPrompt';
import { useSubscription } from '../hooks/useSubscription';
import { PremiumBadge } from '../components/common/PremiumBadge';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { CheckoutModal } from '../components/modals/CheckoutModal';
import { ReactComponent as AddToFridgeIcon } from '../assets/icons/quickaccess/add-to-fridge.svg';
import { ReactComponent as MyFridgeIcon } from '../assets/icons/quickaccess/my-fridge.svg';
import { ReactComponent as ShopListsIcon } from '../assets/icons/quickaccess/shop-lists.svg';
// Food group icons
import proteinIcon from '../assets/images/food-groups/foodgroup_protein.png';
import dairyIcon from '../assets/images/food-groups/foodgroup_dairy.png';
import veggiesIcon from '../assets/images/food-groups/foodgroup_veggies.png';
import fruitsIcon from '../assets/images/food-groups/foodgroup_fruits.png';
import grainsIcon from '../assets/images/food-groups/foodgroup_carb.png';
import fatsIcon from '../assets/images/food-groups/foodgroup_fats.png';
import beveragesIcon from '../assets/images/food-groups/foodgroup_beverages.png';
import herbsIcon from '../assets/images/food-groups/foodgroup_herbs.png';
import { ReactComponent as RecipesIcon } from '../assets/icons/quickaccess/recipes.svg';
import importRecipeStep1Image from '../assets/product mockup/Import Recipes/Import_recipe_open_instagram.jpeg';
import importRecipeStep4Image from '../assets/product mockup/Import Recipes/Import_recipe_allow_api.png';
import cookingIcon from '../assets/icons/Cooking.png';
import './HomePage.css';

// Helper function to calculate days until expiry (reused from InventoryPage)
const getDaysUntilExpiry = (dateString) => {
  const expiryDate = new Date(dateString);
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const HomePage = () => {
  const { user } = useAuth();
  const { items, loading: inventoryLoading } = useInventory();
  const navigate = useNavigate();
  const { isPremium, startCheckout, checkoutSecret, closeCheckout, refresh } = useSubscription();
  const { shouldShowTooltip, nextStep, dismissTour, completeTour, goToStep, STEPS } = useGuidedTourContext();

  // PWA Detection for first-time notification prompt
  const {
    isPWA,
    isFirstPWALaunch,
    shouldShowNotificationPrompt,
    platform,
    markFirstLaunchComplete,
    markNotificationPromptShown,
    markNotificationPromptDismissed,
    getDebugInfo
  } = usePWADetection();

  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false });
  const [recipeImportStep, setRecipeImportStep] = useState(1);
  const [importedRecipe, setImportedRecipe] = useState(null);
  const [preFlightStatus, setPreFlightStatus] = useState({
    hasNotifications: false,
    hasShortcut: false
  });
  const [shortcutInstallTimer, setShortcutInstallTimer] = useState(null);
  const [userClickedInstall, setUserClickedInstall] = useState(false);

  // Color palette - Option 2 (Medium Green)
  const colors = {
    primary: '#81e053',
    primaryLight: 'rgba(129, 224, 83, 0.3)',
    primaryDark: '#6bc93f',
  };

  // Clean up shortcut install timer on unmount or when tour step changes
  useEffect(() => {
    return () => {
      if (shortcutInstallTimer) {
        console.log('[HomePage] Cleaning up shortcut install timer');
        clearTimeout(shortcutInstallTimer);
      }
    };
  }, [shortcutInstallTimer]);

  // Debug: Log checkoutSecret changes
  useEffect(() => {
    console.log('[HomePage] checkoutSecret changed:', checkoutSecret ? 'Present ✅' : 'Null');
  }, [checkoutSecret]);

  // Check for first PWA launch and show notification prompt
  useEffect(() => {
    // Only check if user is logged in
    if (!user) return;

    // Log debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[HomePage] PWA Debug Info:', getDebugInfo());
    }

    // Check if we should show the notification prompt
    if (isPWA && shouldShowNotificationPrompt) {
      // Delay showing the prompt slightly to let the page load
      const timer = setTimeout(() => {
        setShowPWAPrompt(true);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }

    // Mark first launch complete if it's the first PWA launch
    if (isFirstPWALaunch) {
      markFirstLaunchComplete();
    }
  }, [isPWA, isFirstPWALaunch, shouldShowNotificationPrompt, user, markFirstLaunchComplete, getDebugInfo]);

  // Handle PWA notification prompt close
  const handlePWAPromptClose = (notificationsEnabled) => {
    setShowPWAPrompt(false);

    if (notificationsEnabled) {
      // Notifications were successfully enabled
      markNotificationPromptShown();
      console.log('PWA notifications enabled successfully');
    } else {
      // User chose "Maybe Later"
      markNotificationPromptDismissed();
      console.log('PWA notification prompt dismissed');
    }
  };

  // Function to navigate to a page
  const navigateToPage = (path) => {
    navigate(path);
    // ScrollToTop component will handle scrolling
  };

  // Function to navigate to inventory with category filter
  const navigateToCategory = (category) => {
    navigate(`/inventory?category=${encodeURIComponent(category)}`);
    // ScrollToTop component will handle scrolling
  };

  // Calculate category counts from real inventory data
  const getCategoryCounts = () => {
    const counts = {
      'Protein': 0,
      'Dairy': 0,
      'Vegetables': 0,
      'Fruits': 0,
      'Grains': 0,
      'Fats and Oils': 0,
      'Beverages': 0,
      'Seasonings': 0
    };

    items.forEach(item => {
      if (counts.hasOwnProperty(item.category)) {
        counts[item.category]++;
      }
    });

    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Get top 2 expiring items
  const getExpiringItems = () => {
    if (!items || items.length === 0) return [];
    
    return items
      .filter(item => {
        const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 3; // Expiring within 3 days
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)) // Sort by expiry date (earliest first)
      .slice(0, 2); // Take only top 2
  };

  // Get expired items (for fallback display)
  const getExpiredItems = () => {
    if (!items || items.length === 0) return [];
    
    return items
      .filter(item => {
        const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
        return daysUntilExpiry < 0; // Already expired
      })
      .sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate)) // Sort by expiry date (most recently expired first)
      .slice(0, 2); // Take only top 2
  };

  const expiringItems = getExpiringItems();
  const expiredItems = getExpiredItems();
  
  return (
    <div className="homepage" style={{
      '--primary-green': colors.primary,
      '--primary-green-light': colors.primaryLight,
      '--primary-green-dark': colors.primaryDark,
    }}>
      <AppNavBar />

      {/* Mobile Header - Only visible on mobile - COMMENTED OUT FOR NOW
      <div className="mobile-header">
        <div className="mobile-header-content">
          <img src={appLogo} alt="App logo" className="mobile-logo"/>
          <h2 className="mobile-brand-name">Trackabite</h2>
        </div>
      </div>
      */}

      {/* Hero Section - COMMENTED OUT - greeting moved to navigation
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
                              <h1 className="hero-title">
                  Hello {user?.firstName || 'User'}!
                </h1>
                <p className="hero-subtitle">
                  What are you cooking today?
                </p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Page Greeting - Desktop only without logo */}
      <section className="page-greeting desktop-only">
        <div className="container">
          <div className="greeting-content desktop-greeting left-aligned">
            <div className="greeting-text">
              <h1 className="greeting-hello">Hello {user?.firstName || 'User'},</h1>
              <p className="greeting-subtitle">What are you cooking today?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Page Greeting - Without logo */}
      <section className="page-greeting mobile-only">
        <div className="container">
          <div className="greeting-content left-aligned">
            <div className="greeting-text">
              <h1 className="greeting-hello">Hello {user?.firstName || 'User'},</h1>
              <p className="greeting-subtitle">What are you cooking today?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-header-with-arrow">
            <h2 className="section-title">In Your Fridge</h2>
          </div>
          <div className="categories-grid">
            <div className="category-card" onClick={() => navigateToCategory('Protein')}>
              <div className="category-count">{categoryCounts['Protein']}</div>
              <div className="category-image">
                <img src={proteinIcon} alt="Protein" className="food-group-icon" />
              </div>
              <h3>Protein</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Dairy')}>
              <div className="category-count">{categoryCounts['Dairy']}</div>
              <div className="category-image">
                <img src={dairyIcon} alt="Dairy" className="food-group-icon" />
              </div>
              <h3>Dairy</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Vegetables')}>
              <div className="category-count">{categoryCounts['Vegetables']}</div>
              <div className="category-image">
                <img src={veggiesIcon} alt="Vegetables" className="food-group-icon" />
              </div>
              <h3>Vegetables</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Fruits')}>
              <div className="category-count">{categoryCounts['Fruits']}</div>
              <div className="category-image">
                <img src={fruitsIcon} alt="Fruits" className="food-group-icon" />
              </div>
              <h3>Fruits</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Grains')}>
              <div className="category-count">{categoryCounts['Grains']}</div>
              <div className="category-image">
                <img src={grainsIcon} alt="Grains" className="food-group-icon" />
              </div>
              <h3>Grains</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Fats and Oils')}>
              <div className="category-count">{categoryCounts['Fats and Oils']}</div>
              <div className="category-image">
                <img src={fatsIcon} alt="Fats and Oils" className="food-group-icon" />
              </div>
              <h3>Fats</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Beverages')}>
              <div className="category-count">{categoryCounts['Beverages']}</div>
              <div className="category-image">
                <img src={beveragesIcon} alt="Beverages" className="food-group-icon" />
              </div>
              <h3>Beverages</h3>
            </div>

            <div className="category-card" onClick={() => navigateToCategory('Seasonings')}>
              <div className="category-count">{categoryCounts['Seasonings']}</div>
              <div className="category-image">
                <img src={herbsIcon} alt="Seasonings" className="food-group-icon" />
              </div>
              <h3>Seasonings</h3>
            </div>
          </div>
         </div>
       </section>

      {/* Need Attention Section */}
      <section className="expiring-soon">
        <div className="container">
          {/* Only show "Need Attention" headline if user has items */}
          {!inventoryLoading && items.length > 0 && (
            <div className="section-header">
              <h2 className="section-title">
                Need Attention
              </h2>
            </div>
          )}
          <div className="expiring-content" onClick={() => navigateToPage(items.length === 0 ? '/batchcamera' : '/inventory')}>
            <div className="expiring-items">
              {inventoryLoading ? (
                // Show loading placeholder while inventory is loading
                <>
                  <div className="expiring-item">
                    <div className="loading-placeholder" style={{ width: '150px', height: '20px', marginBottom: '8px' }}></div>
                    <div className="loading-placeholder" style={{ width: '80px', height: '16px' }}></div>
                  </div>
                  <div className="expiring-item">
                    <div className="loading-placeholder" style={{ width: '120px', height: '20px', marginBottom: '8px' }}></div>
                    <div className="loading-placeholder" style={{ width: '60px', height: '16px' }}></div>
                  </div>
                </>
              ) : expiringItems.length > 0 ? (
                // Show expiring items (priority 1)
                expiringItems.map((item) => {
                  const daysLeft = getDaysUntilExpiry(item.expiryDate);
                  const isUrgent = daysLeft <= 1;
                  const daysText = daysLeft === 0 ? 'Today' :
                                  daysLeft === 1 ? '1 day' :
                                  `${daysLeft} days`;

                  return (
                    <div key={item.id} className="expiring-item">
                      <div className="item-info">
                        <h4 className="item-name">{item.itemName}</h4>
                      </div>
                      <div className="expiry-countdown">
                        <span className={`days-left${isUrgent ? ' urgent' : ''}`}>
                          {daysText}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : expiredItems.length > 0 ? (
                // Show expired items (priority 2)
                expiredItems.map((item) => {
                  const daysExpired = Math.abs(getDaysUntilExpiry(item.expiryDate));
                  const daysText = daysExpired === 0 ? 'Expired today' :
                                  daysExpired === 1 ? '1 day ago' :
                                  `${daysExpired} days ago`;

                  return (
                    <div key={item.id} className="expiring-item">
                      <div className="item-info">
                        <h4 className="item-name">{item.itemName}</h4>
                      </div>
                      <div className="expiry-countdown">
                        <span className="days-left expired">
                          {daysText}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : items.length === 0 ? (
                // Show empty state for brand new users (priority 3)
                <div className="empty-fridge-state">
                  <div className="empty-state-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="15" width="25" height="30" rx="2" stroke="#4fcf61" strokeWidth="2.5" fill="none"/>
                      <line x1="10" y1="27" x2="35" y2="27" stroke="#4fcf61" strokeWidth="2.5"/>
                      <rect x="32" y="20" width="2" height="3" rx="1" fill="#4fcf61"/>
                      <rect x="32" y="32" width="2" height="4" rx="1" fill="#4fcf61"/>
                      <circle cx="45" cy="25" r="12" fill="#4fcf61"/>
                      <path d="M45 20v10M40 25h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h4 className="empty-state-title">Let's get your fridge started!</h4>
                  <p className="empty-state-subtitle">Add your groceries to begin tracking freshness and reducing waste</p>
                  <button
                    className="empty-state-cta"
                    onClick={(e) => { e.stopPropagation(); navigateToPage('/batchcamera'); }}
                  >
                    + Add Your First Items
                  </button>
                </div>
              ) : (
                // Show all fresh message (priority 4 - has items but none expiring)
                <div className="expiring-item">
                  <div className="item-info">
                    <h4 className="item-name">No items expiring soon</h4>
                    <p className="item-category">Your food is staying fresh!</p>
                  </div>
                </div>
              )}
            </div>
            {!inventoryLoading && expiringItems.length > 0 && (
              <>
                <div className="expiring-subtitle">
                  <p>
                    {expiringItems.every(item => item.category === 'Beverages')
                      ? 'Enjoy them before they expire!'
                      : 'They are still good. See how to use them in Meals.'}
                  </p>
                </div>
                <div className="expiring-reminders">
                  <span className="reminder-text">+{expiringItems.length} reminders</span>
                  <div className="reminder-arrow">→</div>
                </div>
              </>
            )}
            {!inventoryLoading && expiredItems.length > 0 && expiringItems.length === 0 && (
              <>
                <div className="expiring-subtitle expired-subtitle">
                  <p>Check if these items are still good or dispose of them.</p>
                </div>
                <div className="expiring-reminders">
                  <span className="reminder-text">+{expiredItems.length} expired</span>
                  <div className="reminder-arrow">→</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Cook What You Have Section - COMMENTED OUT
      <section className="cook-what-you-have">
        <div className="container">
          <div className="section-header-with-arrow">
            <h2 className="section-title">Cook What You Already Have</h2>
            <button className="slider-arrow">
              <span className="arrow-text">More recipes</span>
              <span className="arrow-icon">→</span>
            </button>
          </div>
          <div className="meals-slider">
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center" alt="Vegetable Stir Fry" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Fresh Vegetable Stir Fry</h3>
                <button className="cook-btn">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 85%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 35 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&crop=center" alt="Garden Salad Bowl" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Garden Salad Bowl</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 92%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 32 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center" alt="Protein Power Bowl" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Protein Power Bowl</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 78%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 40 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop&crop=center" alt="Quick Pasta Dish" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Quick Pasta Dish</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 88%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 30 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}


      {/* Inspired by Your Preference Section - COMMENTED OUT
      <section className="cook-what-you-have">
        <div className="container">
          <div className="section-header-with-arrow">
            <h2 className="section-title">Inspired by your preference</h2>
            <button className="slider-arrow">
              <span className="arrow-text">More recipes</span>
              <span className="arrow-icon">→</span>
            </button>
          </div>
          <div className="meals-slider">
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• Trending</span>
                <img src="https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop&crop=center" alt="Spicy Thai Curry" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Spicy Thai Curry</h3>
                <button className="cook-btn">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 76%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 42 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• Popular</span>
                <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center" alt="Mediterranean Chicken" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Mediterranean Chicken</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 89%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 38 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• New</span>
                <img src="https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop&crop=center" alt="Korean Bibimbap Bowl" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Korean Bibimbap Bowl</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 82%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 45 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• Chef's Pick</span>
                <img src="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&crop=center" alt="Italian Risotto" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Italian Risotto</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 91%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 35 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Additional Hello Section - COMMENTED OUT
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Hello {user?.firstName || 'User'}!
              </h1>
              <p className="hero-subtitle">
                What are you cooking today?
              </p>
            </div>
            <div className="hero-image">
              <div className="food-bowl">
                <img src="/hero-bowl.jpg" alt="Fresh healthy bowl" className="bowl-image" />
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Your Shopping List Section - COMMENTED OUT
      <section className="expiring-soon">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Your shopping list
            </h2>
          </div>
          <div className="expiring-items shopping-items">
            <div className="expiring-item shopping-item">
              <div className="item-checkbox">
                <input type="checkbox" id="milk" />
                <label htmlFor="milk"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Milk</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 gal</span>
              </div>
            </div>
            <div className="expiring-item shopping-item">
              <div className="item-checkbox">
                <input type="checkbox" id="butter" />
                <label htmlFor="butter"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Butter</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="parmesan" defaultChecked readOnly />
                <label htmlFor="parmesan"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Parmesan cheese</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="eggs" defaultChecked readOnly />
                <label htmlFor="eggs"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Eggs</h4>
                <p className="item-category">Dairy</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">4 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="bread" />
                <label htmlFor="bread"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Bread</h4>
                <p className="item-category">Bakery</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">1 ct</span>
              </div>
            </div>
            <div className="expiring-item shopping-item mobile-hide-item">
              <div className="item-checkbox">
                <input type="checkbox" id="muffins" defaultChecked readOnly />
                <label htmlFor="muffins"></label>
              </div>
              <div className="item-info">
                <h4 className="item-name">Blueberry muffins</h4>
                <p className="item-category">Bakery</p>
              </div>
              <div className="item-quantity">
                <span className="quantity-text">2 ct</span>
              </div>
            </div>
          </div>
          <div className="shopping-list-footer">
            <button className="add-items-btn">
              <span className="add-icon">+</span>
              Add more items
            </button>
          </div>
        </div>
      </section>
      */}

      {/* Quick Access & Analytics Section */}
      <section className="quick-access">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Quick Access</h2>
          </div>
          <div className="quick-access-grid">
            <div 
              className="quick-access-item primary"
              onClick={() => navigateToPage('/batchcamera')}
            >
              <div className="quick-access-icon">
                <AddToFridgeIcon />
              </div>
              <span className="quick-access-label">Add to fridge</span>
            </div>
            <div 
              className="quick-access-item"
              onClick={() => navigateToPage('/inventory')}
            >
              <div className="quick-access-icon">
                <MyFridgeIcon />
              </div>
              <span className="quick-access-label">My fridge</span>
            </div>
            <div
              className="quick-access-item"
              onClick={() => navigateToPage('/inventory/shopping-list')}
            >
              <div className="quick-access-icon">
                <ShopListsIcon />
              </div>
              <span className="quick-access-label">Shop lists</span>
            </div>
            <div 
              className="quick-access-item"
              onClick={() => navigateToPage('/meal-plans')}
            >
              <div className="quick-access-icon">
                <RecipesIcon />
              </div>
              <span className="quick-access-label">Meals</span>
            </div>
          </div>

          {/* Your Analytics - within same container */}
          <div className="section-header" style={{marginTop: '2.5rem'}}>
            <h2 className="section-title">Your Analytics</h2>
          </div>
          <div className="analytics-grid">
            {/* Inventory Usage - Premium Only */}
            <div
              className="analytics-item"
              onClick={() => {
                if (isPremium) {
                  navigateToPage('/analytics/inventory');
                } else {
                  setUpgradeModal({
                    isOpen: true,
                    feature: 'inventory analytics',
                    current: null,
                    limit: null
                  });
                }
              }}
              style={{
                position: 'relative',
                opacity: isPremium ? 1 : 0.7,
                cursor: 'pointer'
              }}
            >
              <div className="analytics-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Modern bar chart icon for inventory usage */}
                  <rect x="5" y="12" width="3" height="7" rx="0.5"/>
                  <rect x="10.5" y="8" width="3" height="11" rx="0.5"/>
                  <rect x="16" y="5" width="3" height="14" rx="0.5"/>
                </svg>
              </div>
              <span className="analytics-label">Inventory Usage</span>
              {!isPremium && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#ffd700',
                  color: '#000',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Pro</span>
                </div>
              )}
            </div>

            {/* Meals Analytics - Free for all */}
            <div
              className="analytics-item"
              onClick={() => navigateToPage('/meal-history')}
            >
              <div className="analytics-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Modern pie chart icon for meals analytics */}
                  <circle cx="12" cy="12" r="8" strokeWidth="2.5"/>
                  <path d="M12 4 L12 12 L18.5 8" strokeWidth="2.5"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <span className="analytics-label">Meals Analytics</span>
            </div>
          </div>
        </div>
      </section>
      
      <MobileBottomNav />
      <IOSInstallPrompt />

      {/* PWA First Launch Notification Prompt */}
      {showPWAPrompt && (
        <PWANotificationPrompt
          onClose={handlePWAPromptClose}
          onSuccess={() => console.log('Notifications setup successful')}
          platform={platform}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false })}
        feature={upgradeModal.feature}
        current={upgradeModal.current}
        limit={upgradeModal.limit}
        startCheckout={startCheckout}
      />

      {/* Checkout Modal with Payment Element */}
      {checkoutSecret && (
        <CheckoutModal
          onClose={closeCheckout}
          onSuccess={refresh}
        />
      )}

      {/* Welcome Prompt for Guided Tour */}
      {shouldShowTooltip(STEPS.WELCOME_SCREEN) && (
        <WelcomePrompt
          onStart={() => {
            console.log('[HomePage] User clicked Start Tour - skipping groceries intro');
            goToStep(STEPS.ADD_GROCERIES); // Skip groceries intro, go straight to ADD_GROCERIES
          }}
          onSkip={() => {
            console.log('[HomePage] User clicked Skip Tour');
            dismissTour(); // Dismiss the tour completely
          }}
        />
      )}

      {/* Groceries Introduction Modal - "Let's start by logging your first item" */}
      {shouldShowTooltip(STEPS.GROCERIES_INTRO) && (
        <IntroductionModal
          title="Let's start by logging your first item"
          message="We'll guide you through adding items to your fridge inventory using the camera."
          onContinue={() => {
            console.log('[HomePage] Groceries intro - advancing to ADD_GROCERIES');
            nextStep(); // Advances to ADD_GROCERIES
          }}
          onClose={() => {
            console.log('[HomePage] User skipped logging first item');
            dismissTour();
          }}
          continueLabel="Continue"
          skipLabel="Skip logging first item"
        />
      )}

      {/* Generate Recipes Introduction Modal */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_INTRO) && (
        <GenerateRecipesIntroModal
          onContinue={() => {
            console.log('[HomePage] Generate recipes intro - advancing to NAV_TO_MEALS');
            nextStep(); // Advances to GENERATE_RECIPES_NAV_TO_MEALS
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped generate recipes tour');
            dismissTour();
          }}
        />
      )}

      {/* Generate Recipes - Tooltip to Navigate to Meals */}
      {shouldShowTooltip(STEPS.GENERATE_RECIPES_NAV_TO_MEALS) && (
        <GuidedTooltip
          targetSelector=".mobile-bottom-nav__nav-tab[href='/meal-plans'], .app-navbar__nav-link[href='/meal-plans']"
          message="Start by heading to Meals page"
          position="top"
          onAction={() => {
            console.log('[HomePage] User acknowledged meals nav tooltip');
            nextStep(); // Advances to GENERATE_RECIPES_START_BUTTON (will show on MealPlansPage)
          }}
          onDismiss={() => {
            console.log('[HomePage] User dismissed generate recipes tour');
            dismissTour();
          }}
          actionLabel="Got it"
        />
      )}

      {/* Shortcut Introduction Modal - "Let's install your shortcut" */}
      {shouldShowTooltip(STEPS.SHORTCUT_INTRO) && (
        <IntroductionModal
          title="Let's install your shortcut"
          message="We'll help you set up a quick way to import recipes from Instagram."
          onContinue={() => {
            console.log('[HomePage] Shortcut intro - advancing to INSTALL_SHORTCUT');
            nextStep(); // Advances to INSTALL_SHORTCUT
          }}
          onClose={() => {
            console.log('[HomePage] User skipped installing shortcut');
            dismissTour();
          }}
          continueLabel="Continue"
          skipLabel="Skip installing shortcut"
        />
      )}

      {/* Shortcut Install Modal - iOS Only */}
      {shouldShowTooltip(STEPS.INSTALL_SHORTCUT) && isIOS() && (
        <ShortcutInstallModal
          onInstall={() => {
            console.log('[HomePage] User clicked Install Shortcut, starting 10-second timer');

            // Mark that user clicked install
            setUserClickedInstall(true);

            // Clear any existing timer
            if (shortcutInstallTimer) {
              clearTimeout(shortcutInstallTimer);
            }

            // Start 10-second timer
            const timer = setTimeout(() => {
              // Only show confirmation if user still intended to install
              if (userClickedInstall) {
                console.log('[HomePage] Timer fired, showing confirmation');
                nextStep(); // Show SHORTCUT_CONFIRMATION
              } else {
                console.log('[HomePage] Timer fired but user cancelled intent, not showing confirmation');
              }
            }, 10000);

            setShortcutInstallTimer(timer);
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped shortcut installation');

            // Clear timer and intent flag
            if (shortcutInstallTimer) {
              clearTimeout(shortcutInstallTimer);
              setShortcutInstallTimer(null);
            }
            setUserClickedInstall(false);

            nextStep(); // Skip to next step
          }}
          onCancelTimer={() => {
            console.log('[HomePage] Cancelling install timer - user clicked skip');

            // Clear timer and intent flag
            if (shortcutInstallTimer) {
              clearTimeout(shortcutInstallTimer);
              setShortcutInstallTimer(null);
            }
            setUserClickedInstall(false);
          }}
        />
      )}

      {/* Shortcut Confirmation Modal */}
      {shouldShowTooltip(STEPS.SHORTCUT_CONFIRMATION) && (
        <ShortcutConfirmationModal
          onYes={() => {
            console.log('[HomePage] User confirmed shortcut installed');
            nextStep(); // Move to SHORTCUT_SUCCESS_BRIDGE
          }}
          onNo={() => {
            console.log('[HomePage] User needs to install shortcut');
            goToStep(STEPS.INSTALL_SHORTCUT); // Back to shortcut install flow
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped confirmation');
            dismissTour();
          }}
        />
      )}

      {/* Shortcut Success Bridge Modal */}
      {shouldShowTooltip(STEPS.SHORTCUT_SUCCESS_BRIDGE) && (
        <ShortcutSuccessBridgeModal
          onLetsGo={() => {
            console.log('[HomePage] Starting recipe import flow');
            nextStep(); // Move to IMPORT_RECIPE_INTRO
          }}
        />
      )}

      {/* Recipe Import Intro Modal */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_INTRO) && (
        <RecipeImportIntroModal
          onShowMeHow={() => {
            console.log('[HomePage] Checking notification status');
            // Check notification permission
            const notificationStatus = checkNotificationPermission();
            setPreFlightStatus({
              hasNotifications: notificationStatus === 'granted',
              hasShortcut: false // Will ask user manually
            });
            nextStep(); // Move to IMPORT_RECIPE_PREFLIGHT
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped recipe import');
            dismissTour();
          }}
        />
      )}

      {/* Pre-Flight Check Modal - Two-step check */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_PREFLIGHT) && (
        <PreFlightCheckModal
          hasNotifications={preFlightStatus.hasNotifications}
          onContinue={() => {
            console.log('[HomePage] Continuing to recipe import steps');
            nextStep(); // Move to IMPORT_RECIPE_STEP_1
          }}
          onEnableNotifications={async () => {
            console.log('[HomePage] Requesting notification permission');
            const permission = await requestNotificationPermission();
            if (permission === 'granted') {
              setPreFlightStatus(prev => ({ ...prev, hasNotifications: true }));
            }
          }}
          onInstallShortcut={() => {
            console.log('[HomePage] User needs shortcut, redirecting to install flow');
            goToStep(STEPS.INSTALL_SHORTCUT);
          }}
          onSkip={() => {
            console.log('[HomePage] User skipped preflight check');
            dismissTour();
          }}
        />
      )}

      {/* Step 1: Open an Instagram Post (Tutorial) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_1) && (
        <RecipeImportStepModal
          stepNumber={1}
          title="Open an Instagram Post"
          description="First, you'll need to find a recipe on Instagram that you want to save."
          showPhoneFrame={true}
          frameImage={importRecipeStep1Image}
          buttonText="Next"
          showBackButton={false}
          onNext={() => {
            console.log('[HomePage] Step 1 complete, moving to Step 2');
            nextStep();
          }}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 2: Tap the Share Icon (Tutorial) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_2) && (
        <RecipeImportStepModal
          stepNumber={2}
          title={
            <>
              Tap <span style={{color: 'var(--primary-green, #4fcf61)'}}>Share</span> Icon and Click{' '}
              <span style={{color: 'var(--primary-green, #4fcf61)'}}>Share to</span>
            </>
          }
          description="Find the paper airplane icon at the bottom of the Instagram post and tap it."
          videoSrc="/videos/import-tutorial/step2-tap-share.mp4"
          buttonText="Next"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_1)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 3: Scroll Down and Select (Tutorial - Combined) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_3) && (
        <RecipeImportStepModal
          stepNumber={3}
          title={
            <>
              Scroll Down and Select{' '}
              <span style={{color: 'var(--primary-green, #4fcf61)'}}>Save to Trackabite</span>
            </>
          }
          description="Scroll through the share menu and tap the 'Save to Trackabite' shortcut."
          videoSrc="/videos/import-tutorial/step3-save-to-trackabite.mp4"
          buttonText="Next"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_2)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 4: Allow Instagram to Send Items (NEW) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_4) && (
        <RecipeImportStepModal
          stepNumber={4}
          title={
            <>
              <span style={{color: 'var(--primary-green, #4fcf61)'}}>Always Allow</span>
              {' '}Instagram to Send Items to Trackabite
            </>
          }
          description="Tap 'Always Allow' to allow Instagram to send items to Trackabite."
          icon={{ type: 'img', src: importRecipeStep4Image }}
          buttonText="Next"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_3)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 5: View Your Recipe (Tutorial) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_5) && (
        <RecipeImportStepModal
          stepNumber={5}
          title="View Your Recipe"
          description="Wait for our Fridgy to analyze your recipe and view it when it's ready."
          icon="checkmark"
          buttonText="Ok, Got It"
          onNext={() => nextStep()}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_4)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Step 6: Let's Start Importing (Action!) */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_STEP_6) && (
        <RecipeImportStepModal
          stepNumber={6}
          title={<><div style={{fontSize: '0.9rem', fontWeight: '400', color: '#666', marginBottom: '0.5rem'}}>Perfecto!</div>Now Let's Start Importing Your First Recipe!</>}
          description=""
          icon={cookingIcon}
          buttonText="Open an Instagram Post"
          onNext={() => {
            console.log('[HomePage] Opening Instagram and starting detection');
            window.open('https://www.instagram.com/p/DGioQ5qOWij/', '_blank');

            // Start detection immediately
            detectRecipeImport({
              onSuccess: (recipe) => {
                console.log('[HomePage] Recipe detected!', recipe);
                setImportedRecipe(recipe);
                goToStep(STEPS.IMPORT_RECIPE_SUCCESS);
              },
              onTimeout: () => {
                console.log('[HomePage] Detection timed out');
                alert('We couldn\'t find your imported recipe. Please try again or check your saved recipes.');
                dismissTour();
              }
            });
          }}
          onBack={() => goToStep(STEPS.IMPORT_RECIPE_STEP_5)}
          onSkip={() => dismissTour()}
        />
      )}

      {/* Recipe Import Success Modal */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_SUCCESS) && (
        <RecipeImportSuccessModal
          recipe={importedRecipe}
          onViewRecipes={() => {
            console.log('[HomePage] Viewing recipes');
            completeTour();
            navigate('/saved-recipes');
          }}
          onContinue={() => {
            console.log('[HomePage] Continuing tour');
            completeTour();
          }}
        />
      )}
    </div>
  );
};

export default HomePage; 