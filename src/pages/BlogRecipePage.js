import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import appLogo from '../assets/images/Logo.png';
import Button from '../components/Button';
import './BlogPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BlogRecipePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blog/recipes/${slug}`);
        const data = await res.json();
        if (data.success) {
          const r = data.recipe;
          setRecipe({
            ...r,
            ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients,
            instructions: typeof r.instructions === 'string' ? JSON.parse(r.instructions) : r.instructions,
          });
        } else {
          navigate('/resources/blog', { replace: true });
        }
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
        navigate('/resources/blog', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [slug, navigate]);

  // Convert "15 mins" to ISO 8601 duration "PT15M" for structured data
  const toISO8601Duration = (timeStr) => {
    if (!timeStr) return undefined;
    const match = timeStr.match(/(\d+)/);
    if (!match) return undefined;
    const mins = parseInt(match[1]);
    if (timeStr.toLowerCase().includes('hr') || timeStr.toLowerCase().includes('hour')) {
      return `PT${mins}H`;
    }
    return `PT${mins}M`;
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div style={{ padding: '200px 0', textAlign: 'center', color: '#888' }}>Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) return null;

  const canonicalUrl = `https://www.trackabite.app/resources/blog/${recipe.slug}`;

  // Schema.org Recipe structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.title,
    "image": recipe.image_url,
    "description": recipe.description,
    "prepTime": toISO8601Duration(recipe.prep_time),
    "cookTime": toISO8601Duration(recipe.cook_time),
    "recipeYield": `${recipe.servings} servings`,
    "recipeIngredient": recipe.ingredients,
    "recipeInstructions": recipe.instructions.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "text": step
    })),
    "author": {
      "@type": "Organization",
      "name": "Trackabite"
    }
  };

  return (
    <div className="blog-page">
      <Helmet>
        <title>{recipe.title} | Trackabite Recipes</title>
        <meta name="description" content={recipe.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={recipe.title} />
        <meta property="og:description" content={recipe.description} />
        <meta property="og:image" content={recipe.image_url} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={recipe.title} />
        <meta name="twitter:description" content={recipe.description} />
        <meta name="twitter:image" content={recipe.image_url} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
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
              <Button variant="secondary" size="medium" href="/resources/blog">
                All Recipes
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Recipe Content - full page, not modal */}
      <section className="blog-recipe-page">
        <div className="blog-recipe-page__container">
          <Link to="/resources/blog" className="blog-recipe-page__back">&larr; All Recipes</Link>

          <div className="blog-recipe-page__image">
            <img src={recipe.image_url} alt={recipe.title} />
          </div>

          <div className="blog-recipe-page__content">
            <h1 className="blog-recipe-page__title">{recipe.title}</h1>
            <p className="blog-recipe-page__description">{recipe.description}</p>

            <div className="blog-page__modal-meta">
              <div className="blog-page__modal-meta-item">
                <span className="blog-page__modal-meta-label">Prep Time</span>
                <span className="blog-page__modal-meta-value">{recipe.prep_time}</span>
              </div>
              <div className="blog-page__modal-meta-item">
                <span className="blog-page__modal-meta-label">Cook Time</span>
                <span className="blog-page__modal-meta-value">{recipe.cook_time}</span>
              </div>
              <div className="blog-page__modal-meta-item">
                <span className="blog-page__modal-meta-label">Servings</span>
                <span className="blog-page__modal-meta-value">{recipe.servings}</span>
              </div>
            </div>

            <div className="blog-page__modal-section">
              <h3 className="blog-page__modal-section-title">Ingredients</h3>
              <ul className="blog-page__modal-ingredients">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="blog-page__modal-section">
              <h3 className="blog-page__modal-section-title">Instructions</h3>
              <ol className="blog-page__modal-instructions">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogRecipePage;
