import React from 'react';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import './ShoppingListPage.css';

const ShoppingListPage = () => {
  return (
    <div className="shopping-list-page">
      <Navbar />
      
      <main className="main-content">
        <div className="container">
          <div className="coming-soon-section">
            <div className="coming-soon-content">
              <div className="icon-container">
                <span className="shopping-icon">🛒</span>
              </div>
              <h1 className="coming-soon-title">Shopping List</h1>
              <p className="coming-soon-subtitle">
                We're working on an amazing shopping list feature that will help you track what you need to buy based on your inventory and meal plans.
              </p>
              <div className="features-preview">
                <div className="feature-item">
                  <span className="feature-icon">✨</span>
                  <span className="feature-text">Smart suggestions based on your fridge</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📝</span>
                  <span className="feature-text">Organize by store sections</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <span className="feature-text">Sync with meal plans</span>
                </div>
              </div>
              <div className="cta-section">
                <p className="cta-text">Coming Soon!</p>
                <button className="notify-btn" disabled>
                  🔔 Notify me when ready
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
};

export default ShoppingListPage;