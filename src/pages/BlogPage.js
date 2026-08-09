import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import appLogo from '../assets/images/Logo.png';
import Button from '../components/Button';
import './BlogPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect old ?recipe=slug URLs to new path-based URLs
  useEffect(() => {
    const recipeSlug = searchParams.get('recipe');
    if (recipeSlug) {
      navigate(`/resources/blog/${recipeSlug}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch recipes from API
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blog/recipes`);
        const data = await res.json();
        if (data.success) {
          setRecipes(data.recipes.map(r => ({
            ...r,
            // Parse JSONB fields if needed
            ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : (r.ingredients || []),
          })));
        }
      } catch (err) {
        console.error('Failed to fetch blog recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const queryTerms = query.split(' ').filter(term => term.length > 0);
    const titleLower = recipe.title.toLowerCase();
    const ingredientsLower = (recipe.ingredients || []).map(ing =>
      typeof ing === 'string' ? ing.toLowerCase() : ''
    );
    const prepTimeLower = (recipe.prep_time || '').toLowerCase();

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

  return (
    <div className="blog-page">
      <Helmet>
        <title>Recipe Collection | Trackabite</title>
        <meta name="description" content="Discover delicious recipes to make with what's in your fridge. Browse our collection of easy, healthy, and flavorful meals." />
        <link rel="canonical" href="https://www.trackabite.app/resources/blog" />
        <meta property="og:title" content="Recipe Collection | Trackabite" />
        <meta property="og:description" content="Discover delicious recipes to make with what's in your fridge." />
        <meta property="og:url" content="https://www.trackabite.app/resources/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

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
          {loading ? (
            <div className="blog-page__no-results">
              <p>Loading recipes...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="blog-page__no-results">
              <p>No recipes found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
              <p>Try searching for a different recipe or ingredient</p>
            </div>
          ) : (
          <div className="blog-page__grid">
            {filteredRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/resources/blog/${recipe.slug}`}
                className="blog-page__card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="blog-page__card-image">
                  <img src={recipe.image_url} alt={recipe.title} />
                </div>
                <div className="blog-page__card-content">
                  <h3 className="blog-page__card-title">{recipe.title}</h3>
                  <div className="blog-page__card-meta">
                    <span className="blog-page__card-time">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {recipe.prep_time} + {recipe.cook_time}
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
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
