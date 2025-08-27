import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { EditIcon, DeleteIcon } from '../components/icons';
import MealDetailModal from '../components/modals/MealDetailModal';
import './MealHistoryPage.css';

const MealHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, -1 = previous week, 1 = next week
  const [dailyMeals, setDailyMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Edit/Delete modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);

  // Load today's meals on initial mount
  useEffect(() => {
    fetchMealsForDate(selectedDate);
  }, []);

  // Check if returning from meal scanner and refresh meals
  useEffect(() => {
    if (location.state?.returnDate) {
      const returnDate = new Date(location.state.returnDate);
      setSelectedDate(returnDate);
      // Add small delay to ensure meal is saved in database
      setTimeout(() => {
        fetchMealsForDate(returnDate);
      }, 500);
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCurrentMonthYear = () => {
    return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    // Apply week offset
    currentWeekStart.setDate(currentWeekStart.getDate() + (currentWeekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      weekDates.push({
        date: date.getDate(),
        fullDate: new Date(date)
      });
    }
    
    return weekDates;
  };

  const handleBackClick = () => {
    navigate('/meal-plans');
  };

  // Week navigation functions
  const navigateToWeek = (direction) => {
    setCurrentWeekOffset(prev => prev + direction);
  };

  const goToPreviousWeek = () => navigateToWeek(-1);
  const goToNextWeek = () => navigateToWeek(1);

  // Swipe gesture handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNextWeek(); // Swipe left to go to next week
    }
    if (isRightSwipe) {
      goToPreviousWeek(); // Swipe right to go to previous week
    }
  };

  const isToday = (dateObj) => {
    const today = new Date();
    return dateObj.getDate() === today.getDate() && 
           dateObj.getMonth() === today.getMonth() && 
           dateObj.getFullYear() === today.getFullYear();
  };

  const isSelectedDate = (dateObj) => {
    return dateObj.getDate() === selectedDate.getDate() && 
           dateObj.getMonth() === selectedDate.getMonth() && 
           dateObj.getFullYear() === selectedDate.getFullYear();
  };

  // Fetch meals for a specific date
  const fetchMealsForDate = async (date) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('fridgy_token');  // Fixed: Use correct token key
      
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }
      
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/meals/history?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to fetch meals: ${response.status}`);
      }

      const data = await response.json();
      
      // Group meals by type
      const groupedMeals = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };

      if (data.meals && Array.isArray(data.meals)) {
        console.log(`📋 Found ${data.meals.length} meals for ${formattedDate}`);
        data.meals.forEach(meal => {
          const mealType = meal.meal_type || 'snack';
          if (groupedMeals[mealType]) {
            groupedMeals[mealType].push(meal);
          }
        });
      }

      setDailyMeals(groupedMeals);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date click in calendar
  const handleDateClick = async (dateObj) => {
    setSelectedDate(dateObj);
    await fetchMealsForDate(dateObj);
  };

  // Navigate to meal scanner with meal type and target date
  const handleAddFood = (mealType) => {
    // Pass state to meal scanner to return here after completion
    navigate('/mealscanner', { 
      state: { 
        mealType,
        targetDate: selectedDate, // Pass the selected date for meal logging
        returnTo: '/meal-history',
        returnDate: selectedDate 
      } 
    });
  };

  // Format selected date for display
  const formatSelectedDate = () => {
    return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  };

  // Handle edit meal
  const handleEditMeal = (meal) => {
    setMealToEdit(meal);
    setShowEditModal(true);
  };
  
  // Handle delete meal
  const handleDeleteMeal = (meal) => {
    setMealToDelete(meal);
    setShowDeleteModal(true);
  };
  
  // Handle edit confirmation
  const handleEditConfirm = async (updatedData) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/meals/${mealToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        // Refresh meals for the current date
        fetchMealsForDate(selectedDate);
        setShowEditModal(false);
        setMealToEdit(null);
      } else {
        console.error('Failed to update meal');
      }
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/meals/${mealToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refresh meals for the current date
        fetchMealsForDate(selectedDate);
        setShowDeleteModal(false);
        setMealToDelete(null);
      } else {
        console.error('Failed to delete meal');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };
  
  // Handle cancel modals
  const handleEditCancel = () => {
    setShowEditModal(false);
    setMealToEdit(null);
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMealToDelete(null);
  };

  // Helper to safely get ingredients array (handles both string and object)
  const getIngredientsArray = (ingredients) => {
    if (Array.isArray(ingredients)) return ingredients;
    if (typeof ingredients === 'string') {
      try {
        return JSON.parse(ingredients);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // State for selected meal and dropdown
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Extract meal name from data
  const getMealName = (meal) => {
    if (meal.meal_name) {
      return meal.meal_name;
    }
    
    try {
      const ingredients = typeof meal.ingredients_logged === 'string' 
        ? JSON.parse(meal.ingredients_logged) 
        : meal.ingredients_logged;
      
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        const mainItems = ingredients.slice(0, 2).map(item => {
          const name = item.name || item.item_name || '';
          return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        });
        return mainItems.join(' & ');
      }
    } catch (error) {
      console.error('Error parsing ingredients:', error);
    }
    
    return 'Home-cooked Meal';
  };

  // Calculate total calories
  const getTotalCalories = (meal) => {
    try {
      const ingredients = typeof meal.ingredients_logged === 'string' 
        ? JSON.parse(meal.ingredients_logged) 
        : meal.ingredients_logged;
      
      if (Array.isArray(ingredients)) {
        const total = ingredients.reduce((sum, item) => {
          return sum + (item.calories || 0);
        }, 0);
        return total > 0 ? `~${total} calories` : null;
      }
    } catch (error) {
      console.error('Error calculating calories:', error);
    }
    return null;
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (mealId) => {
    setOpenDropdownId(openDropdownId === mealId ? null : mealId);
  };

  // Handle dropdown close
  const handleDropdownClose = () => {
    setOpenDropdownId(null);
  };

  // Handle meal name click to open detail modal
  const handleMealNameClick = (meal) => {
    setSelectedMeal(meal);
  };

  // Enhanced edit/delete handlers that close dropdown
  const handleEditMealFromDropdown = (meal) => {
    handleEditMeal(meal);
    setOpenDropdownId(null);
  };

  const handleDeleteMealFromDropdown = (meal) => {
    handleDeleteMeal(meal);
    setOpenDropdownId(null);
  };

  // Close dropdown on ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Meal Category Section Component
  const MealCategorySection = ({ title, meals, mealType }) => {
    return (
      <div className="meal-history-page__meal-section">
        <h3 className="meal-history-page__meal-title">{title}</h3>
        
        {meals && meals.length > 0 ? (
          <div className="meal-history-page__meal-list">
            {meals.map((meal) => (
              <div key={meal.id} className="meal-history-page__meal-item">
                <div className="meal-history-page__meal-content" onClick={() => handleMealNameClick(meal)}>
                  <div className="meal-history-page__meal-info">
                    <h4 className="meal-history-page__meal-name">{getMealName(meal)}</h4>
                    {getTotalCalories(meal) && (
                      <span className="meal-history-page__meal-calories">{getTotalCalories(meal)}</span>
                    )}
                  </div>
                </div>
                
                {/* 3-dot menu */}
                <div className="meal-history-page__meal-menu">
                  <button 
                    className="meal-history-page__meal-menu-btn"
                    onClick={() => handleDropdownToggle(meal.id)}
                    aria-label="Meal options"
                  >
                    ⋮
                  </button>
                  
                  {/* Dropdown menu */}
                  {openDropdownId === meal.id && (
                    <>
                      <div className="meal-history-page__dropdown-overlay" onClick={handleDropdownClose}></div>
                      <div className="meal-history-page__dropdown-menu">
                        <button 
                          className="meal-history-page__dropdown-option"
                          onClick={() => handleEditMealFromDropdown(meal)}
                        >
                          <EditIcon />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="meal-history-page__dropdown-option"
                          onClick={() => handleDeleteMealFromDropdown(meal)}
                        >
                          <DeleteIcon />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="meal-history-page__empty-state">
            <p>No meals logged yet</p>
          </div>
        )}
        
        <button 
          className="meal-history-page__add-food-btn"
          onClick={() => handleAddFood(mealType)}
        >
          ADD FOOD
        </button>
      </div>
    );
  };

  return (
    <div className="meal-history-page">
      <AppNavBar />
      
      <div className="meal-history-page__main">
        <div className="meal-history-page__container">
          {/* Header with back button */}
          <div className="meal-history-page__header">
            <button 
              className="meal-history-page__back-button"
              onClick={handleBackClick}
              aria-label="Go back to meal plans"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Calendar */}
          <div className="meal-history-page__calendar">
            {/* Month/Year Header with Navigation */}
            <div className="meal-history-page__calendar-header">
              <button 
                className="meal-history-page__nav-arrow meal-history-page__nav-arrow--left"
                onClick={goToPreviousWeek}
                aria-label="Previous week"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="meal-history-page__month-year">
                <span className="meal-history-page__month-year-text">
                  {getCurrentMonthYear()}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <button 
                className="meal-history-page__nav-arrow meal-history-page__nav-arrow--right"
                onClick={goToNextWeek}
                aria-label="Next week"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Days of Week */}
            <div className="meal-history-page__days-header">
              {dayNames.map(day => (
                <div key={day} className="meal-history-page__day-name">
                  {day}
                </div>
              ))}
            </div>

            {/* Swipeable Row of Dates */}
            <div 
              className="meal-history-page__dates-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="meal-history-page__dates-row">
                {getCurrentWeekDates().map((dateInfo, index) => (
                  <div
                    key={index}
                    className={`meal-history-page__date-cell ${
                      isToday(dateInfo.fullDate) ? 'meal-history-page__date-cell--today' : ''
                    } ${
                      isSelectedDate(dateInfo.fullDate) ? 'meal-history-page__date-cell--selected' : ''
                    }`}
                    onClick={() => handleDateClick(dateInfo.fullDate)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="meal-history-page__date-number">
                      {dateInfo.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Date Header */}
          <div className="meal-history-page__selected-date-header">
            <h2 className="meal-history-page__selected-date-text">
              {formatSelectedDate()}
            </h2>
          </div>

          {/* Meal Sections */}
          <div className="meal-history-page__meals-container">
            {error ? (
              <div className="meal-history-page__error">
                <p>⚠️ {error}</p>
                <button onClick={() => fetchMealsForDate(selectedDate)}>Retry</button>
              </div>
            ) : isLoading ? (
              <div className="meal-history-page__loading">Loading meals...</div>
            ) : (
              <>
                <MealCategorySection 
                  title="Breakfast" 
                  meals={dailyMeals.breakfast} 
                  mealType="breakfast" 
                />
                <MealCategorySection 
                  title="Lunch" 
                  meals={dailyMeals.lunch} 
                  mealType="lunch" 
                />
                <MealCategorySection 
                  title="Dinner" 
                  meals={dailyMeals.dinner} 
                  mealType="dinner" 
                />
                <MealCategorySection 
                  title="Snacks" 
                  meals={dailyMeals.snack} 
                  mealType="snack" 
                />
              </>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />
      
      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
      />
      
      {/* Edit Modal */}
      {showEditModal && mealToEdit && (
        <div className="meal-history-page__modal-overlay">
          <div className="meal-history-page__modal">
            <h2>Edit Meal</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleEditConfirm({
                meal_name: formData.get('mealName'),
                ingredients_logged: getIngredientsArray(mealToEdit.ingredients_logged).map((ing, index) => ({
                  ...ing,
                  name: formData.get(`ingredient-${index}`),
                  quantity: parseFloat(formData.get(`quantity-${index}`)) || ing.quantity
                }))
              });
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="mealName" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Meal Name
                </label>
                <input
                  type="text"
                  id="mealName"
                  name="mealName"
                  defaultValue={mealToEdit.meal_name || ''}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Ingredients
                </label>
                {getIngredientsArray(mealToEdit.ingredients_logged).map((ingredient, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      name={`ingredient-${index}`}
                      defaultValue={ingredient.name || ingredient.item_name}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <input
                      type="number"
                      name={`quantity-${index}`}
                      defaultValue={ingredient.quantity}
                      step="0.1"
                      style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <span style={{ padding: '0.5rem' }}>{ingredient.unit}</span>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4fcf61',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Modal */}
      {showDeleteModal && mealToDelete && (
        <div className="meal-history-page__modal-overlay">
          <div className="meal-history-page__modal meal-history-page__modal--delete">
            <h2>Delete Meal?</h2>
            <p>Are you sure you want to delete "{mealToDelete.meal_name || 'this meal'}"?</p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={handleDeleteCancel}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                onMouseEnter={(e) => {
                  e.target.style.background = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc3545';
                }}
                onMouseDown={(e) => {
                  e.target.style.background = '#a71d2a';
                }}
                onMouseUp={(e) => {
                  e.target.style.background = '#c82333';
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc3545',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealHistoryPage;