import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ListIcon from './ListIcon';
import MealsIcon from './MealsIcon';
import { useGuidedTourContext } from '../../contexts/GuidedTourContext';
import GuidedTooltip from '../guided-tour/GuidedTooltip';
import '../guided-tour/GuidedTour.css';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheetLevel, setSheetLevel] = useState('main'); // 'main' | 'recipe' | 'upload'
  const { shouldShowTooltip, completeStep, STEPS } = useGuidedTourContext();

  const isActiveTab = (path) => {
    return location.pathname === path;
  };

  const handlePlusButtonClick = () => {
    setIsModalOpen(true);

    // Mark step 1 complete when user clicks "+"
    if (shouldShowTooltip(STEPS.ADD_GROCERIES)) {
      completeStep(STEPS.ADD_GROCERIES);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSheetLevel('main'); // Reset to main level when closing
  };

  // Navigate back one level in the sheet
  const handleBack = () => {
    if (sheetLevel === 'upload') {
      setSheetLevel('recipe');
    } else if (sheetLevel === 'recipe') {
      setSheetLevel('main');
    }
  };

  const handleLogGrocery = () => {
    setIsModalOpen(false);

    // Mark step 2 complete and advance to ITEMS_ADDED when user clicks "Add Grocery"
    if (shouldShowTooltip(STEPS.ADD_ITEMS_MENU)) {
      completeStep(STEPS.ADD_ITEMS_MENU); // This advances to ITEMS_ADDED
    }

    navigate('/batchcamera');
  };

  // Slide to recipe options (Level 2)
  const handleAddRecipe = () => {
    setSheetLevel('recipe');
  };

  // Slide to upload options (Level 3)
  const handleUploadRecipe = () => {
    setSheetLevel('upload');
  };

  // Import Recipe - navigate to import page
  const handleImportRecipe = () => {
    setIsModalOpen(false);
    setSheetLevel('main');
    navigate('/import');
  };

  // Scan Recipe - navigate to recipe scanner
  const handleScanRecipe = () => {
    setIsModalOpen(false);
    setSheetLevel('main');
    navigate('/recipe-scanner');
  };

  // Manual Entry - navigate to manual recipe form
  const handleManualEntry = () => {
    setIsModalOpen(false);
    setSheetLevel('main');
    navigate('/recipes/manual');
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
      path: '/batchcamera',
      icon: (
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" fill="#1F2937" stroke="none"/>
          <path d="M14 10V18M10 14H18" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      ),
      label: '',
      isAddButton: true
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
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                type="button"
              >
                <div className="nav-icon">
                  {typeof item.icon === 'function' ? item.icon(isActive) : item.icon}
                </div>
                {item.label && (
                  <span className="nav-label">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Guided Tour Tooltips for Mobile */}
      {shouldShowTooltip(STEPS.ADD_GROCERIES) && (location.pathname === '/home' || location.pathname === '/') && (
        <>
          {console.log('[MobileBottomNav] 🎯 Rendering tooltip for ADD_GROCERIES')}
          <GuidedTooltip
            targetSelector=".mobile-bottom-nav .add-button"
            message="Tap the + button"
            position="top"
            showAction={false}
            highlight={true}
            offset={20}
          />
        </>
      )}

      {shouldShowTooltip(STEPS.ADD_ITEMS_MENU) && isModalOpen && (
        <GuidedTooltip
          targetSelector=".modal-option-grocery"
          message='Tap "Add Grocery"'
          position="centered-above-modal"
          showAction={false}
          onDismiss={null}
          highlight={true}
          offset={180}
        />
      )}


      {/* Bottom Slide-Up Modal with Multi-Level Navigation */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-handle"></div>
            </div>

            {/* Overflow wrapper for sliding effect */}
            <div className="mobile-bottom-nav__sheet-wrapper">
              {/* Sliding container with 3 panels */}
              <div className={`mobile-bottom-nav__sheet-slider mobile-bottom-nav__sheet-slider--${sheetLevel}`}>

                {/* Panel 1: Main Menu */}
                <div className="mobile-bottom-nav__sheet-panel">
                  <div className="modal-options">
                    <button className="modal-option modal-option-grocery modal-option--grocery" onClick={handleLogGrocery}>
                      <div className="modal-option-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                        </svg>
                      </div>
                      <span className="modal-option-label">Add Grocery</span>
                    </button>

                    <button className="modal-option modal-option--recipe" onClick={handleAddRecipe}>
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

                    <button className="modal-option modal-option--meal" onClick={handleLogMeal}>
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

                {/* Panel 2: Recipe Options (Import / Upload) */}
                <div className="mobile-bottom-nav__sheet-panel">
                  <div className="mobile-bottom-nav__sheet-options">
                    <button className="mobile-bottom-nav__sheet-option" onClick={handleImportRecipe}>
                      <div className="mobile-bottom-nav__sheet-option-icon">
                        {/* Globe/Link icon for import from web */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M2 12h20"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                      </div>
                      <span className="mobile-bottom-nav__sheet-option-label">Import from the internet</span>
                    </button>

                    <button className="mobile-bottom-nav__sheet-option" onClick={handleUploadRecipe}>
                      <div className="mobile-bottom-nav__sheet-option-icon">
                        {/* Upload arrow icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <span className="mobile-bottom-nav__sheet-option-label">Upload Recipe</span>
                    </button>
                  </div>
                </div>

                {/* Panel 3: Upload Options (Scan / Manual) */}
                <div className="mobile-bottom-nav__sheet-panel">
                  <div className="mobile-bottom-nav__sheet-options">
                    <button className="mobile-bottom-nav__sheet-option" onClick={handleScanRecipe}>
                      <div className="mobile-bottom-nav__sheet-option-icon">
                        {/* Camera icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </div>
                      <span className="mobile-bottom-nav__sheet-option-label">Scan with camera</span>
                    </button>

                    <button className="mobile-bottom-nav__sheet-option" onClick={handleManualEntry}>
                      <div className="mobile-bottom-nav__sheet-option-icon">
                        {/* Pencil icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </div>
                      <span className="mobile-bottom-nav__sheet-option-label">Manual Entry</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;