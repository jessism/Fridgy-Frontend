import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import useRecipes from '../hooks/useRecipes';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import './HomePage.css'; // Now in the same directory

const MealPlansPage = () => {
  const {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    fetchRecipeDetails,
    getHighMatchRecipes,
    markRecipeCooked,
    clearError
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


  // Get high-match recipes for "Cook what you have" section
  const cookWhatYouHaveRecipes = getHighMatchRecipes(30); // Lowered threshold
  
  // Get remaining recipes for "Inspired by your preference" section  
  const preferenceRecipes = suggestions.filter(recipe => recipe.matchPercentage < 30);

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
    <div key={recipe.id} className="meal-card">
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
        <button 
          className={`cook-btn ${isPreference ? 'outlined' : ''}`}
          onClick={() => handleCookNow(recipe)}
        >
          Cook Now
        </button>
        <div className="meal-stats">
          <div className="stat-item">
            <span className="stat-icon">🥘</span>
            <span className="stat-text">Ingredients match: {recipe.matchPercentage}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-text">
              {recipe.cookingTime ? `Cook time: ${recipe.cookingTime} minutes` : 'Cook time: varies'}
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
          backgroundColor: 'var(--primary-color)', 
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
  return (
    <div className="homepage">
      <AppNavBar />

      {/* Meal Plans Content */}
      <div style={{paddingTop: '100px', minHeight: '100vh', background: 'white'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
          <h1 style={{fontFamily: 'var(--header-font)', fontSize: '3rem', color: 'var(--header-color)', marginBottom: '2rem'}}>
            Meal Plans
          </h1>
          <p style={{fontFamily: 'var(--description-font)', fontSize: '1.2rem', color: 'var(--description-color)', marginBottom: '3rem'}}>
            Plan your meals and discover recipes based on your available ingredients
          </p>
          
          {/* Cook What You Have Section */}
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
          
          {/* Inspired by Your Preference Section */}
          {preferenceRecipes.length > 0 && (
            <div className="cook-what-you-have" style={{marginBottom: '4rem'}}>
              <div className="section-header-with-arrow">
                <h2 className="section-title">Inspired by your preference</h2>
                <button className="slider-arrow" onClick={() => fetchSuggestions({ limit: 20, ranking: 2 })}>
                  <span className="arrow-text">More recipes</span>
                  <span className="arrow-icon">→</span>
                </button>
              </div>
              <div className="meals-slider">
                {preferenceRecipes.slice(0, 4).map(recipe => 
                  renderRecipeCard(recipe, true)
                )}
              </div>
            </div>
          )}
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