import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import './MealHistoryPage.css';

const MealHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [dailyMeals, setDailyMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Meal Category Section Component
  const MealCategorySection = ({ title, meals, mealType }) => (
    <div className="meal-history-page__meal-section">
      <h3 className="meal-history-page__meal-title">{title}</h3>
      
      {meals && meals.length > 0 ? (
        meals.map((meal, index) => {
          // Parse ingredients_logged if it's a string
          let loggedIngredients = meal.ingredients_logged;
          if (typeof loggedIngredients === 'string') {
            try {
              loggedIngredients = JSON.parse(loggedIngredients);
            } catch (e) {
              loggedIngredients = [];
            }
          }

          // Handle array of ingredients
          if (Array.isArray(loggedIngredients)) {
            return (
              <div key={index} className="meal-history-page__meal-item">
                {loggedIngredients.map((item, idx) => (
                  <div key={idx}>
                    <div className="meal-history-page__meal-name">
                      {item.name || item.item_name || 'Food item'}
                    </div>
                    {item.quantity && (
                      <div className="meal-history-page__meal-ingredients">
                        Quantity: {item.quantity} {item.unit || ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          }

          // Handle object with name and ingredients
          return (
            <div key={index} className="meal-history-page__meal-item">
              <div className="meal-history-page__meal-name">
                {loggedIngredients?.name || 'Meal'}
              </div>
              {loggedIngredients?.ingredients && (
                <div className="meal-history-page__meal-ingredients">
                  {Array.isArray(loggedIngredients.ingredients) 
                    ? loggedIngredients.ingredients.join(', ')
                    : loggedIngredients.ingredients}
                </div>
              )}
            </div>
          );
        })
      ) : null}
      
      <button 
        className="meal-history-page__add-food-btn"
        onClick={() => handleAddFood(mealType)}
      >
        ADD FOOD
      </button>
    </div>
  );

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
            {/* Month/Year Header - Left aligned with dropdown */}
            <div className="meal-history-page__calendar-header">
              <div className="meal-history-page__month-year">
                <span className="meal-history-page__month-year-text">
                  {getCurrentMonthYear()}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Days of Week */}
            <div className="meal-history-page__days-header">
              {dayNames.map(day => (
                <div key={day} className="meal-history-page__day-name">
                  {day}
                </div>
              ))}
            </div>

            {/* Single Row of Dates */}
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
    </div>
  );
};

export default MealHistoryPage;