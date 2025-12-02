import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { ChevronLeft, X, Calendar, Check } from 'lucide-react';
import useMealPlan from '../hooks/useMealPlan';
import useCalendarSync from '../hooks/useCalendarSync';
import RecipePickerModal from '../components/modals/RecipePickerModal';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import TimePickerModal from '../components/modals/TimePickerModal';
import './MealPlanPage.css';

// Meal type icons
import BreakfastIcon from '../assets/icons/Breakfast.png';
import LunchIcon from '../assets/icons/Lunch.png';
import DinnerIcon from '../assets/icons/Dinner.png';
import SnackIcon from '../assets/icons/Snack.png';

const MealPlanPage = () => {
  const navigate = useNavigate();
  const {
    dailyMeals,
    weekCounts,
    loading,
    fetchDailyMeals,
    fetchWeekCounts,
    addRecipeToSlot,
    removeFromSlot,
    completeMeal,
    updateMealTime,
    formatDate
  } = useMealPlan();

  const {
    isConnected: calendarConnected,
    syncing: calendarSyncing,
    preferences: calendarPreferences,
    syncWeek,
    syncMeal,
    formatTimeDisplay,
    getDefaultTimeForMeal
  } = useCalendarSync();

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [pickerModal, setPickerModal] = useState({ isOpen: false, mealType: null });
  const [recipeDetailModal, setRecipeDetailModal] = useState({ isOpen: false, recipe: null });
  const [timePickerModal, setTimePickerModal] = useState({ isOpen: false, mealType: null, planId: null, currentTime: null });
  const [actionLoading, setActionLoading] = useState(null);
  const [syncMessage, setSyncMessage] = useState(null);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get meal config for icons
  const getMealConfig = (mealType) => {
    const configs = {
      breakfast: { icon: BreakfastIcon, label: 'Breakfast' },
      lunch: { icon: LunchIcon, label: 'Lunch' },
      dinner: { icon: DinnerIcon, label: 'Dinner' },
      snack: { icon: SnackIcon, label: 'Snack' }
    };
    return configs[mealType] || configs.snack;
  };

  // Get current week dates
  const getCurrentWeekDates = useCallback(() => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
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
  }, [currentWeekOffset]);

  // Load meals for selected date
  useEffect(() => {
    fetchDailyMeals(selectedDate);
  }, [selectedDate, fetchDailyMeals]);

  // Load week counts when week changes
  useEffect(() => {
    const weekDates = getCurrentWeekDates();
    const startDate = weekDates[0].fullDate;
    const endDate = weekDates[6].fullDate;
    fetchWeekCounts(startDate, endDate);
  }, [currentWeekOffset, fetchWeekCounts, getCurrentWeekDates]);

  // Handlers
  const handleBackClick = () => {
    navigate('/meals');
  };

  const getCurrentMonthYear = () => {
    return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  const isToday = (dateObj) => {
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (dateObj) => {
    return (
      dateObj.getDate() === selectedDate.getDate() &&
      dateObj.getMonth() === selectedDate.getMonth() &&
      dateObj.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (dateObj) => {
    setSelectedDate(new Date(dateObj));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  // Swipe handlers
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
    if (isLeftSwipe) goToNextWeek();
    if (isRightSwipe) goToPreviousWeek();
  };

  const formatSelectedDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return selectedDate.toLocaleDateString('en-US', options);
  };

  // Meal slot handlers
  const handleAddRecipe = (mealType) => {
    setPickerModal({ isOpen: true, mealType });
  };

  const handleRecipeSelected = async (recipe, recipeSource) => {
    const { mealType } = pickerModal;
    setPickerModal({ isOpen: false, mealType: null });

    try {
      setActionLoading(mealType);
      await addRecipeToSlot(selectedDate, mealType, recipe, recipeSource);
      // Refresh week counts
      const weekDates = getCurrentWeekDates();
      fetchWeekCounts(weekDates[0].fullDate, weekDates[6].fullDate);
    } catch (error) {
      console.error('Failed to add recipe:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveRecipe = async (mealType, planId) => {
    try {
      setActionLoading(mealType);
      await removeFromSlot(planId);
      // Refresh week counts
      const weekDates = getCurrentWeekDates();
      fetchWeekCounts(weekDates[0].fullDate, weekDates[6].fullDate);
    } catch (error) {
      console.error('Failed to remove recipe:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSwapRecipe = (mealType) => {
    setPickerModal({ isOpen: true, mealType });
  };

  const handleCompleteMeal = async (mealType, planId) => {
    try {
      setActionLoading(mealType);
      await completeMeal(planId);
    } catch (error) {
      console.error('Failed to complete meal:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewRecipe = (plan) => {
    // Build recipe object from plan data
    const recipe = plan.recipe || {
      id: plan.recipe_id,
      title: plan.recipe_snapshot?.title || 'Planned Meal',
      image: plan.recipe_snapshot?.image,
      readyInMinutes: plan.recipe_snapshot?.readyInMinutes
    };
    setRecipeDetailModal({ isOpen: true, recipe });
  };

  const handleSyncWeek = async () => {
    const weekDates = getCurrentWeekDates();
    const startDate = formatDate(weekDates[0].fullDate);
    const endDate = formatDate(weekDates[6].fullDate);

    const result = await syncWeek(startDate, endDate);
    if (result.success) {
      const syncedCount = (result.results?.synced || 0) + (result.results?.updated || 0);
      setSyncMessage(`Synced ${syncedCount} meals to calendar`);
      setTimeout(() => setSyncMessage(null), 3000);
    } else {
      setSyncMessage('Failed to sync meals');
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const handleOpenTimePicker = (mealType, plan, currentTime) => {
    setTimePickerModal({
      isOpen: true,
      mealType,
      planId: plan.id,
      currentTime
    });
  };

  const handleTimeChange = async (newTime) => {
    const { planId, mealType } = timePickerModal;
    setTimePickerModal({ isOpen: false, mealType: null, planId: null, currentTime: null });

    try {
      setActionLoading(mealType);
      await updateMealTime(planId, newTime);

      // If synced to calendar, re-sync to update the event time
      const plan = dailyMeals[mealType];
      if (plan?.calendar_event_id && calendarConnected) {
        await syncMeal(planId);
      }
    } catch (error) {
      console.error('Failed to update time:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Meal Slot Card Component
  const MealSlotCard = ({ mealType, plan }) => {
    const config = getMealConfig(mealType);
    const hasRecipe = plan && (plan.recipe || plan.recipe_snapshot);
    const isCompleted = plan?.is_completed;
    const isLoadingThis = actionLoading === mealType;
    const isSynced = plan?.calendar_event_id;

    // Get recipe info from either linked recipe or snapshot
    const recipeTitle = plan?.recipe?.title || plan?.recipe_snapshot?.title;
    const recipeImage = plan?.recipe?.image || plan?.recipe_snapshot?.image;
    const recipeTime = plan?.recipe?.readyInMinutes || plan?.recipe_snapshot?.readyInMinutes;

    // Get meal time for display
    const mealTime = plan?.scheduled_time || getDefaultTimeForMeal(mealType);

    return (
      <div className={`meal-plan-page__slot-card ${isCompleted ? 'meal-plan-page__slot-card--completed' : ''}`}>
        <div className="meal-plan-page__slot-header">
          {!hasRecipe && (
            <div className="meal-plan-page__slot-icon">
              <img src={config.icon} alt={config.label} />
            </div>
          )}
          <span className="meal-plan-page__slot-label">{config.label}</span>
          {calendarConnected && hasRecipe && (
            <span
              className="meal-plan-page__time-badge meal-plan-page__time-badge--clickable"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTimePicker(mealType, plan, mealTime);
              }}
            >
              {formatTimeDisplay(mealTime)}
              {isSynced && <Check size={12} className="meal-plan-page__sync-check" />}
            </span>
          )}
          {!hasRecipe && (
            <button
              className="meal-plan-page__add-btn"
              onClick={() => handleAddRecipe(mealType)}
              disabled={isLoadingThis}
            >
              {isLoadingThis ? '...' : '+ Add'}
            </button>
          )}
        </div>

        {hasRecipe ? (
          <div
            className="meal-plan-page__recipe-card"
            onClick={() => handleViewRecipe(plan)}
          >
            <div className="meal-plan-page__recipe-thumbnail">
              {recipeImage ? (
                <img src={recipeImage} alt={recipeTitle} />
              ) : (
                <img src={config.icon} alt={config.label} />
              )}
            </div>
            <div className="meal-plan-page__recipe-info">
              <h4 className="meal-plan-page__recipe-title">{recipeTitle}</h4>
              {recipeTime && (
                <span className="meal-plan-page__recipe-time">{recipeTime} min</span>
              )}
            </div>
            <button
              className="meal-plan-page__remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveRecipe(mealType, plan.id);
              }}
              disabled={isLoadingThis}
              title="Remove"
            >
              <X size={14} />
            </button>
            {isCompleted && (
              <span className="meal-plan-page__completed-badge">Cooked</span>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="meal-plan-page">
      <AppNavBar />

      <div className="meal-plan-page__main">
        <div className="meal-plan-page__container">
          {/* Header with back button */}
          <div className="meal-plan-page__header">
            <button
              className="meal-plan-page__back-button"
              onClick={handleBackClick}
              aria-label="Go back to meals"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="meal-plan-page__title">Meal Plan</h1>
            {calendarConnected && (
              <button
                className="meal-plan-page__sync-btn"
                onClick={handleSyncWeek}
                disabled={calendarSyncing}
                aria-label="Sync to calendar"
              >
                <Calendar size={18} />
                {calendarSyncing ? 'Syncing...' : 'Sync'}
              </button>
            )}
          </div>

          {/* Sync message */}
          {syncMessage && (
            <div className="meal-plan-page__sync-message">
              {syncMessage}
            </div>
          )}

          {/* Calendar */}
          <div className="meal-plan-page__calendar">
            {/* Month/Year Header with Navigation */}
            <div className="meal-plan-page__calendar-header">
              <button
                className="meal-plan-page__nav-arrow"
                onClick={goToPreviousWeek}
                aria-label="Previous week"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="meal-plan-page__month-year">
                <span className="meal-plan-page__month-year-text">
                  {getCurrentMonthYear()}
                </span>
              </div>

              <button
                className="meal-plan-page__nav-arrow"
                onClick={goToNextWeek}
                aria-label="Next week"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Days of Week */}
            <div className="meal-plan-page__days-header">
              {dayNames.map(day => (
                <div key={day} className="meal-plan-page__day-name">
                  {day}
                </div>
              ))}
            </div>

            {/* Swipeable Row of Dates */}
            <div
              className="meal-plan-page__dates-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="meal-plan-page__dates-row">
                {getCurrentWeekDates().map((dateInfo, index) => {
                  const dateKey = formatDate(dateInfo.fullDate);
                  const mealCount = weekCounts[dateKey] || 0;
                  const progressClass = mealCount > 0 ? `meal-progress-${Math.min(mealCount, 4)}` : '';

                  return (
                    <div
                      key={index}
                      className={`meal-plan-page__date-cell ${
                        isToday(dateInfo.fullDate) ? 'meal-plan-page__date-cell--today' : ''
                      } ${
                        isSelectedDate(dateInfo.fullDate) ? 'meal-plan-page__date-cell--selected' : ''
                      }`}
                      onClick={() => handleDateClick(dateInfo.fullDate)}
                    >
                      <span className={`meal-plan-page__date-number ${progressClass}`}>
                        {dateInfo.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Header */}
          <div className="meal-plan-page__selected-date-header">
            <h2 className="meal-plan-page__selected-date-text">
              {formatSelectedDate()}
            </h2>
          </div>

          {/* Meal Slots */}
          <div className="meal-plan-page__slots-container">
            {loading ? (
              <div className="meal-plan-page__loading">Loading...</div>
            ) : (
              <>
                <MealSlotCard mealType="breakfast" plan={dailyMeals.breakfast} />
                <MealSlotCard mealType="lunch" plan={dailyMeals.lunch} />
                <MealSlotCard mealType="dinner" plan={dailyMeals.dinner} />
                <MealSlotCard mealType="snack" plan={dailyMeals.snack} />
              </>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />

      {/* Recipe Picker Modal */}
      <RecipePickerModal
        isOpen={pickerModal.isOpen}
        onClose={() => setPickerModal({ isOpen: false, mealType: null })}
        onSelect={handleRecipeSelected}
        mealType={pickerModal.mealType}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={recipeDetailModal.isOpen}
        onClose={() => setRecipeDetailModal({ isOpen: false, recipe: null })}
        recipe={recipeDetailModal.recipe}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={timePickerModal.isOpen}
        onClose={() => setTimePickerModal({ isOpen: false, mealType: null, planId: null, currentTime: null })}
        onSave={handleTimeChange}
        initialTime={timePickerModal.currentTime}
        mealType={timePickerModal.mealType}
      />
    </div>
  );
};

export default MealPlanPage;
