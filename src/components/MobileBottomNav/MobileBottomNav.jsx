import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();

  const isActiveTab = (path) => {
    return location.pathname === path;
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
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
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
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16.2 7.8l-2 6.3-6.3 2 2-6.3 6.3-2z"/>
        </svg>
      ),
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
    <nav className="mobile-bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-tab ${isActiveTab(item.path) ? 'active' : ''} ${item.isAddButton ? 'add-button' : ''}`}
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
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;