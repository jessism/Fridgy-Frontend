import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useGuidedTourContext } from '../../contexts/GuidedTourContext';
import GuidedTooltip from '../guided-tour/GuidedTooltip';
import '../guided-tour/GuidedTour.css'; // Import guided tour styles
import './AppNavBar.css';
import appLogo from '../../assets/images/Logo.png';

const AppNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { shouldShowTooltip, completeStep, STEPS, currentStep, isActive } = useGuidedTourContext();
  const dropdownRef = useRef(null);
  const addModalRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('[AppNavBar] Guided tour state:', {
      isActive,
      currentStep,
      shouldShowAddGroceries: shouldShowTooltip(STEPS.ADD_GROCERIES),
      STEPS
    });
  }, [isActive, currentStep, shouldShowTooltip, STEPS]);

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
      if (addModalRef.current && !addModalRef.current.contains(event.target)) {
        setIsAddModalOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsAddModalOpen(false);
      }
    };

    if (isProfileDropdownOpen || isAddModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProfileDropdownOpen, isAddModalOpen]);

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

  const handleAddButtonClick = () => {
    setIsAddModalOpen(true);

    // Mark step 1 complete when user clicks "+"
    if (shouldShowTooltip(STEPS.ADD_GROCERIES)) {
      completeStep(STEPS.ADD_GROCERIES);
    }
  };

  const handleAddGrocery = () => {
    setIsAddModalOpen(false);
    navigate('/batchcamera');

    // Mark step 2 complete when user clicks "Add Grocery"
    if (shouldShowTooltip(STEPS.ADD_ITEMS_MENU)) {
      completeStep(STEPS.ADD_ITEMS_MENU);
    }
  };

  const handleAddRecipe = () => {
    setIsAddModalOpen(false);
    navigate('/meal-plans/recipes');
  };

  const handleAddMeal = () => {
    setIsAddModalOpen(false);
    navigate('/mealscanner');
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
              src={appLogo} 
              alt="App logo" 
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
            to="/meal-plans/recipes"
            className={`nav-link ${isActiveLink('/meal-plans') ? 'active' : ''}`}
          >
            Meals
          </Link>
          
          {/* Add to Fridge Button */}
          <button
            onClick={handleAddButtonClick}
            className="add-to-fridge-button"
            title="Add to Fridge"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#81e053"/>
              <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
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
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      navigate('/import');
                    }}
                  >
                    Import Recipe
                  </button>
                  <button
                    className="profile-dropdown-option"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      navigate('/saved-recipes');
                    }}
                  >
                    My Cookbook
                  </button>
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

      {/* Guided Tour Tooltips */}
      {shouldShowTooltip(STEPS.ADD_GROCERIES) && (location.pathname === '/home' || location.pathname === '/') && (
        <>
          {console.log('[AppNavBar] 🎯 Rendering GuidedTooltip component NOW')}
          <GuidedTooltip
            targetSelector=".add-button, .add-to-fridge-button"
            message="Tap the + button"
            position="top"
            showAction={false}
            highlight={true}
            offset={16}
          />
        </>
      )}

      {shouldShowTooltip(STEPS.ADD_ITEMS_MENU) && isAddModalOpen && (
        <GuidedTooltip
          targetSelector=".add-modal-option-grocery"
          message='Tap "Add Grocery"'
          position="bottom"
          onAction={handleAddGrocery}
          actionLabel="Scan items"
          highlight={true}
        />
      )}


      {/* Add Options Modal */}
      {isAddModalOpen && (
        <div className="add-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="add-modal-content" ref={addModalRef} onClick={(e) => e.stopPropagation()}>
            <div className="add-modal-header">
              <div className="add-modal-handle"></div>
            </div>
            <div className="add-modal-options">
              <button className="add-modal-option add-modal-option-grocery" onClick={handleAddGrocery}>
                <div className="add-modal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                  </svg>
                </div>
                <span className="add-modal-option-label">Add Grocery</span>
              </button>

              <button className="add-modal-option" onClick={handleAddRecipe}>
                <div className="add-modal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <path d="M12 6h4"/>
                    <path d="M12 10h4"/>
                  </svg>
                </div>
                <span className="add-modal-option-label">Add Recipe</span>
              </button>

              <button className="add-modal-option" onClick={handleAddMeal}>
                <div className="add-modal-option-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 2v20M11 7h5a4 4 0 0 0 0-5"/>
                    <path d="M7 2v8l-1.5 1.5a1 1 0 0 0 0 1.4l.3.3a1 1 0 0 0 1.4 0L9 11.4V22"/>
                  </svg>
                </div>
                <span className="add-modal-option-label">Add Meal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AppNavBar; 