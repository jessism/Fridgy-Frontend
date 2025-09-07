import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import useRecipes from '../hooks/useRecipes';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import { AIRecipeSection } from '../features/ai-recipes';
import { IngredientMatchIcon, CookTimeIcon } from '../assets/icons';
import './MealPlansPage.css';

const MealPlansPage = () => {
  const navigate = useNavigate();
  const {
    suggestions,
    loading,
    error,
    isFromCache,
    fetchSuggestions,
    fetchRecipeDetails,
    getHighMatchRecipes,
    markRecipeCooked,
    clearError,
    refreshSuggestions
  } = useRecipes();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState(null);

  useEffect(() => {
    // Fetch recipe suggestions when component mounts
    fetchSuggestions({
      limit: 8, // Reduced total recipes
      ranking: 1 // Maximize used ingredients
    });
  }, [fetchSuggestions]);


  // Debug: Log the data to see what we're working with
  console.log('🔍 MealPlansPage Debug:', {
    suggestions: suggestions,
    suggestionsLength: suggestions?.length || 0,
    loading,
    error
  });

  // Get high-match recipes for "Cook what you have" section
  const cookWhatYouHaveRecipes = getHighMatchRecipes(30); // Lowered threshold
  
  // Get all recipes for "Inspired by your preference" section  
  const preferenceRecipes = suggestions; // Show all suggestions to ensure section appears

  const handleCookNow = async (recipe) => {
    try {
      console.log('🍳 Opening recipe details for:', recipe.title);
      setIsModalOpen(true);
      setIsLoadingRecipe(true);
      setRecipeError(null);
      
      // Fetch detailed recipe information
      const detailedRecipe = await fetchRecipeDetails(recipe.id);
      setSelectedRecipe(detailedRecipe);
      setIsLoadingRecipe(false);
    } catch (error) {
      console.error('Failed to fetch recipe details:', error);
      setRecipeError(error.message);
      setIsLoadingRecipe(false);
      // Keep modal open to show error
    }
  };

  const handleActuallyCook = async (recipe) => {
    try {
      await markRecipeCooked(recipe.id, recipe.extendedIngredients || []);
      console.log(`✅ Marked ${recipe.title} as cooked`);
      // TODO: Show success message and refresh suggestions
      fetchSuggestions(); // Refresh recipes after cooking
    } catch (error) {
      console.error('Failed to mark recipe as cooked:', error);
      // TODO: Show error message
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
    setIsLoadingRecipe(false);
    setRecipeError(null);
  };

  const renderRecipeCard = (recipe, isPreference = false) => (
    <div 
      key={recipe.id} 
      className="meal-card"
      onClick={() => handleCookNow(recipe)}
      style={{ cursor: 'pointer' }}
    >
      <div className="meal-image">
        <span className={`stock-badge ${recipe.inStock ? '' : 'out-of-stock'}`}>
          • {recipe.inStock ? 'In stock' : 'Missing items'}
        </span>
        <img 
          src={recipe.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={recipe.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
      </div>
      <div className="meal-info">
        <h3 className="meal-title">{recipe.title}</h3>
        <div className="meal-stats">
          <div className="stat-item">
            <span className="stat-icon">
              <IngredientMatchIcon size={20} color="#81e053" />
            </span>
            <span className="stat-text">Ingredients match: {recipe.matchPercentage}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">
              <CookTimeIcon size={20} color="#81e053" />
            </span>
            <span className="stat-text">
              {recipe.readyInMinutes ? `Cook time: ${recipe.readyInMinutes} minutes` : 'Cook time: varies'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingCards = (count = 4) => {
    return Array.from({ length: count }, (_, index) => (
      <div key={`loading-${index}`} className="meal-card loading">
        <div className="meal-image">
          <div className="loading-placeholder" style={{ height: '200px' }}></div>
        </div>
        <div className="meal-info">
          <div className="loading-placeholder" style={{ height: '24px', marginBottom: '12px' }}></div>
          <div className="loading-placeholder" style={{ height: '36px', marginBottom: '12px' }}></div>
          <div className="loading-placeholder" style={{ height: '20px' }}></div>
        </div>
      </div>
    ));
  };

  const renderErrorState = () => (
    <div className="error-state" style={{ textAlign: 'center', padding: '2rem' }}>
      <h3>Unable to load recipes</h3>
      <p>{error}</p>
      <button 
        onClick={() => {
          clearError();
          fetchSuggestions();
        }}
        style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: 'var(--primary-green)', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
  const handleLogMeal = () => {
    // Navigate to meal scanner
    navigate('/mealscanner');
  };

  const handleViewMealLogs = () => {
    // Navigate to meal history page
    navigate('/meal-history');
  };

  return (
    <div className="meal-plans-page">
      <AppNavBar />

      {/* Meal Plans Content */}
      <div className="meal-plans-page__main">
        <div className="meal-plans-page__container">
          {/* Hero Section */}
          <div className="meal-plans-page__hero">
            <h1 className="meal-plans-page__hero-title">Meals</h1>
          </div>

          {/* Scan Your Meal Section Header */}
          <div className="meal-plans-page__scan-header">
            <h2 className="meal-plans-page__scan-title">Scan your meal</h2>
            <button className="meal-plans-page__scan-button" onClick={handleLogMeal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          
          {/* Cook What You Have Section - TEMPORARILY HIDDEN */}
          {/* 
          <div className="cook-what-you-have" style={{marginBottom: '4rem'}}>
            <div className="section-header-with-arrow">
              <h2 className="section-title">Cook what you have</h2>
              <button className="slider-arrow" onClick={() => fetchSuggestions({ limit: 12 })}>
                <span className="arrow-text">More recipes</span>
                <span className="arrow-icon">→</span>
              </button>
            </div>
            <div className="meals-slider">
              {loading && renderLoadingCards(4)}
              {error && !loading && renderErrorState()}
              {!loading && !error && cookWhatYouHaveRecipes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No recipes found with your current ingredients.</p>
                  <p>Try adding more items to your inventory!</p>
                </div>
              )}
              {!loading && !error && cookWhatYouHaveRecipes.slice(0, 3).map(recipe => 
                renderRecipeCard(recipe, false)
              )}
            </div>
          </div>
          */}
          
          {/* Inspired by Your Preference Section */}
          <div className="meal-plans-page__section">
            <div className="meal-plans-page__section-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1.5rem'
            }}>
              <h2 className="meal-plans-page__section-title">
                Cook what you have
              </h2>
              {!loading && suggestions.length > 0 && (
                <button
                  onClick={() => refreshSuggestions()}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid var(--primary-green)',
                    borderRadius: '20px',
                    color: 'var(--primary-green)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--primary-green)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--primary-green)';
                  }}
                  title={isFromCache ? 'Recipes loaded from cache. Click to get fresh suggestions.' : 'Get new recipe suggestions'}
                >
                  {/* Refresh icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 2v6h-6M3 22v-6h6M21 8c-1.5-4.5-6-7-11-7-6 0-11 5-11 11M3 16c1.5 4.5 6 7 11 7 6 0 11-5 11-11" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Discover New
                </button>
              )}
            </div>
            <div className="meal-plans-page__recipes-grid">
              {loading && renderLoadingCards(4)}
              {error && !loading && renderErrorState()}
              {!loading && !error && preferenceRecipes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No recipe suggestions available right now.</p>
                  <p>Try adding more items to your inventory!</p>
                </div>
              )}
              {!loading && !error && preferenceRecipes.length > 0 && (
                <>
                  {preferenceRecipes.slice(0, 4).map(recipe => 
                    renderRecipeCard(recipe, true)
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* AI Recipe Section */}
          <AIRecipeSection />
          
          {/* View Meal Analytics Section */}
          <div className="meal-plans-page__analytics-section">
            {/* Text Section - Same structure as AI section */}
            <div className="meal-plans-page__analytics-text-section">
              <h2 className="meal-plans-page__section-title">View meal analytics</h2>
              <p className="meal-plans-page__section-subtitle">Track your eating patterns and meal preferences over time</p>
            </div>
            
            {/* View Meal History - Full Width */}
            <div className="meal-plans-page__view-history" onClick={handleViewMealLogs}>
              <div className="meal-plans-page__history-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="meal-plans-page__history-label">View meal history</span>
            </div>
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
      
      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        recipe={selectedRecipe}
        isLoading={isLoadingRecipe}
        onCookNow={handleActuallyCook}
      />
    </div>
  );
};

export default MealPlansPage; 