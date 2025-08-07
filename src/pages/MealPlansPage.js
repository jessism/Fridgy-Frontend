import React from 'react';
import { Link } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import './HomePage.css'; // Now in the same directory

const MealPlansPage = () => {
  return (
    <div className="homepage">
      <AppNavBar />

      {/* Meal Plans Content */}
      <div style={{paddingTop: '100px', minHeight: '100vh', background: 'white'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
          <h1 style={{fontFamily: 'var(--header-font)', fontSize: '3rem', color: 'var(--header-color)', marginBottom: '2rem'}}>
            Meal Plans
          </h1>
          <p style={{fontFamily: 'var(--description-font)', fontSize: '1.2rem', color: 'var(--description-color)', marginBottom: '3rem'}}>
            Plan your meals and discover recipes based on your available ingredients
          </p>
          
          {/* Cook What You Have Section */}
          <div className="cook-what-you-have" style={{marginBottom: '4rem'}}>
            <div className="section-header-with-arrow">
              <h2 className="section-title">Cook what you have</h2>
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
          
          {/* Inspired by Your Preference Section */}
          <div className="cook-what-you-have" style={{marginBottom: '4rem'}}>
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
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default MealPlansPage; 