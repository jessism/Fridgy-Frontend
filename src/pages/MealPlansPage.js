import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import useRecipes from '../hooks/useRecipes';
// import useEdamamTest from '../hooks/useEdamamTest';
// import useTastyRecipes from '../hooks/useTastyRecipes';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import MealDetailModal from '../components/modals/MealDetailModal.jsx';
import RecipeCreationModal from '../components/modals/RecipeCreationModal';
import { AIRecipeSection } from '../features/ai-recipes';
import { IngredientMatchIcon, CookTimeIcon } from '../assets/icons';
import './MealPlansPage.css';

const MealPlansPage = ({ defaultTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Tab state management
  const [activeTab, setActiveTab] = useState(defaultTab || 'meals');

  // Saved recipes state
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [savedRecipesLoading, setSavedRecipesLoading] = useState(true);
  const [savedRecipesError, setSavedRecipesError] = useState(null);

  // User uploaded recipes state (physical scans, manual entry, voice)
  const [userUploadedRecipes, setUserUploadedRecipes] = useState([]);
  const [userUploadedRecipesLoading, setUserUploadedRecipesLoading] = useState(true);

  // Recent meals state
  const [recentMeals, setRecentMeals] = useState([]);
  const [recentMealsLoading, setRecentMealsLoading] = useState(true);
  const [recentMealsError, setRecentMealsError] = useState(null);

  // Image preloading state for saved recipes
  const [imageStates, setImageStates] = useState({});
  
  // Edamam test hook - COMMENTED OUT
  // const {
  //   suggestions: edamamSuggestions,
  //   loading: edamamLoading,
  //   error: edamamError,
  //   clearError: clearEdamamError,
  //   refreshSuggestions: refreshEdamamSuggestions
  // } = useEdamamTest();

  // Debug Edamam state - COMMENTED OUT
  // console.log('🧪 Edamam state:', { 
  //   suggestions: edamamSuggestions?.length, 
  //   loading: edamamLoading, 
  //   error: edamamError 
  // });
  
  // Tasty test hook - REMOVED
  // Previously used useTastyRecipes hook - removed

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState(null);

  // Meal detail modal state - using original .jsx modal
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Recipe creation modal state
  const [showRecipeCreationModal, setShowRecipeCreationModal] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch user uploaded recipes (physical scans, manual entry, voice)
  const fetchUserUploadedRecipes = async () => {
    try {
      setUserUploadedRecipesLoading(true);

      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        setUserUploadedRecipes([]);
        setUserUploadedRecipesLoading(false);
        return;
      }

      // Fetch uploaded recipes with filter
      const params = new URLSearchParams({
        filter: 'uploaded',
        limit: 2
      });

      const response = await fetch(`${API_BASE_URL}/saved-recipes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUserUploadedRecipes([]);
          setUserUploadedRecipesLoading(false);
          return;
        }
        throw new Error('Failed to fetch uploaded recipes');
      }

      const data = await response.json();

      // API now returns only uploaded recipes with filter=uploaded
      console.log('[MealPlans] Uploaded recipes from API:', {
        count: data.recipes?.length,
        samples: (data.recipes || []).map(r => ({
          title: r.title,
          source_type: r.source_type,
          import_method: r.import_method,
          source_author: r.source_author
        }))
      });

      setUserUploadedRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching uploaded recipes:', error);
      setUserUploadedRecipes([]);
    } finally {
      setUserUploadedRecipesLoading(false);
    }
  };

  // Fetch saved recipes function
  const fetchSavedRecipes = async () => {
    try {
      setSavedRecipesLoading(true);
      setSavedRecipesError(null);

      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        setSavedRecipes([]);
        setSavedRecipesLoading(false);
        return;
      }

      const params = new URLSearchParams({
        filter: 'imported',
        limit: 2
      });

      const response = await fetch(`${API_BASE_URL}/saved-recipes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setSavedRecipes([]);
          setSavedRecipesLoading(false);
          return;
        }
        throw new Error('Failed to fetch saved recipes');
      }

      const data = await response.json();

      // API now returns only imported recipes with filter=imported
      console.log('[MealPlans] Imported recipes from API:', {
        count: data.recipes?.length,
        samples: (data.recipes || []).map(r => ({
          title: r.title,
          source_type: r.source_type,
          source_author: r.source_author
        }))
      });

      setSavedRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      setSavedRecipesError(error.message);
      setSavedRecipes([]);
    } finally {
      setSavedRecipesLoading(false);
    }
  };

  // Fetch recent meals function
  const fetchRecentMeals = async () => {
    try {
      console.log('🍽️ [MealPlans] Fetching recent meals...');
      setRecentMealsLoading(true);
      setRecentMealsError(null);

      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        console.log('🍽️ [MealPlans] No token found');
        setRecentMeals([]);
        setRecentMealsLoading(false);
        return;
      }

      console.log('🍽️ [MealPlans] Calling API:', `${API_BASE_URL}/meals/history`);
      const response = await fetch(`${API_BASE_URL}/meals/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🍽️ [MealPlans] Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🍽️ [MealPlans] Unauthorized - clearing meals');
          setRecentMeals([]);
          setRecentMealsLoading(false);
          return;
        }
        throw new Error(`Failed to fetch recent meals: ${response.status}`);
      }

      const data = await response.json();
      console.log('🍽️ [MealPlans] API response:', data);
      console.log('🍽️ [MealPlans] Meals found:', data.meals?.length || 0);

      // Get the 2 most recent meals
      const recentMealsData = (data.meals || []).slice(0, 2);
      console.log('🍽️ [MealPlans] Setting recent meals:', recentMealsData);
      setRecentMeals(recentMealsData);
    } catch (error) {
      console.error('🍽️ [MealPlans] Error fetching recent meals:', error);
      setRecentMealsError(error.message);
      setRecentMeals([]);
    } finally {
      setRecentMealsLoading(false);
    }
  };

  // Handle tab switching based on props and URL changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname === '/meal-plans/recipes') {
      setActiveTab('recipes');
    } else if (location.pathname === '/meal-plans') {
      setActiveTab('meals');
    }
  }, [location, defaultTab]);

  useEffect(() => {
    // Fetch recipe suggestions when component mounts
    fetchSuggestions({
      limit: 8, // Reduced total recipes
      ranking: 1 // Maximize used ingredients
    });

    // Fetch saved recipes
    fetchSavedRecipes();

    // Fetch user uploaded recipes
    fetchUserUploadedRecipes();

    // Fetch recent meals
    fetchRecentMeals();
  }, [fetchSuggestions]);

  // Preload saved recipe images to prevent glitching
  useEffect(() => {
    if (!savedRecipes || savedRecipes.length === 0) return;

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    // Helper function to check if URL needs proxying
    const needsProxy = (url) => {
      return url &&
             (url.includes('cdninstagram.com') ||
              url.includes('instagram.com') ||
              url.includes('fbcdn.net') ||
              url.includes('instagram.')) &&
             !url.includes('URL_OF_IMAGE') &&
             !url.includes('example.com') &&
             url !== 'URL of image';
    };

    // Function to get the correct image URL (same logic as in renderSavedRecipeCard)
    const getImageUrl = (recipe) => {
      const baseImageUrl = recipe.image || recipe.image_urls?.[0];

      if (!baseImageUrl) {
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
      } else if (needsProxy(baseImageUrl)) {
        return `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(baseImageUrl)}`;
      } else {
        return baseImageUrl;
      }
    };

    // Preload each recipe's image
    savedRecipes.forEach(recipe => {
      const img = new Image();
      const imageUrl = getImageUrl(recipe);

      img.onload = () => {
        setImageStates(prev => ({ ...prev, [recipe.id]: 'loaded' }));
      };

      img.onerror = () => {
        setImageStates(prev => ({ ...prev, [recipe.id]: 'error' }));
      };

      // Start loading the image
      img.src = imageUrl;
    });
  }, [savedRecipes]);


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
      
      // Check if this is an Edamam recipe - COMMENTED OUT
      // if (recipe._source === 'edamam') {
      //   // Edamam recipes already have all details from the initial fetch
      //   console.log('📖 Using pre-fetched Edamam recipe data');
      //   setSelectedRecipe(recipe);
      //   setIsLoadingRecipe(false);
      // } else {
        // Spoonacular recipes need a detail fetch
        const detailedRecipe = await fetchRecipeDetails(recipe.id);
        setSelectedRecipe(detailedRecipe);
        setIsLoadingRecipe(false);
      // }
    } catch (error) {
      console.error('Failed to fetch recipe details:', error);
      setRecipeError(error.message);
      setIsLoadingRecipe(false);
      // Keep modal open to show error
    }
  };

  const handleActuallyCook = async (recipe) => {
    // This is called after recipe is successfully cooked
    // Edamam handling COMMENTED OUT
    // if (recipe._source === 'edamam') {
    //   console.log(`🧪 Edamam recipe ${recipe.title} was viewed (inventory deduction not implemented yet)`);
    //   // For now, just close the modal for Edamam recipes
    //   // TODO: Implement inventory deduction for Edamam recipes
    //   alert('This is an Edamam test recipe. Inventory deduction is not yet implemented for Edamam recipes.');
    //   handleCloseModal();
    // } else {
      console.log(`✅ Recipe ${recipe.title} was cooked and inventory was deducted`);
      // Refresh suggestions since inventory has changed
      fetchSuggestions({ forceRefresh: true });
    // }
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

  const handleViewRecipeDetails = (recipe) => {
    // Pass the recipe directly - it should already have the correct structure from the backend
    // The backend returns recipes with extendedIngredients, analyzedInstructions, nutrition, etc.
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  // Render saved recipe card
  const renderSavedRecipeCard = (recipe, showDetails = false) => {
    // Helper function to check if URL needs proxying
    const needsProxy = (url) => {
      return url &&
             (url.includes('cdninstagram.com') ||
              url.includes('instagram.com') ||
              url.includes('fbcdn.net') ||
              url.includes('instagram.')) &&
             !url.includes('URL_OF_IMAGE') &&
             !url.includes('example.com') &&
             url !== 'URL of image';
    };

    // Get the base image URL
    const baseImageUrl = recipe.image || recipe.image_urls?.[0];

    // Determine the final image URL to use (no trial-and-error)
    let imageUrl;
    if (!baseImageUrl) {
      // No image: Use fallback immediately
      imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
    } else if (needsProxy(baseImageUrl)) {
      // Instagram images: Always use proxy (never try direct)
      imageUrl = `${API_BASE_URL}/proxy-image?url=${encodeURIComponent(baseImageUrl)}`;
    } else {
      // Other images: Use direct URL
      imageUrl = baseImageUrl;
    }

    const handleClick = () => {
      if (showDetails) {
        // Show recipe details in modal
        handleViewRecipeDetails(recipe);
      } else {
        // Navigate to saved recipes page
        navigate('/saved-recipes');
      }
    };

    return (
      <div
        key={recipe.id}
        className="meal-plans-page__saved-recipe-card"
        onClick={handleClick}
      >
        <div className="meal-plans-page__saved-recipe-image">
          {/* Show placeholder while image is loading */}
          {imageStates[recipe.id] !== 'loaded' && (
            <div className="meal-plans-page__image-placeholder" />
          )}
          <img
            src={imageUrl}
            alt={recipe.title}
            className={`meal-plans-page__recipe-img ${imageStates[recipe.id] === 'loaded' ? 'meal-plans-page__recipe-img--loaded' : ''}`}
            onError={(e) => {
              // Only fallback once to prevent multiple flashes
              if (!e.target.dataset.failed) {
                e.target.dataset.failed = 'true';
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                console.log('[RecipeCard] Image failed to load for recipe:', recipe.title);
                // Mark as loaded even on error to show the fallback image
                setImageStates(prev => ({ ...prev, [recipe.id]: 'loaded' }));
              }
            }}
            onLoad={() => {
              // Mark as loaded when image successfully loads
              setImageStates(prev => ({ ...prev, [recipe.id]: 'loaded' }));
            }}
          />
          {recipe.source_type === 'instagram' && (
            <div className="meal-plans-page__saved-recipe-badge">
              <span>Instagram</span>
            </div>
          )}
        </div>
        <div className="meal-plans-page__saved-recipe-content">
          <h3 className="meal-plans-page__saved-recipe-title">{recipe.title}</h3>
          {recipe.source_author && (
            <p className="meal-plans-page__saved-recipe-author">@{recipe.source_author}</p>
          )}
          <div className="meal-plans-page__saved-recipe-meta">
            {recipe.readyInMinutes && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 6V12L15 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {recipe.readyInMinutes} min
              </span>
            )}
            {recipe.servings && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="5" y="6" width="14" height="13" rx="2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 12h4" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {recipe.servings} servings
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render empty state for saved recipes
  const renderSavedRecipesEmptyState = () => (
    <div
      className="meal-plans-page__saved-recipes-empty"
      onClick={() => navigate('/saved-recipes')}
    >
      <div className="meal-plans-page__saved-recipes-empty-container">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="none" stroke="var(--primary-green)" strokeWidth="2"/>
          <path d="M16 10V22M10 16H22" stroke="var(--primary-green)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="meal-plans-page__saved-recipes-empty-text">Start saving your recipe</p>
    </div>
  );

  // Helper function to format meal date
  const formatMealDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 14) {
      return '1 week ago';
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      // For meals older than a year, show the actual date
      return date.toLocaleDateString();
    }
  };

  // Handle meal card click to show detail modal
  const handleMealCardClick = (meal) => {
    setSelectedMeal(meal);
  };

  const handleCloseMealDetailModal = () => {
    setSelectedMeal(null);
  };

  // Render meal card
  const renderMealCard = (meal) => {
    console.log('🍽️ [MealCard] Meal data:', meal);
    console.log('🍽️ [MealCard] Photo URL:', meal.meal_photo_url);

    const imageUrl = meal.meal_photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

    return (
      <div
        key={meal.id}
        className="meal-plans-page__saved-recipe-card"
        onClick={() => handleMealCardClick(meal)}
      >
        <div className="meal-plans-page__saved-recipe-image">
          <img
            src={imageUrl}
            alt={meal.meal_name || 'Logged meal'}
            onError={(e) => {
              if (e.target.src !== 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c') {
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
              }
            }}
          />
          {meal.meal_type && (
            <div className="meal-plans-page__saved-recipe-badge">
              <span>{meal.meal_type}</span>
            </div>
          )}
        </div>
        <div className="meal-plans-page__saved-recipe-content">
          <h3 className="meal-plans-page__saved-recipe-title">
            {meal.meal_name || 'Home-cooked meal'}
          </h3>
          <p className="meal-plans-page__saved-recipe-author">
            {formatMealDate(meal.logged_at)}
          </p>
          <div className="meal-plans-page__saved-recipe-meta">
            {meal.ingredients_logged && (
              <span>{meal.ingredients_logged.length} ingredients</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render empty state for recent meals
  const renderRecentMealsEmptyState = () => (
    <div
      className="meal-plans-page__saved-recipes-empty"
      onClick={() => navigate('/mealscanner')}
    >
      <div className="meal-plans-page__saved-recipes-empty-container">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="none" stroke="var(--primary-green)" strokeWidth="2"/>
          <path d="M16 10V22M10 16H22" stroke="var(--primary-green)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="meal-plans-page__saved-recipes-empty-text">Start logging your meals</p>
    </div>
  );

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

          {/* Tab Navigation */}
          <div className="meal-plans-page__tabs">
            <button
              className={`meal-plans-page__tab ${activeTab === 'recipes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('recipes');
                navigate('/meal-plans/recipes');
              }}
            >
              Recipes
            </button>
            <button
              className={`meal-plans-page__tab ${activeTab === 'meals' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('meals');
                navigate('/meal-plans');
              }}
            >
              Meal log
            </button>
          </div>

          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'meals' ? (
            <>
              {/* Scan Your Meal Section Header */}
              <div className="meal-plans-page__scan-header">
                <h2 className="meal-plans-page__scan-title">Scan your meal</h2>
                <button className="meal-plans-page__scan-button" onClick={handleLogMeal}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="var(--primary-green)"/>
                    <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* View Meal History Section */}
              <div className="meal-plans-page__analytics-section">
                {/* Text Section */}
                <div className="meal-plans-page__analytics-text-section">
                  <div className="meal-plans-page__section-header-with-action">
                    <div>
                      <h2 className="meal-plans-page__section-title">View meal history</h2>
                      <p className="meal-plans-page__section-subtitle">Track your eating patterns and meal preferences over time</p>
                    </div>
                    <button
                      className="meal-plans-page__view-more-btn"
                      onClick={() => navigate('/meal-history')}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Meal Cards or Empty State */}
                {recentMealsLoading ? (
                  <div className="meal-plans-page__saved-recipes-loading">
                    <div className="meal-plans-page__saved-recipes-grid">
                      <div className="meal-plans-page__saved-recipe-card loading">
                        <div className="meal-plans-page__saved-recipe-image">
                          <div className="loading-placeholder" style={{ height: '120px' }}></div>
                        </div>
                        <div className="meal-plans-page__saved-recipe-content">
                          <div className="loading-placeholder" style={{ height: '16px', marginBottom: '8px' }}></div>
                          <div className="loading-placeholder" style={{ height: '12px' }}></div>
                        </div>
                      </div>
                      <div className="meal-plans-page__saved-recipe-card loading">
                        <div className="meal-plans-page__saved-recipe-image">
                          <div className="loading-placeholder" style={{ height: '120px' }}></div>
                        </div>
                        <div className="meal-plans-page__saved-recipe-content">
                          <div className="loading-placeholder" style={{ height: '16px', marginBottom: '8px' }}></div>
                          <div className="loading-placeholder" style={{ height: '12px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : recentMeals.length > 0 ? (
                  <div className="meal-plans-page__saved-recipes-grid">
                    {recentMeals.slice(0, 2).map(meal => renderMealCard(meal))}
                  </div>
                ) : (
                  renderRecentMealsEmptyState()
                )}
              </div>
            </>
          ) : (
            <>
              {/* Recipes Tab Content */}

              {/* Your Saved Recipes Section */}
              <div className="meal-plans-page__analytics-section">
                {/* Text Section */}
                <div className="meal-plans-page__analytics-text-section">
                  <div className="meal-plans-page__section-header-with-action">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <h2 className="meal-plans-page__section-title" style={{ margin: 0 }}>Imported recipes</h2>
                      <button
                        className="meal-plans-page__import-add-button"
                        onClick={() => navigate('/import')}
                        title="Import recipe"
                        style={{ position: 'relative', top: 'auto', right: 'auto' }}
                      >
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <circle cx="16" cy="16" r="14" fill="var(--primary-green)"/>
                          <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      {savedRecipes.length > 0 && (
                        <button
                          className="meal-plans-page__view-more-arrow-btn"
                          onClick={() => navigate('/saved-recipes')}
                          title="View all saved recipes"
                          style={{ marginLeft: 'auto' }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="meal-plans-page__section-subtitle">Access your favorite recipes anytime</p>
                </div>

                {/* Recipe Cards or Empty State */}
                {savedRecipesLoading ? (
                  <div className="meal-plans-page__saved-recipes-loading">
                    <div className="meal-plans-page__saved-recipes-grid">
                      <div className="meal-plans-page__saved-recipe-card loading">
                        <div className="meal-plans-page__saved-recipe-image">
                          <div className="loading-placeholder" style={{ height: '120px' }}></div>
                        </div>
                        <div className="meal-plans-page__saved-recipe-content">
                          <div className="loading-placeholder" style={{ height: '16px', marginBottom: '8px' }}></div>
                          <div className="loading-placeholder" style={{ height: '12px' }}></div>
                        </div>
                      </div>
                      <div className="meal-plans-page__saved-recipe-card loading">
                        <div className="meal-plans-page__saved-recipe-image">
                          <div className="loading-placeholder" style={{ height: '120px' }}></div>
                        </div>
                        <div className="meal-plans-page__saved-recipe-content">
                          <div className="loading-placeholder" style={{ height: '16px', marginBottom: '8px' }}></div>
                          <div className="loading-placeholder" style={{ height: '12px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : savedRecipes.length > 0 ? (
                  <div className="meal-plans-page__saved-recipes-grid">
                    {savedRecipes.slice(0, 2).map(recipe => renderSavedRecipeCard(recipe, true))}
                  </div>
                ) : (
                  renderSavedRecipesEmptyState()
                )}
              </div>

              {/* My Uploaded Recipes Section */}
              <div className="meal-plans-page__uploaded-section">
                <div className="meal-plans-page__section-header-with-action">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <h2 className="meal-plans-page__section-title" style={{ margin: 0 }}>Uploaded recipes</h2>
                    <button
                      className="meal-plans-page__add-button"
                      onClick={() => setShowRecipeCreationModal(true)}
                      style={{ position: 'relative', top: 'auto', right: 'auto' }}
                    >
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="var(--primary-green)"/>
                        <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    {userUploadedRecipes.length > 0 && (
                      <button
                        className="meal-plans-page__view-more-arrow-btn"
                        onClick={() => navigate('/uploaded-recipes')}
                        title="View all uploaded recipes"
                        style={{ marginLeft: 'auto' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {userUploadedRecipesLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    Loading...
                  </div>
                ) : userUploadedRecipes.length > 0 ? (
                  <div className="meal-plans-page__saved-recipes-grid">
                    {userUploadedRecipes.slice(0, 2).map(recipe => renderSavedRecipeCard(recipe, true))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', fontSize: '1rem', color: '#666' }}>Upload your first recipe</p>
                  </div>
                )}
              </div>

              {/* AI Recipe Section - Get perfect match with AI */}
              <AIRecipeSection />
            </>
          )}

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
          
          {/* Cook what you have Section - COMMENTED OUT */}
          {/*
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
                  {/*
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
          */}
          
          {/* Edamam test Section - COMMENTED OUT */}
          {/* <div className="meal-plans-page__section">
            <div className="meal-plans-page__section-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1.5rem'
            }}>
              <h2 className="meal-plans-page__section-title">
                Edamam test
              </h2>
              {!edamamLoading && edamamSuggestions.length > 0 && (
                <button
                  onClick={() => refreshEdamamSuggestions()}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid var(--primary-green)',
                    borderRadius: '20px',
                    color: 'var(--primary-green)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-green)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--primary-green)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Refresh
                </button>
              )}
            </div>
            <div className="meal-plans-page__recipes-grid">
              {edamamLoading && renderLoadingCards(4)}
              {edamamError && !edamamLoading && (
                <div className="error-state" style={{ textAlign: 'center', padding: '2rem' }}>
                  <h3>Unable to load Edamam recipes</h3>
                  <p>{edamamError}</p>
                  <button 
                    onClick={() => {
                      clearEdamamError();
                      refreshEdamamSuggestions();
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
              )}
              {!edamamLoading && !edamamError && edamamSuggestions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No Edamam recipe suggestions available.</p>
                  <p>Try adding more items to your inventory!</p>
                </div>
              )}
              {!edamamLoading && !edamamError && edamamSuggestions.length > 0 && (
                <>
                  {edamamSuggestions.slice(0, 4).map(recipe => 
                    renderRecipeCard(recipe, true)
                  )}
                </>
              )}
            </div>
          </div> */}

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

      {/* Meal Detail Modal */}
      <MealDetailModal
        isOpen={!!selectedMeal}
        onClose={handleCloseMealDetailModal}
        meal={selectedMeal}
      />

      {/* Recipe Creation Modal */}
      <RecipeCreationModal
        isOpen={showRecipeCreationModal}
        onClose={() => setShowRecipeCreationModal(false)}
      />
    </div>
  );
};

export default MealPlansPage; 