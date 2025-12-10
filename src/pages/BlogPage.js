import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import appLogo from '../assets/images/Logo.png';
import { blogRecipes } from '../data/blogRecipes';
import Button from '../components/Button';
import './BlogPage.css';

// Convert title to URL-friendly slug
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const quickFilters = [
  { label: 'All', value: '' },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Seafood', value: 'salmon shrimp fish' },
  { label: 'Vegetarian', value: 'vegetable tofu chickpea' },
  { label: 'Quick & Easy', value: '15 mins 10 mins' },
  { label: 'Pasta', value: 'pasta spaghetti noodles' },
  { label: 'Healthy', value: 'salad yogurt avocado' },
];

const BlogPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Filter recipes based on search query
  const filteredRecipes = blogRecipes.filter((recipe) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    // Split query into words for multi-term matching (used by quick filters)
    const queryTerms = query.split(' ').filter(term => term.length > 0);
    const titleLower = recipe.title.toLowerCase();
    const ingredientsLower = recipe.ingredients.map(ing => ing.toLowerCase());
    const prepTimeLower = recipe.prepTime.toLowerCase();

    // Check if any query term matches title, ingredients, or prep time
    return queryTerms.some(term =>
      titleLower.includes(term) ||
      ingredientsLower.some(ing => ing.includes(term)) ||
      prepTimeLower.includes(term)
    );
  });

  const handleFilterClick = (filterValue) => {
    setActiveFilter(filterValue);
    setSearchQuery(filterValue);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle URL query parameter on mount and when it changes
  useEffect(() => {
    const recipeSlug = searchParams.get('recipe');
    if (recipeSlug) {
      const recipe = blogRecipes.find(r => slugify(r.title) === recipeSlug);
      if (recipe) {
        setSelectedRecipe(recipe);
        document.body.style.overflow = 'hidden';
      }
    }
  }, [searchParams]);

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setSearchParams({ recipe: slugify(recipe.title) });
    document.body.style.overflow = 'hidden';
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setSearchParams({});
    document.body.style.overflow = '';
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeRecipeModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="blog-page">
      {/* Header */}
      <header className={`blog-page__header ${isScrolled ? 'blog-page__header--scrolled' : ''}`}>
        <div className="blog-page__container">
          <div className="blog-page__header-content">
            <Link to="/" className="blog-page__logo-section">
              <img src={appLogo} alt="Trackabite logo" className="blog-page__logo" />
              <span className="blog-page__brand-name">Trackabite</span>
            </Link>
            <div className="blog-page__header-actions">
              <Button variant="secondary" size="medium" href="/signin">
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="blog-page__hero">
        <div className="blog-page__container">
          <h1 className="blog-page__title">Recipe Collection</h1>
          <p className="blog-page__subtitle">
            Discover delicious recipes to make with what's in your fridge
          </p>
          <div className="blog-page__search">
            <input
              type="text"
              className="blog-page__search-input"
              placeholder="Search recipes or ingredients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveFilter('');
              }}
            />
            <button className="blog-page__search-button" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
          <div className="blog-page__filters">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                className={`blog-page__filter-pill ${activeFilter === filter.value ? 'blog-page__filter-pill--active' : ''}`}
                onClick={() => handleFilterClick(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recipe Grid */}
      <section className="blog-page__recipes">
        <div className="blog-page__container">
          {filteredRecipes.length === 0 ? (
            <div className="blog-page__no-results">
              <p>No recipes found for "{searchQuery}"</p>
              <p>Try searching for a different recipe or ingredient</p>
            </div>
          ) : (
          <div className="blog-page__grid">
            {filteredRecipes.map((recipe) => (
              <article
                key={recipe.id}
                className="blog-page__card"
                onClick={() => openRecipeModal(recipe)}
              >
                <div className="blog-page__card-image">
                  <img src={recipe.image} alt={recipe.title} />
                </div>
                <div className="blog-page__card-content">
                  <h3 className="blog-page__card-title">{recipe.title}</h3>
                  <div className="blog-page__card-meta">
                    <span className="blog-page__card-time">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {recipe.prepTime} + {recipe.cookTime}
                    </span>
                    <span className="blog-page__card-servings">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {recipe.servings} servings
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="blog-page__modal-overlay" onClick={closeRecipeModal}>
          <div className="blog-page__modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="blog-page__modal-close"
              onClick={closeRecipeModal}
              aria-label="Close recipe"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>

            <div className="blog-page__modal-image">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} />
            </div>

            <div className="blog-page__modal-content">
              <h2 className="blog-page__modal-title">{selectedRecipe.title}</h2>
              <p className="blog-page__modal-description">{selectedRecipe.description}</p>

              <div className="blog-page__modal-meta">
                <div className="blog-page__modal-meta-item">
                  <span className="blog-page__modal-meta-label">Prep Time</span>
                  <span className="blog-page__modal-meta-value">{selectedRecipe.prepTime}</span>
                </div>
                <div className="blog-page__modal-meta-item">
                  <span className="blog-page__modal-meta-label">Cook Time</span>
                  <span className="blog-page__modal-meta-value">{selectedRecipe.cookTime}</span>
                </div>
                <div className="blog-page__modal-meta-item">
                  <span className="blog-page__modal-meta-label">Servings</span>
                  <span className="blog-page__modal-meta-value">{selectedRecipe.servings}</span>
                </div>
              </div>

              <div className="blog-page__modal-section">
                <h3 className="blog-page__modal-section-title">Ingredients</h3>
                <ul className="blog-page__modal-ingredients">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="blog-page__modal-section">
                <h3 className="blog-page__modal-section-title">Instructions</h3>
                <ol className="blog-page__modal-instructions">
                  {selectedRecipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
