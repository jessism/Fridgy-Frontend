import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './BlogAdmin.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BlogAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchRecipes();
  }, [user, navigate]);

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const res = await fetch(`${API_BASE_URL}/blog/admin/recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('fridgy_token');
      const res = await fetch(`${API_BASE_URL}/blog/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecipes(recipes.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    }
  };

  const handlePublish = async (id) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const res = await fetch(`${API_BASE_URL}/blog/recipes/${id}/publish`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecipes(recipes.map(r => r.id === id ? data.recipe : r));
      }
    } catch (err) {
      console.error('Failed to publish recipe:', err);
    }
  };

  const copyLink = (slug, id) => {
    const url = `https://www.trackabite.app/resources/blog/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const published = recipes.filter(r => r.status === 'published');
  const drafts = recipes.filter(r => r.status === 'draft');

  if (!user?.isAdmin) return null;

  return (
    <div className="blog-admin">
      <div className="blog-admin__header">
        <div className="blog-admin__header-left">
          <Link to="/home" className="blog-admin__back">&larr; Back</Link>
          <h1 className="blog-admin__title">Blog Recipes</h1>
        </div>
        <Link to="/admin/blog/new" className="blog-admin__new-btn">
          + New Recipe
        </Link>
      </div>

      <div className="blog-admin__stats">
        <div className="blog-admin__stat">
          <span className="blog-admin__stat-number">{published.length}</span>
          <span className="blog-admin__stat-label">Published</span>
        </div>
        <div className="blog-admin__stat">
          <span className="blog-admin__stat-number">{drafts.length}</span>
          <span className="blog-admin__stat-label">Drafts</span>
        </div>
      </div>

      {loading ? (
        <div className="blog-admin__loading">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <div className="blog-admin__empty">
          <p>No recipes yet. Upload your first photo to get started!</p>
          <Link to="/admin/blog/new" className="blog-admin__new-btn">+ New Recipe</Link>
        </div>
      ) : (
        <div className="blog-admin__list">
          {recipes.map(recipe => (
            <div key={recipe.id} className="blog-admin__item">
              <div className="blog-admin__item-image">
                <img src={recipe.image_url} alt={recipe.title} />
              </div>
              <div className="blog-admin__item-info">
                <h3 className="blog-admin__item-title">{recipe.title}</h3>
                <div className="blog-admin__item-meta">
                  <span className={`blog-admin__status blog-admin__status--${recipe.status}`}>
                    {recipe.status}
                  </span>
                  {recipe.published_at && (
                    <span className="blog-admin__item-date">
                      {new Date(recipe.published_at).toLocaleDateString()}
                    </span>
                  )}
                  <span className="blog-admin__item-time">
                    {recipe.prep_time} prep + {recipe.cook_time} cook
                  </span>
                </div>
              </div>
              <div className="blog-admin__item-actions">
                {recipe.status === 'published' && (
                  <button
                    className="blog-admin__action-btn blog-admin__action-btn--copy"
                    onClick={() => copyLink(recipe.slug, recipe.id)}
                  >
                    {copiedId === recipe.id ? 'Copied!' : 'Copy Link'}
                  </button>
                )}
                {recipe.status === 'draft' && (
                  <button
                    className="blog-admin__action-btn blog-admin__action-btn--publish"
                    onClick={() => handlePublish(recipe.id)}
                  >
                    Publish
                  </button>
                )}
                <button
                  className="blog-admin__action-btn blog-admin__action-btn--edit"
                  onClick={() => navigate(`/admin/blog/edit/${recipe.id}`)}
                >
                  Edit
                </button>
                <button
                  className="blog-admin__action-btn blog-admin__action-btn--delete"
                  onClick={() => handleDelete(recipe.id, recipe.title)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogAdmin;
