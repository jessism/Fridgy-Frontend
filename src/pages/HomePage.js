import React from 'react';
import Navbar from '../components/Navbar';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
                              <h1 className="hero-title">
                  Hello, Jessie!
                </h1>
                <p className="hero-subtitle">
                  Relax please, we've got you <br />
                  covered every day of the week
                </p>
                              <div className="hero-actions">
                  <button className="btn btn-secondary hero-btn">
                    Discover menu
                  </button>
                </div>
            </div>
            <div className="hero-image">
              <div className="food-bowl">
                <img src="/hero-bowl.jpg" alt="Fresh healthy bowl" className="bowl-image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What's in Your Fridge</h2>
            <p className="section-subtitle">Choose from our organized food categories to start tracking your inventory</p>
          </div>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-count">12</div>
              <div className="category-image">
                <span className="food-emoji">🍖</span>
              </div>
              <h3>Protein</h3>
            </div>

            <div className="category-card">
              <div className="category-count">8</div>
              <div className="category-image">
                <span className="food-emoji">🧀</span>
              </div>
              <h3>Dairy</h3>
            </div>

            <div className="category-card">
              <div className="category-count">15</div>
              <div className="category-image">
                <span className="food-emoji">🥬</span>
              </div>
              <h3>Vegetables</h3>
            </div>

            <div className="category-card">
              <div className="category-count">7</div>
              <div className="category-image">
                <span className="food-emoji">🍊</span>
              </div>
              <h3>Fruits</h3>
            </div>

            <div className="category-card">
              <div className="category-count">5</div>
              <div className="category-image">
                <span className="food-emoji">🍞</span>
              </div>
              <h3>Grains</h3>
            </div>

            <div className="category-card">
              <div className="category-count">3</div>
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
              <span className="warning-icon">⚠️</span>
              Expiring Soon
            </h2>
          </div>
          <div className="expiring-items">
            <div className="expiring-item">
              <div className="item-info">
                <h4 className="item-name">Greek Yogurt</h4>
                <p className="item-category">Fridge</p>
              </div>
              <div className="expiry-countdown">
                <span className="days-left">2 days</span>
              </div>
            </div>
            <div className="expiring-item">
              <div className="item-info">
                <h4 className="item-name">Spinach</h4>
                <p className="item-category">Fridge</p>
              </div>
              <div className="expiry-countdown">
                <span className="days-left urgent">1 day</span>
              </div>
            </div>
            <div className="expiring-item">
              <div className="item-info">
                <h4 className="item-name">Bread</h4>
                <p className="item-category">Pantry</p>
              </div>
              <div className="expiry-countdown">
                <span className="days-left">3 days</span>
              </div>
            </div>
            <div className="expiring-item">
              <div className="item-info">
                <h4 className="item-name">Milk</h4>
                <p className="item-category">Fridge</p>
              </div>
              <div className="expiry-countdown">
                <span className="days-left urgent">1 day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cook What You Have Section */}
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

      {/* Inspired by Your Preference Section */}
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

      {/* Your Shopping List Section */}
      <section className="expiring-soon">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="shopping-icon">🛒</span>
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
            <div className="expiring-item shopping-item">
              <div className="item-checkbox">
                <input type="checkbox" id="parmesan" checked />
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
            <div className="expiring-item shopping-item">
              <div className="item-checkbox">
                <input type="checkbox" id="eggs" checked />
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
            <div className="expiring-item shopping-item">
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
            <div className="expiring-item shopping-item">
              <div className="item-checkbox">
                <input type="checkbox" id="muffins" checked />
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
    </div>
  );
};

export default HomePage; 