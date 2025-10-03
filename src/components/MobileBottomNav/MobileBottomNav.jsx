import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ListIcon from './ListIcon';
import MealsIcon from './MealsIcon';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActiveTab = (path) => {
    return location.pathname === path;
  };

  const handlePlusButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLogGrocery = () => {
    setIsModalOpen(false);
    navigate('/batchcamera');
  };

  const handleAddRecipe = () => {
    setIsModalOpen(false);
    navigate('/meal-plans/recipes');
  };

  const handleLogMeal = () => {
    setIsModalOpen(false);
    navigate('/mealscanner');
  };

  const navItems = [
    {
      path: '/home',
      icon: (isActive) => isActive ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <rect x="9" y="12" width="6" height="10" fill="white"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      ),
      label: 'Home'
    },
    {
      path: '/inventory',
      icon: (isActive) => isActive ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="4" width="18" height="2" rx="1"/>
          <rect x="3" y="11" width="18" height="2" rx="1"/>
          <rect x="3" y="18" width="18" height="2" rx="1"/>
        </svg>
      ) : (
        <ListIcon />
      ),
      label: 'Inventory'
    },
    {
      path: '/batchcamera',
      icon: (
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" fill="#81e053" stroke="none"/>
          <path d="M14 10V18M10 14H18" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      ),
      label: '',
      isAddButton: true
    },
    {
      path: '/meal-plans/recipes',
      icon: (isActive) => isActive ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          {/* Fork - filled */}
          <path d="M7 2v6l2 2v12h-2V10l-2-2V2h2zm0 0h-2v4h2V2zm-2 0h-2v4h2V2zm4 0h-2v4h2V2z" />
          {/* Knife - filled */}
          <path d="M17 2v20h2V2h-2zm0 0c2 0 3 1.5 3 3.5S19 9 17 9V2z" />
        </svg>
      ) : (
        <MealsIcon />
      ),
      label: 'Meals'
    },
    {
      path: '/profile',
      icon: (isActive) => isActive ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      label: 'Profile'
    }
  ];

  return (
    <>
      <nav className="mobile-bottom-nav">
        <div className="nav-container">
          {navItems.map((item) => {
            if (item.isAddButton) {
              return (
                <button
                  key={item.path}
                  onClick={handlePlusButtonClick}
                  className="nav-tab add-button"
                >
                  <div className="nav-icon">
                    {item.icon}
                  </div>
                  {item.label && (
                    <span className="nav-label">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            }
            
            const isActive = isActiveTab(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-tab ${isActive ? 'active' : ''}`}
              >
                <div className="nav-icon">
                  {typeof item.icon === 'function' ? item.icon(isActive) : item.icon}
                </div>
                {item.label && (
                  <span className="nav-label">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Slide-Up Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-handle"></div>
            </div>
            <div className="modal-options">
              <button className="modal-option" onClick={handleLogGrocery}>
                <div className="modal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                  </svg>
                </div>
                <span className="modal-option-label">Add Grocery</span>
              </button>

              <button className="modal-option" onClick={handleAddRecipe}>
                <div className="modal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <path d="M12 6h4"/>
                    <path d="M12 10h4"/>
                  </svg>
                </div>
                <span className="modal-option-label">Add Recipe</span>
              </button>

              <button className="modal-option" onClick={handleLogMeal}>
                <div className="modal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 2v20M11 7h5a4 4 0 0 0 0-5"/>
                    <path d="M7 2v8l-1.5 1.5a1 1 0 0 0 0 1.4l.3.3a1 1 0 0 0 1.4 0L9 11.4V22"/>
                  </svg>
                </div>
                <span className="modal-option-label">Add Meal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;