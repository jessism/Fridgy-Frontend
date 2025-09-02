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
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      ),
      label: 'Home'
    },
    {
      path: '/inventory',
      icon: <ListIcon />,
      label: 'Inventory'
    },
    {
      path: '/batchcamera',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="12" fill="#81e053" stroke="none"/>
          <path d="M14 9V19M9 14H19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      label: '',
      isAddButton: true
    },
    {
      path: '/meal-plans',
      icon: <MealsIcon />,
      label: 'Meals'
    },
    {
      path: '/profile',
      icon: (
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
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-tab ${isActiveTab(item.path) ? 'active' : ''}`}
              >
                <div className="nav-icon">
                  {item.icon}
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