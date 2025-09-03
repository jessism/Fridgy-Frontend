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

  const handleLogMeal = () => {
    setIsModalOpen(false);
    navigate('/mealscanner');
  };

  const navItems = [
    {
      path: '/home',
      icon: (isActive) => isActive ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <rect x="9" y="12" width="6" height="10" fill="white"/>
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      ),
      label: 'Home'
    },
    {
      path: '/inventory',
      icon: (isActive) => isActive ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" fill="#81e053" stroke="none"/>
          <path d="M14 10V18M10 14H18" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      ),
      label: '',
      isAddButton: true
    },
    {
      path: '/meal-plans',
      icon: (isActive) => isActive ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m6-6h4a2 2 0 0 1 2 2v3c0 1.1-.9 2-2 2h-4m-6 0V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/>
                    <path d="M1 15h22"/>
                  </svg>
                </div>
                <span className="modal-option-label">Scan Grocery</span>
              </button>
              
              <button className="modal-option" onClick={handleLogMeal}>
                <div className="modal-option-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16.2 7.8l-2 6.3-6.3 2 2-6.3 6.3-2z"/>
                  </svg>
                </div>
                <span className="modal-option-label">Scan Meal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;