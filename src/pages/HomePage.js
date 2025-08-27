import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
import useInventory from '../hooks/useInventory';
import appLogo from '../assets/images/Logo.png';
import { ReactComponent as AddToFridgeIcon } from '../assets/icons/quickaccess/add-to-fridge.svg';
import { ReactComponent as MyFridgeIcon } from '../assets/icons/quickaccess/my-fridge.svg';
import { ReactComponent as ShopListsIcon } from '../assets/icons/quickaccess/shop-lists.svg';
import { ReactComponent as RecipesIcon } from '../assets/icons/quickaccess/recipes.svg';
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
  const { items } = useInventory();
  const navigate = useNavigate();

  // Function to navigate and scroll to top
  const navigateToPage = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate category counts from real inventory data
  const getCategoryCounts = () => {
    const counts = {
      'Protein': 0,
      'Dairy': 0, 
      'Vegetables': 0,
      'Fruits': 0,
      'Grains': 0,
      'Fats and Oils': 0
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

  const expiringItems = getExpiringItems();
  
  return (
    <div className="homepage">
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

      {/* Page Greeting */}
      <section className="page-greeting">
        <div className="container">
          <div className="greeting-content">
            <img src={appLogo} alt="Logo" className="greeting-logo" />
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
            <div className="category-card">
              <div className="category-count">{categoryCounts['Protein']}</div>
              <div className="category-image">
                <span className="food-emoji">🍖</span>
              </div>
              <h3>Protein</h3>
            </div>

            <div className="category-card">
              <div className="category-count">{categoryCounts['Dairy']}</div>
              <div className="category-image">
                <span className="food-emoji">🧀</span>
              </div>
              <h3>Dairy</h3>
            </div>

            <div className="category-card">
              <div className="category-count">{categoryCounts['Vegetables']}</div>
              <div className="category-image">
                <span className="food-emoji">🥬</span>
              </div>
              <h3>Vegetables</h3>
            </div>

            <div className="category-card">
              <div className="category-count">{categoryCounts['Fruits']}</div>
              <div className="category-image">
                <span className="food-emoji">🍊</span>
              </div>
              <h3>Fruits</h3>
            </div>

            <div className="category-card">
              <div className="category-count">{categoryCounts['Grains']}</div>
              <div className="category-image">
                <span className="food-emoji">🍞</span>
              </div>
              <h3>Grains</h3>
            </div>

            <div className="category-card">
              <div className="category-count">{categoryCounts['Fats and Oils']}</div>
              <div className="category-image">
                <span className="food-emoji">🥥</span>
              </div>
              <h3>Fats and Oils</h3>
            </div>
          </div>
         </div>
       </section>

      {/* Expiring Soon Section */}
      <section className="expiring-soon">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Expiring Soon
            </h2>
          </div>
          <div className="expiring-content" onClick={() => navigateToPage('/inventory')}>
            <div className="expiring-items">
              {expiringItems.length > 0 ? (
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
              ) : (
                <div className="expiring-item">
                  <div className="item-info">
                    <h4 className="item-name">No items expiring soon</h4>
                    <p className="item-category">Your food is staying fresh!</p>
                  </div>
                </div>
              )}
            </div>
            {expiringItems.length > 0 && (
              <>
                <div className="expiring-subtitle">
                  <p>They are still good. See how to use them in Meals.</p>
                </div>
                <div className="expiring-reminders">
                  <span className="reminder-text">+{expiringItems.length} reminders</span>
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

      {/* Quick Access Section */}
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
              onClick={() => navigateToPage('/shopping-list')}
            >
              <div className="quick-access-icon">
                <ShopListsIcon />
              </div>
              <span className="quick-access-label">Shop lists</span>
            </div>
            <div className="quick-access-item">
              <div className="quick-access-icon">
                <RecipesIcon />
              </div>
              <span className="quick-access-label">Recipes</span>
            </div>
          </div>
        </div>
      </section>
      
      <MobileBottomNav />
    </div>
  );
};

export default HomePage; 