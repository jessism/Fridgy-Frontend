import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { EditIcon, DeleteIcon } from '../components/icons';
import MealDetailModal from '../components/modals/MealDetailModal.jsx';
import { ChevronLeft } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import './MealHistoryPage.css';
import BreakfastIcon from '../assets/icons/Breakfast.png';
import LunchIcon from '../assets/icons/Lunch.png';
import DinnerIcon from '../assets/icons/Dinner.png';
import SnackIcon from '../assets/icons/Snack.png';

const MealHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPremium } = useSubscription();
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, -1 = previous week, 1 = next week
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false });
  const [dailyMeals, setDailyMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [weekMealCounts, setWeekMealCounts] = useState({}); // Track meal counts for each date in the week
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false); // Month calendar modal state
  const [calendarMonth, setCalendarMonth] = useState(new Date()); // Track which month is displayed in calendar
  
  // Edit/Delete modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mealToEdit, setMealToEdit] = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);

  // Load today's meals on initial mount
  useEffect(() => {
    fetchMealsForDate(selectedDate);
    fetchWeekMealCounts();
  }, []);

  // Fetch week meal counts when week changes
  useEffect(() => {
    fetchWeekMealCounts();
  }, [currentWeekOffset]);

  // Check if returning from meal scanner and refresh meals
  useEffect(() => {
    if (location.state?.returnDate) {
      const returnDate = new Date(location.state.returnDate);
      setSelectedDate(returnDate);
      // Add small delay to ensure meal is saved in database
      setTimeout(() => {
        fetchMealsForDate(returnDate);
        fetchWeekMealCounts(); // Refresh week counts
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

  // Fetch meal counts for all dates in the current week
  const fetchWeekMealCounts = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) return;

      const weekDates = getCurrentWeekDates();
      const counts = {};

      // Fetch meal counts for each date in parallel
      await Promise.all(
        weekDates.map(async ({ fullDate }) => {
          const formattedDate = `${fullDate.getFullYear()}-${String(fullDate.getMonth() + 1).padStart(2, '0')}-${String(fullDate.getDate()).padStart(2, '0')}`;
          const dateKey = formattedDate;

          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/meals/history?date=${formattedDate}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
              const data = await response.json();
              // Count unique meal types (breakfast, lunch, dinner, snack)
              const mealTypes = new Set();
              if (data.meals && Array.isArray(data.meals)) {
                data.meals.forEach(meal => {
                  if (meal.meal_type) {
                    mealTypes.add(meal.meal_type);
                  }
                });
              }
              counts[dateKey] = mealTypes.size;
            } else {
              counts[dateKey] = 0;
            }
          } catch (err) {
            counts[dateKey] = 0;
          }
        })
      );

      setWeekMealCounts(counts);
    } catch (error) {
      console.error('Failed to fetch week meal counts:', error);
    }
  };

  // Week navigation functions
  const navigateToWeek = (direction) => {
    const newOffset = currentWeekOffset + direction;

    // Free tier: limit to 1 week back (7 days)
    if (!isPremium && newOffset < -1) {
      setUpgradeModal({
        isOpen: true,
        feature: 'meal history beyond 7 days',
        current: null,
        limit: null
      });
      return;
    }

    setCurrentWeekOffset(newOffset);
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
  const handleDateClick = async (dateObj, event) => {
    // Prevent any default behavior or event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if date is more than 7 days ago for free users
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDay = new Date(dateObj);
    selectedDay.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - selectedDay) / (1000 * 60 * 60 * 24));

    if (!isPremium && daysDiff > 7) {
      // Free user trying to view more than 7 days back
      setUpgradeModal({
        isOpen: true,
        feature: 'meal history beyond 7 days',
        current: null,
        limit: null
      });
      return;
    }

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
        // For dine-out meals, check if we have calorie information stored
        if (meal.is_dine_out && ingredients.length === 1 && ingredients[0].name === 'Total Calories') {
          return `${ingredients[0].calories} calories`;
        }

        const total = ingredients.reduce((sum, item) => {
          return sum + (item.calories || 0);
        }, 0);
        return total > 0 ? `${total} calories` : null;
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

  // Handle date selection from month calendar
  const handleMonthCalendarDateSelect = (date) => {
    // Check if date is more than 7 days ago (use date-only comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0); // Reset to start of day

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const daysDiff = Math.floor((today - selectedDay) / (1000 * 60 * 60 * 24));

    console.log('[MealHistory] Date selection check:', {
      selectedDate: selectedDay.toLocaleDateString(),
      today: today.toLocaleDateString(),
      daysDiff,
      isPremium,
      shouldBlock: !isPremium && daysDiff > 7
    });

    if (!isPremium && daysDiff > 7) {
      // Free user trying to view more than 7 days back
      setUpgradeModal({
        isOpen: true,
        feature: 'meal history beyond 7 days',
        current: null,
        limit: null
      });
      setShowMonthCalendar(false); // Close calendar
      return;
    }

    // Update selected date
    setSelectedDate(date);

    // Calculate week offset to show the week containing the selected date
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week

    const selectedWeekStart = new Date(date);
    selectedWeekStart.setDate(date.getDate() - date.getDay()); // Start of selected date's week

    // Calculate difference in weeks
    const diffTime = selectedWeekStart.getTime() - todayWeekStart.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));

    setCurrentWeekOffset(diffWeeks);
    
    // Fetch meals for the selected date
    fetchMealsForDate(date);
    
    // Close the modal
    setShowMonthCalendar(false);
  };

  // Month Calendar Modal Component
  const MonthCalendarModal = () => {
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      
      // Pad with empty cells to always have 42 cells (6 rows * 7 columns)
      while (days.length < 42) {
        days.push(null);
      }
      
      return days;
    };
    
    const navigateMonth = (direction) => {
      const newMonth = new Date(calendarMonth);
      newMonth.setMonth(newMonth.getMonth() + direction);
      setCalendarMonth(newMonth);
    };
    
    const goToToday = () => {
      const today = new Date();
      setCalendarMonth(today);
      handleMonthCalendarDateSelect(today);
    };
    
    const formatMonthYear = () => {
      const monthName = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ][calendarMonth.getMonth()];
      return `${monthName} ${calendarMonth.getFullYear()}`;
    };
    
    const isToday = (date) => {
      if (!date) return false;
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };
    
    const isSelectedDate = (date) => {
      if (!date) return false;
      return date.getDate() === selectedDate.getDate() &&
             date.getMonth() === selectedDate.getMonth() &&
             date.getFullYear() === selectedDate.getFullYear();
    };
    
    const days = getDaysInMonth(calendarMonth);

    // Debug: Log the days being generated
    console.log('[MealHistory] Month calendar dates:', {
      totalDays: days.length,
      realDates: days.filter(d => d !== null).length,
      firstDate: days.find(d => d !== null)?.toDateString(),
      lastDate: days.filter(d => d !== null).pop()?.toDateString(),
      month: calendarMonth.toDateString()
    });

    return (
      <div className="meal-history-page__month-modal-overlay" onClick={() => setShowMonthCalendar(false)}>
        <div className="meal-history-page__month-modal" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="meal-history-page__month-modal-header">
            <button 
              className="meal-history-page__month-nav-btn"
              onClick={() => navigateMonth(-1)}
              aria-label="Previous month"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h2 className="meal-history-page__month-modal-title">{formatMonthYear()}</h2>
            
            <button 
              className="meal-history-page__month-nav-btn"
              onClick={() => navigateMonth(1)}
              aria-label="Next month"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Days of week header */}
          <div className="meal-history-page__month-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="meal-history-page__month-weekday">{day}</div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="meal-history-page__month-grid">
            {days.map((date, index) => {
              // Check if date is locked for free users
              let isLocked = false;
              if (date && !isPremium) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dateDay = new Date(date);
                dateDay.setHours(0, 0, 0, 0);
                const daysDiff = Math.floor((today - dateDay) / (1000 * 60 * 60 * 24));
                isLocked = daysDiff > 7;

                // Debug first few dates
                if (date.getDate() <= 3) {
                  console.log(`[MealHistory] Date ${date.getDate()}: daysDiff=${daysDiff}, isLocked=${isLocked}`);
                }
              }

              return (
                <div
                  key={`cell-${index}`}
                  className={`meal-history-page__month-day ${
                    !date ? 'meal-history-page__month-day--empty' : ''
                  } ${
                    isToday(date) ? 'meal-history-page__month-day--today' : ''
                  } ${
                    isSelectedDate(date) ? 'meal-history-page__month-day--selected' : ''
                  } ${
                    isLocked ? 'meal-history-page__month-day--locked' : ''
                  }`}
                  onClick={(e) => {
                    if (date) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMonthCalendarDateSelect(date);
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (date) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMonthCalendarDateSelect(date);
                    }
                  }}
                  style={{
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }}
                >
                  {date && (
                    <>
                      {date.getDate()}
                      {isLocked && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', bottom: '3px', right: '3px', opacity: 0.6 }}>
                          <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Today Button */}
          <div className="meal-history-page__month-modal-footer">
            <button
              className="meal-history-page__month-today-btn"
              onClick={goToToday}
            >
              Today
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get meal icon and calorie range based on type
  const getMealConfig = (mealType) => {
    const configs = {
      breakfast: {
        image: BreakfastIcon,
        calorieRange: 'Recommended 530-1170Cal'
      },
      lunch: {
        image: LunchIcon,
        calorieRange: 'Recommended 255-370Cal'
      },
      dinner: {
        image: DinnerIcon,
        calorieRange: 'Recommended 255-370Cal'
      },
      snack: {
        image: SnackIcon,
        calorieRange: 'Recommended 830-1170Cal'
      }
    };
    return configs[mealType] || configs.snack;
  };

  // Meal Category Section Component
  const MealCategorySection = ({ title, meals, mealType }) => {
    const hasMeals = meals && meals.length > 0;
    const config = getMealConfig(mealType);

    return (
      <div className="meal-history-page__meal-section">
        {/* Unified Card - contains header + logged items */}
        <div className="meal-history-page__meal-card">
          {/* Header - always visible */}
          <div className={`meal-history-page__meal-card-header ${hasMeals ? 'meal-history-page__meal-card-header--has-meals' : ''}`}>
            {!hasMeals && (
              <div className="meal-history-page__meal-card-icon">
                <img src={config.image} alt={title} />
              </div>
            )}
            <div className="meal-history-page__meal-card-info">
              <h3 className="meal-history-page__meal-card-title">{title}</h3>
            </div>
            <button
              className="meal-history-page__meal-card-add-btn"
              onClick={() => handleAddFood(mealType)}
            >
              + Add
            </button>
          </div>

          {/* Logged Items - only show if meals exist */}
          {hasMeals && (
            <div className="meal-history-page__meal-card-items">
              {meals.map((meal) => (
                <div key={meal.id} className="meal-history-page__meal-card-item">
                  {/* Photo or fallback icon */}
                  <div className="meal-history-page__meal-card-item-photo">
                    {meal.meal_photo_url ? (
                      <img
                        src={meal.meal_photo_url}
                        alt={getMealName(meal)}
                        onError={(e) => {
                          // Fallback to meal type icon if photo fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling?.setAttribute('style', 'display: block');
                        }}
                      />
                    ) : (
                      <img
                        src={config.image}
                        alt={title}
                      />
                    )}
                  </div>

                  {/* Meal info */}
                  <div className="meal-history-page__meal-card-item-info">
                    <h4 className="meal-history-page__meal-card-item-name" onClick={() => handleMealNameClick(meal)}>
                      {getMealName(meal)}
                    </h4>
                    {getTotalCalories(meal) && (
                      <p className="meal-history-page__meal-card-item-calories">
                        {getTotalCalories(meal)}
                      </p>
                    )}
                    {/* Edit and Delete icons below calories */}
                    <div className="meal-history-page__meal-card-item-actions">
                      <button
                        className="meal-history-page__meal-action-btn"
                        onClick={() => handleEditMeal(meal)}
                        aria-label="Edit meal"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="meal-history-page__meal-action-btn"
                        onClick={() => handleDeleteMeal(meal)}
                        aria-label="Delete meal"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>

                  {/* Right side - pill only */}
                  <div className="meal-history-page__meal-card-item-right">
                    <span className={`meal-history-page__meal-type-pill ${meal.is_dine_out ? 'meal-history-page__meal-type-pill--dine-out' : 'meal-history-page__meal-type-pill--eat-in'}`}>
                      {meal.is_dine_out ? 'Dine Out' : 'Eat In'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Calendar */}
          <div className="meal-history-page__calendar">
            {/* Month/Year Header with Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div className="meal-history-page__calendar-header" style={{ marginBottom: 0 }}>
                <button
                  className="meal-history-page__nav-arrow meal-history-page__nav-arrow--left"
                  onClick={goToPreviousWeek}
                  aria-label="Previous week"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div
                  className="meal-history-page__month-year"
                  onClick={() => {
                    setCalendarMonth(new Date(selectedDate));
                    setShowMonthCalendar(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
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

              {!isPremium && (
                <div style={{ textAlign: 'center', marginTop: '-4px', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#999',
                    opacity: 1
                  }}>
                    7 day look back window. Upgrade to Pro to view more.
                  </span>
                </div>
              )}
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
                {getCurrentWeekDates().map((dateInfo, index) => {
                  // Check if date is more than 7 days ago for free users
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dateDay = new Date(dateInfo.fullDate);
                  dateDay.setHours(0, 0, 0, 0);
                  const daysDiff = Math.floor((today - dateDay) / (1000 * 60 * 60 * 24));
                  const isLocked = !isPremium && daysDiff > 7;

                  // Get meal count for this date
                  const formattedDate = `${dateInfo.fullDate.getFullYear()}-${String(dateInfo.fullDate.getMonth() + 1).padStart(2, '0')}-${String(dateInfo.fullDate.getDate()).padStart(2, '0')}`;
                  const mealCount = weekMealCounts[formattedDate] || 0;
                  const progressClass = mealCount > 0 ? `meal-progress-${mealCount}` : '';

                  return (
                    <div
                      key={index}
                      className={`meal-history-page__date-cell ${
                        isToday(dateInfo.fullDate) ? 'meal-history-page__date-cell--today' : ''
                      } ${
                        isSelectedDate(dateInfo.fullDate) ? 'meal-history-page__date-cell--selected' : ''
                      }`}
                      onClick={(e) => handleDateClick(dateInfo.fullDate, e)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleDateClick(dateInfo.fullDate, e);
                      }}
                      style={{
                        cursor: 'pointer',
                        opacity: isLocked ? 0.4 : 1,
                        color: isLocked ? '#999' : 'inherit',
                        position: 'relative'
                      }}
                    >
                      <span className={`meal-history-page__date-number ${progressClass}`}>
                        {dateInfo.date}
                      </span>
                      {isLocked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          opacity: 0.6
                        }}>
                          <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                  );
                })}
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
      
      {/* Month Calendar Modal */}
      {showMonthCalendar && <MonthCalendarModal />}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false })}
        feature={upgradeModal.feature}
        current={upgradeModal.current}
        limit={upgradeModal.limit}
      />
    </div>
  );
};

export default MealHistoryPage;