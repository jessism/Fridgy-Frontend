import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ManualRecipeEntryPage.css';

const ManualRecipeEntryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Form data state
  const [recipeData, setRecipeData] = useState({
    // Basic Info
    title: '',
    summary: '',
    prepTime: '',
    cookTime: '',
    servings: 4,
    difficulty: 'medium',
    image: '',
    imageFile: null,
    categories: [],

    // Ingredients
    ingredients: [
      { amount: '', unit: '', name: '', notes: '' }
    ],

    // Instructions
    instructions: [
      { step: '', time: '' }
    ],

    // Additional Details
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    cuisines: [],
    dishTypes: [],
    notes: ''
  });

  // Auto-save to localStorage and handle camera return
  useEffect(() => {
    // Check if returning from camera with image
    if (location.state?.capturedImage) {
      handleChange('image', location.state.capturedImage);
      handleChange('imageFile', location.state.imageBlob);
      // Clear the state to prevent re-applying on refresh
      window.history.replaceState({}, document.title);
    }

    // Load saved draft
    const savedData = localStorage.getItem('draft_recipe');
    if (savedData && !location.state?.capturedImage) {
      try {
        const parsed = JSON.parse(savedData);
        setRecipeData(parsed);
      } catch (e) {
        console.log('No valid draft found');
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (recipeData.title || recipeData.summary) {
      localStorage.setItem('draft_recipe', JSON.stringify(recipeData));
    }
  }, [recipeData]);

  // Handle input changes
  const handleChange = (field, value) => {
    setRecipeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Ingredient management
  const addIngredient = () => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { amount: '', unit: '', name: '', notes: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  // Instruction management
  const addInstruction = () => {
    setRecipeData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: '', time: '' }]
    }));
  };

  const removeInstruction = (index) => {
    setRecipeData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index, field, value) => {
    setRecipeData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      )
    }));
  };

  // Move instruction up/down
  const moveInstruction = (index, direction) => {
    const newInstructions = [...recipeData.instructions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newInstructions.length) {
      [newInstructions[index], newInstructions[newIndex]] =
      [newInstructions[newIndex], newInstructions[index]];

      setRecipeData(prev => ({
        ...prev,
        instructions: newInstructions
      }));
    }
  };

  // Parse ingredient text (e.g., "2 cups flour" -> {amount: 2, unit: "cups", name: "flour"})
  const parseIngredientText = (text) => {
    const match = text.match(/^([\d./]+)?\s*([a-zA-Z]+)?\s*(.+)?$/);
    if (match) {
      return {
        amount: match[1] || '',
        unit: match[2] || '',
        name: match[3] || text,
        notes: ''
      };
    }
    return { amount: '', unit: '', name: text, notes: '' };
  };

  // Handle paste of full ingredient list
  const handleIngredientsPaste = (e) => {
    const text = e.clipboardData.getData('text');
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length > 1) {
      e.preventDefault();
      const parsedIngredients = lines.map(line => parseIngredientText(line.trim()));
      setRecipeData(prev => ({
        ...prev,
        ingredients: parsedIngredients
      }));
    }
  };

  // Handle camera navigation
  const openCamera = () => {
    // Save current draft before navigating
    localStorage.setItem('draft_recipe', JSON.stringify(recipeData));
    // Navigate to recipe camera with return path
    navigate('/recipes/camera', {
      state: {
        returnPath: '/recipes/manual'
      }
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);
    handleChange('image', imageUrl);
    handleChange('imageFile', file);
  };

  const uploadImageToSupabase = async (imageFile) => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('fridgy_token');
      const formData = new FormData();
      formData.append('image', imageFile);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        console.error('Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };


  // Validate current section
  const validateSection = (section) => {
    switch(section) {
      case 1:
        if (!recipeData.title.trim()) {
          setError('Recipe title is required');
          return false;
        }
        break;
      case 2:
        const validIngredients = recipeData.ingredients.filter(ing => ing.name.trim());
        if (validIngredients.length === 0) {
          setError('At least one ingredient is required');
          return false;
        }
        break;
      case 3:
        const validInstructions = recipeData.instructions.filter(inst => inst.step.trim());
        if (validInstructions.length === 0) {
          setError('At least one instruction step is required');
          return false;
        }
        break;
      default:
        break;
    }
    setError('');
    return true;
  };

  // Navigation between sections
  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 4));
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  // Save recipe
  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        navigate('/signin');
        return;
      }

      // Upload image if needed
      let finalImageUrl = recipeData.image;
      if (recipeData.imageFile) {
        const uploadedUrl = await uploadImageToSupabase(recipeData.imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      // Calculate total time
      const prepMinutes = parseInt(recipeData.prepTime) || 0;
      const cookMinutes = parseInt(recipeData.cookTime) || 0;
      const totalMinutes = prepMinutes + cookMinutes;

      // Transform data to match backend format
      const recipeToSave = {
        title: recipeData.title,
        summary: recipeData.summary || '',
        image: finalImageUrl || null,

        // Transform ingredients to extendedIngredients format
        extendedIngredients: recipeData.ingredients
          .filter(ing => ing.name.trim())
          .map((ing, index) => ({
            id: index + 1,
            name: ing.name,
            amount: parseFloat(ing.amount) || 1,
            unit: ing.unit || '',
            original: `${ing.amount} ${ing.unit} ${ing.name}`.trim(),
            originalString: `${ing.amount} ${ing.unit} ${ing.name}`.trim(),
            meta: ing.notes ? [ing.notes] : []
          })),

        // Transform instructions to analyzedInstructions format
        analyzedInstructions: [{
          name: '',
          steps: recipeData.instructions
            .filter(inst => inst.step.trim())
            .map((inst, index) => ({
              number: index + 1,
              step: inst.step,
              length: inst.time ? { number: parseInt(inst.time), unit: 'minutes' } : undefined
            }))
        }],

        // Times and servings
        readyInMinutes: totalMinutes || 30,
        cookingMinutes: cookMinutes || null,
        preparationMinutes: prepMinutes || null,
        servings: parseInt(recipeData.servings) || 4,

        // Dietary attributes
        vegetarian: recipeData.vegetarian,
        vegan: recipeData.vegan,
        glutenFree: recipeData.glutenFree,
        dairyFree: recipeData.dairyFree,

        // Additional metadata
        cuisines: recipeData.cuisines,
        dishTypes: recipeData.dishTypes,

        // Source info
        source_type: 'manual',
        import_method: 'manual',
        source_author: 'Me',
        extraction_notes: recipeData.notes
      };

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipe: recipeToSave,
          source_url: null,
          import_method: 'manual',
          confidence: 1.0
        })
      });

      const data = await response.json();

      if (data.success) {
        // Clear draft
        localStorage.removeItem('draft_recipe');
        // Navigate to saved recipes
        navigate('/saved-recipes');
      } else {
        setError(data.error || 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear draft
  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      localStorage.removeItem('draft_recipe');
      window.location.reload();
    }
  };

  // Category options
  const categoryOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'];
  const cuisineOptions = ['American', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'French', 'Indian', 'Thai', 'Japanese', 'Greek'];
  const dishTypeOptions = ['main course', 'side dish', 'dessert', 'appetizer', 'salad', 'bread', 'breakfast', 'soup', 'beverage', 'sauce', 'marinade', 'fingerfood', 'snack', 'drink'];

  // Common units for dropdown
  const unitOptions = ['', 'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'pieces', 'clove', 'cloves', 'can', 'package', 'bunch', 'handful'];

  return (
    <div className="manual-recipe-entry">
      {/* Header */}
      <div className="manual-recipe-entry__header">
        <button
          className="manual-recipe-entry__back-button"
          onClick={() => navigate(-1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>Create Recipe</h1>
        <button
          className="manual-recipe-entry__clear-button"
          onClick={clearDraft}
        >
          Clear
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="manual-recipe-entry__progress">
        <div className={`progress-step ${currentSection >= 1 ? 'active' : ''}`}>
          <span className="progress-number">1</span>
          <span className="progress-label">Basic Info</span>
        </div>
        <div className={`progress-step ${currentSection >= 2 ? 'active' : ''}`}>
          <span className="progress-number">2</span>
          <span className="progress-label">Ingredients</span>
        </div>
        <div className={`progress-step ${currentSection >= 3 ? 'active' : ''}`}>
          <span className="progress-number">3</span>
          <span className="progress-label">Instructions</span>
        </div>
        <div className={`progress-step ${currentSection >= 4 ? 'active' : ''}`}>
          <span className="progress-number">4</span>
          <span className="progress-label">Details</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="manual-recipe-entry__error">
          {error}
        </div>
      )}

      {/* Form Content */}
      <div className="manual-recipe-entry__content">
        {/* Section 1: Basic Info */}
        {currentSection === 1 && (
          <div className="manual-recipe-entry__section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Recipe Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Grandma's Apple Pie"
                value={recipeData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="summary">Description</label>
              <textarea
                id="summary"
                placeholder="Brief description of your recipe..."
                value={recipeData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prepTime">Prep Time (minutes)</label>
                <input
                  id="prepTime"
                  type="number"
                  placeholder="15"
                  value={recipeData.prepTime}
                  onChange={(e) => handleChange('prepTime', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cookTime">Cook Time (minutes)</label>
                <input
                  id="cookTime"
                  type="number"
                  placeholder="30"
                  value={recipeData.cookTime}
                  onChange={(e) => handleChange('cookTime', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="servings">Servings</label>
                <input
                  id="servings"
                  type="number"
                  min="1"
                  value={recipeData.servings}
                  onChange={(e) => handleChange('servings', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  value={recipeData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="form-select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Recipe Image</label>

              {!recipeData.image && (
                <div className="image-upload-options">
                  <button
                    type="button"
                    onClick={openCamera}
                    className="image-option-button"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="image-option-button"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Upload Photo</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {recipeData.image && (
                <div className="image-preview-container">
                  <img
                    src={recipeData.image}
                    alt="Recipe preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('image', '')}
                    className="image-remove-button"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              {uploadingImage && (
                <div className="upload-progress">
                  Uploading image...
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Categories</label>
              <div className="checkbox-group">
                {categoryOptions.map(cat => (
                  <label key={cat} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={recipeData.categories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange('categories', [...recipeData.categories, cat]);
                        } else {
                          handleChange('categories', recipeData.categories.filter(c => c !== cat));
                        }
                      }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Ingredients */}
        {currentSection === 2 && (
          <div className="manual-recipe-entry__section">
            <h2>Ingredients</h2>
            <p className="section-hint">Tip: You can paste a full list of ingredients</p>

            <div className="ingredients-list" onPaste={handleIngredientsPaste}>
              {recipeData.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Amount"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    className="ingredient-amount"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="ingredient-unit"
                  >
                    {unitOptions.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="ingredient-name"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={ingredient.notes}
                    onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                    className="ingredient-notes"
                  />
                  {recipeData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="remove-button"
                      aria-label="Remove ingredient"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="add-button"
            >
              + Add Ingredient
            </button>
          </div>
        )}

        {/* Section 3: Instructions */}
        {currentSection === 3 && (
          <div className="manual-recipe-entry__section">
            <h2>Instructions</h2>

            <div className="instructions-list">
              {recipeData.instructions.map((instruction, index) => (
                <div key={index} className="instruction-row">
                  <span className="step-number">Step {index + 1}</span>
                  <textarea
                    placeholder="Describe this step..."
                    value={instruction.step}
                    onChange={(e) => updateInstruction(index, 'step', e.target.value)}
                    className="instruction-text"
                    rows="3"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Time (min)"
                    value={instruction.time}
                    onChange={(e) => updateInstruction(index, 'time', e.target.value)}
                    className="instruction-time"
                  />
                  <div className="instruction-actions">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveInstruction(index, 'up')}
                        className="move-button"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {index < recipeData.instructions.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveInstruction(index, 'down')}
                        className="move-button"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    )}
                    {recipeData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="remove-button"
                        aria-label="Remove step"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addInstruction}
              className="add-button"
            >
              + Add Step
            </button>
          </div>
        )}

        {/* Section 4: Additional Details */}
        {currentSection === 4 && (
          <div className="manual-recipe-entry__section">
            <h2>Additional Details</h2>

            <div className="form-group">
              <label>Dietary Information</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={recipeData.vegetarian}
                    onChange={(e) => handleChange('vegetarian', e.target.checked)}
                  />
                  <span>Vegetarian</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={recipeData.vegan}
                    onChange={(e) => handleChange('vegan', e.target.checked)}
                  />
                  <span>Vegan</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={recipeData.glutenFree}
                    onChange={(e) => handleChange('glutenFree', e.target.checked)}
                  />
                  <span>Gluten Free</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={recipeData.dairyFree}
                    onChange={(e) => handleChange('dairyFree', e.target.checked)}
                  />
                  <span>Dairy Free</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cuisine">Cuisine Type</label>
              <select
                id="cuisine"
                value={recipeData.cuisines[0] || ''}
                onChange={(e) => handleChange('cuisines', e.target.value ? [e.target.value] : [])}
                className="form-select"
              >
                <option value="">Select cuisine...</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine.toLowerCase()}>{cuisine}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dishType">Dish Type</label>
              <select
                id="dishType"
                value={recipeData.dishTypes[0] || ''}
                onChange={(e) => handleChange('dishTypes', e.target.value ? [e.target.value] : [])}
                className="form-select"
              >
                <option value="">Select dish type...</option>
                {dishTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Personal Notes</label>
              <textarea
                id="notes"
                placeholder="Any tips, variations, or personal notes..."
                value={recipeData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="form-textarea"
                rows="4"
              />
            </div>

            {/* Recipe Preview */}
            <div className="recipe-preview">
              <h3>Recipe Preview</h3>
              <div className="preview-content">
                <h4>{recipeData.title || 'Untitled Recipe'}</h4>
                <p>{recipeData.summary || 'No description provided'}</p>
                <div className="preview-meta">
                  <span>⏱️ {(parseInt(recipeData.prepTime) || 0) + (parseInt(recipeData.cookTime) || 0)} min</span>
                  <span>🍽️ {recipeData.servings} servings</span>
                  <span>📊 {recipeData.difficulty}</span>
                </div>
                <div className="preview-ingredients">
                  <strong>Ingredients:</strong> {recipeData.ingredients.filter(i => i.name).length} items
                </div>
                <div className="preview-instructions">
                  <strong>Instructions:</strong> {recipeData.instructions.filter(i => i.step).length} steps
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="manual-recipe-entry__footer">
        {currentSection > 1 && (
          <button
            onClick={prevSection}
            className="nav-button nav-button--secondary"
          >
            Previous
          </button>
        )}

        {currentSection < 4 ? (
          <button
            onClick={nextSection}
            className="nav-button nav-button--primary"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="nav-button nav-button--success"
          >
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ManualRecipeEntryPage;