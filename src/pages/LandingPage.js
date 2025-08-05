import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const LandingPage = () => {
  return (
    <div className="homepage">
      {/* Simple Header with Sign Up Button */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h2>Fridgy</h2>
            </div>
            <div className="auth-actions">
              <Link to="/signup" className="btn btn-primary signup-btn">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

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
                <Link to="/signup" className="btn btn-secondary hero-btn">
                  Get Started
                </Link>
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
            <h2 className="section-title">Expiring Soon</h2>
          </div>
          <div className="expiring-items">
            <div className="expiring-item">
              <div className="item-info">
                <span className="item-category">Dairy</span>
                <span className="item-name">Greek Yogurt</span>
              </div>
              <div className="expiry-info">
                <span className="expiry-date">Expires in 2 days</span>
              </div>
            </div>
            <div className="expiring-item">
              <div className="item-info">
                <span className="item-category">Vegetables</span>
                <span className="item-name">Spinach</span>
              </div>
              <div className="expiry-info">
                <span className="expiry-date">Expires in 3 days</span>
              </div>
            </div>
            <div className="expiring-item">
              <div className="item-info">
                <span className="item-category">Fruits</span>
                <span className="item-name">Bananas</span>
              </div>
              <div className="expiry-info">
                <span className="expiry-date">Expires in 1 day</span>
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
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=center" alt="Margherita Pizza" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Margherita Pizza</h3>
                <button className="cook-btn">Cook Now</button>
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
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&crop=center" alt="Grilled Salmon" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Grilled Salmon</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 75%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 25 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&crop=center" alt="Chocolate Cake" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Chocolate Cake</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 68%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 60 minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="meal-card">
              <div className="meal-image">
                <span className="stock-badge">• In stock</span>
                <img src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop&crop=center" alt="Beef Tacos" />
              </div>
              <div className="meal-info">
                <h3 className="meal-title">Beef Tacos</h3>
                <button className="cook-btn outlined">Cook Now</button>
                <div className="meal-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🥘</span>
                    <span className="stat-text">Ingredients match: 90%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Cook time: 20 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping List Section */}
      <section className="shopping-list">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Your shopping list</h2>
          </div>
          <div className="shopping-items">
            <div className="shopping-item">
              <input type="checkbox" className="item-checkbox" />
              <span className="item-name">Organic Milk</span>
              <span className="item-quantity">1 carton</span>
            </div>
            <div className="shopping-item">
              <input type="checkbox" className="item-checkbox" />
              <span className="item-name">Fresh Spinach</span>
              <span className="item-quantity">2 bags</span>
            </div>
            <div className="shopping-item">
              <input type="checkbox" className="item-checkbox" />
              <span className="item-name">Chicken Breast</span>
              <span className="item-quantity">1 lb</span>
            </div>
          </div>
          <div className="shopping-actions">
            <button className="btn btn-primary add-item-btn">
              + Add more items
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 