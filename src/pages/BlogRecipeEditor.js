import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import './BlogRecipeEditor.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BlogRecipeEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // undefined for new, id for edit
  const fileInputRef = useRef(null);

  const [recipe, setRecipe] = useState({
    title: '',
    slug: '',
    description: '',
    image_url: '',
    prep_time: '',
    cook_time: '',
    servings: 4,
    ingredients: [''],
    instructions: [''],
    tags: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    if (id) {
      fetchRecipe();
    }
  }, [user, navigate, id]);

  const fetchRecipe = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const res = await fetch(`${API_BASE_URL}/blog/admin/recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const found = data.recipes.find(r => r.id === parseInt(id));
        if (found) {
          // Parse JSONB fields if they're strings
          const ingredients = typeof found.ingredients === 'string'
            ? JSON.parse(found.ingredients) : found.ingredients;
          const instructions = typeof found.instructions === 'string'
            ? JSON.parse(found.instructions) : found.instructions;
          const tags = typeof found.tags === 'string'
            ? JSON.parse(found.tags) : (found.tags || []);

          setRecipe({
            ...found,
            ingredients,
            instructions,
            tags
          });
          setImagePreview(found.image_url);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recipe:', err);
      setError('Failed to load recipe');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      setError('Please select a photo first');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('fridgy_token');
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch(`${API_BASE_URL}/blog/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setRecipe(prev => ({
          ...prev,
          ...data.recipe,
          ingredients: data.recipe.ingredients || [''],
          instructions: data.recipe.instructions || [''],
          tags: data.recipe.tags || []
        }));
        setImagePreview(data.recipe.image_url);
        setImageFile(null); // Image already uploaded by backend
      } else {
        setError(data.error || 'Failed to generate recipe');
      }
    } catch (err) {
      console.error('Generate error:', err);
      setError('Failed to generate recipe. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (status) => {
    if (!recipe.title || !recipe.description || !recipe.image_url) {
      setError('Please fill in the title, description, and upload a photo');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('fridgy_token');
      const body = {
        ...recipe,
        status,
        ingredients: recipe.ingredients.filter(i => i.trim()),
        instructions: recipe.instructions.filter(i => i.trim())
      };

      const url = id
        ? `${API_BASE_URL}/blog/recipes/${id}`
        : `${API_BASE_URL}/blog/recipes`;

      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        navigate('/admin/blog');
      } else {
        setError(data.error || 'Failed to save recipe');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic list helpers
  const updateListItem = (field, index, value) => {
    setRecipe(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addListItem = (field) => {
    setRecipe(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeListItem = (field, index) => {
    if (recipe[field].length <= 1) return;
    setRecipe(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !recipe.tags.includes(tag)) {
      setRecipe(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setRecipe(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="blog-editor">
      <div className="blog-editor__header">
        <Link to="/admin/blog" className="blog-editor__back">&larr; Back to recipes</Link>
        <h1 className="blog-editor__title">{id ? 'Edit Recipe' : 'New Recipe'}</h1>
      </div>

      {error && <div className="blog-editor__error">{error}</div>}

      {/* Photo Upload Section */}
      <div className="blog-editor__section">
        <h2 className="blog-editor__section-title">Photo</h2>
        <div className="blog-editor__upload-area">
          {imagePreview ? (
            <div className="blog-editor__preview">
              <img src={imagePreview} alt="Recipe preview" />
              <button
                className="blog-editor__change-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </button>
            </div>
          ) : (
            <div
              className="blog-editor__dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            >
              <p>Drop a photo here or click to select</p>
              <span>JPEG, PNG, WebP — max 10MB</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>

        {imageFile && !recipe.title && (
          <button
            className="blog-editor__generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating recipe...' : 'Generate Recipe from Photo'}
          </button>
        )}

        {recipe.title && imageFile && (
          <button
            className="blog-editor__generate-btn blog-editor__generate-btn--regen"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Regenerating...' : 'Regenerate Recipe'}
          </button>
        )}
      </div>

      {/* Recipe Details */}
      {(recipe.title || id) && (
        <>
          <div className="blog-editor__section">
            <h2 className="blog-editor__section-title">Details</h2>

            <label className="blog-editor__label">Title</label>
            <input
              className="blog-editor__input"
              type="text"
              value={recipe.title}
              onChange={(e) => setRecipe(prev => ({
                ...prev,
                title: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
              }))}
              placeholder="Recipe title"
            />

            <label className="blog-editor__label">Description</label>
            <textarea
              className="blog-editor__textarea"
              value={recipe.description}
              onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief appetizing description"
              rows={2}
            />

            <div className="blog-editor__row">
              <div>
                <label className="blog-editor__label">Prep Time</label>
                <input
                  className="blog-editor__input"
                  type="text"
                  value={recipe.prep_time}
                  onChange={(e) => setRecipe(prev => ({ ...prev, prep_time: e.target.value }))}
                  placeholder="15 mins"
                />
              </div>
              <div>
                <label className="blog-editor__label">Cook Time</label>
                <input
                  className="blog-editor__input"
                  type="text"
                  value={recipe.cook_time}
                  onChange={(e) => setRecipe(prev => ({ ...prev, cook_time: e.target.value }))}
                  placeholder="25 mins"
                />
              </div>
              <div>
                <label className="blog-editor__label">Servings</label>
                <input
                  className="blog-editor__input"
                  type="number"
                  value={recipe.servings}
                  onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  min={1}
                />
              </div>
            </div>
          </div>

          <div className="blog-editor__section">
            <h2 className="blog-editor__section-title">Ingredients</h2>
            {recipe.ingredients.map((item, i) => (
              <div key={i} className="blog-editor__list-item">
                <input
                  className="blog-editor__input"
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem('ingredients', i, e.target.value)}
                  placeholder={`Ingredient ${i + 1}`}
                />
                <button
                  className="blog-editor__remove-btn"
                  onClick={() => removeListItem('ingredients', i)}
                >
                  &times;
                </button>
              </div>
            ))}
            <button className="blog-editor__add-btn" onClick={() => addListItem('ingredients')}>
              + Add ingredient
            </button>
          </div>

          <div className="blog-editor__section">
            <h2 className="blog-editor__section-title">Instructions</h2>
            {recipe.instructions.map((item, i) => (
              <div key={i} className="blog-editor__list-item">
                <span className="blog-editor__step-number">{i + 1}.</span>
                <textarea
                  className="blog-editor__textarea"
                  value={item}
                  onChange={(e) => updateListItem('instructions', i, e.target.value)}
                  placeholder={`Step ${i + 1}`}
                  rows={2}
                />
                <button
                  className="blog-editor__remove-btn"
                  onClick={() => removeListItem('instructions', i)}
                >
                  &times;
                </button>
              </div>
            ))}
            <button className="blog-editor__add-btn" onClick={() => addListItem('instructions')}>
              + Add step
            </button>
          </div>

          <div className="blog-editor__section">
            <h2 className="blog-editor__section-title">Tags</h2>
            <div className="blog-editor__tags">
              {recipe.tags.map(tag => (
                <span key={tag} className="blog-editor__tag">
                  {tag}
                  <button onClick={() => removeTag(tag)}>&times;</button>
                </span>
              ))}
            </div>
            <div className="blog-editor__tag-input">
              <input
                className="blog-editor__input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
              />
              <button className="blog-editor__add-btn" onClick={addTag}>Add</button>
            </div>
          </div>

          <div className="blog-editor__actions">
            <button
              className="blog-editor__save-btn blog-editor__save-btn--draft"
              onClick={() => handleSave('draft')}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="blog-editor__save-btn blog-editor__save-btn--publish"
              onClick={() => handleSave('published')}
              disabled={saving}
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogRecipeEditor;
