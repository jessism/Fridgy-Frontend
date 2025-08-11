import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import './AppNavBar.css';
import trackaBiteLogo from '../../assets/images/Trackabite-logo.png';

const AppNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProfileDropdownOpen]);

  const handleHomeClick = () => {
    navigate('/home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleAccountSettings = () => {
    setIsProfileDropdownOpen(false);
    navigate('/profile'); // Navigate to existing profile page
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Helper function to check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-brand">
          <Link to="/home" className="brand-link">
            <img 
              src={trackaBiteLogo} 
              alt="Trackabite logo" 
              className="brand-logo"
            />
            <h2>Trackabite</h2>
          </Link>
        </div>
        <div className="nav-menu">
          <Link 
            to="/home" 
            className={`nav-link ${isActiveLink('/home') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/inventory" 
            className={`nav-link ${isActiveLink('/inventory') ? 'active' : ''}`}
          >
            Inventory
          </Link>
          <Link 
            to="/meal-plans" 
            className={`nav-link ${isActiveLink('/meal-plans') ? 'active' : ''}`}
          >
            Meal Plans
          </Link>
          
          {/* Profile Dropdown */}
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <button 
              className="profile-button"
              onClick={toggleProfileDropdown}
              aria-label="Profile menu"
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
            >
              <div className="profile-avatar">
                {getUserInitials()}
              </div>
              <span className="profile-name">{user?.firstName || 'User'}</span>
              <svg 
                className={`dropdown-arrow ${isProfileDropdownOpen ? 'rotated' : ''}`}
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="currentColor"
              >
                <path d="M6 8.5L2.5 5h7L6 8.5z"/>
              </svg>
            </button>

            {isProfileDropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-options">
                  <button 
                    className="profile-dropdown-option"
                    onClick={handleAccountSettings}
                  >
                    Account Settings
                  </button>
                  <button 
                    className="profile-dropdown-option"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default AppNavBar; 