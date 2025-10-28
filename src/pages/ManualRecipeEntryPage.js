import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ManualRecipeEntryPage.css';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { CheckoutModal } from '../components/modals/CheckoutModal';

const ManualRecipeEntryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess, startCheckout, checkoutSecret, closeCheckout, pollForUpgrade, refresh } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState(1);
  const fileInputRef = useRef(null);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false });

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
    // First, load any saved draft
    const savedData = localStorage.getItem('draft_recipe');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setRecipeData(parsed);
      } catch (e) {
        console.log('No valid draft found');
      }
    }

    // Then, if returning from camera, add the image to existing data
    if (location.state?.capturedImage) {
      setRecipeData(prev => ({
        ...prev, // Keep all existing data (title, summary, etc.)
        image: location.state.capturedImage,
        imageFile: location.state.imageBlob
      }));
      // Clear the state to prevent re-applying on refresh
      window.history.replaceState({}, document.title);
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
    // Focus on the new ingredient's name field after adding
    setTimeout(() => {
      const inputs = document.querySelectorAll('.manual-recipe-entry__ingredient-name-input');
      const lastInput = inputs[inputs.length - 1];
      if (lastInput) lastInput.focus();
    }, 100);
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
    // Focus on the new instruction's textarea after adding
    setTimeout(() => {
      const textareas = document.querySelectorAll('.manual-recipe-entry__instruction-input');
      const lastTextarea = textareas[textareas.length - 1];
      if (lastTextarea) lastTextarea.focus();
    }, 100);
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

  // TODO: Future enhancement - implement image upload to Supabase storage
  // For now, manual recipes are saved without images


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
    // Check uploaded recipes limit
    const limitCheck = canAccess('uploaded_recipes');
    if (!limitCheck.allowed) {
      setUpgradeModal({
        isOpen: true,
        feature: 'uploaded recipes',
        current: limitCheck.current,
        limit: limitCheck.limit
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        navigate('/signin');
        return;
      }

      // Upload image if user has taken a photo
      let finalImageUrl = null;

      if (recipeData.image && recipeData.image.startsWith('data:image')) {
        console.log('[Manual Recipe] Uploading user photo...');
        console.log('[Manual Recipe] Image data URL length:', recipeData.image.length);

        try {
          // Convert base64 to blob
          const base64Response = await fetch(recipeData.image);
          const blob = await base64Response.blob();
          console.log('[Manual Recipe] Blob size:', blob.size, 'bytes, type:', blob.type);

          // Create FormData for upload
          const formData = new FormData();
          formData.append('image', blob, 'recipe-photo.jpg');

          // Upload to backend
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          console.log('[Manual Recipe] Uploading to:', `${apiUrl}/recipes/upload-image`);

          const uploadResponse = await fetch(`${apiUrl}/recipes/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          console.log('[Manual Recipe] Upload response status:', uploadResponse.status);
          const uploadResult = await uploadResponse.json();
          console.log('[Manual Recipe] Upload response:', uploadResult);

          if (uploadResult.success && uploadResult.imageUrl) {
            finalImageUrl = uploadResult.imageUrl;
            console.log('[Manual Recipe] ✅ Photo uploaded successfully!');
            console.log('[Manual Recipe] Final image URL:', finalImageUrl);
          } else {
            console.error('[Manual Recipe] ❌ Photo upload failed:', uploadResult.error || 'No imageUrl in response');
            console.error('[Manual Recipe] Full response:', uploadResult);
            setError('Warning: Photo upload failed. Recipe will be saved without image.');
            // Continue without image if upload fails
          }
        } catch (uploadError) {
          console.error('[Manual Recipe] ❌ Exception during photo upload:', uploadError);
          setError('Warning: Could not upload photo. Recipe will be saved without image.');
          // Continue without image if upload fails
        }
      } else if (recipeData.imageFile) {
        console.log('[Manual Recipe] Uploading selected image file...');
        console.log('[Manual Recipe] File name:', recipeData.imageFile.name);
        console.log('[Manual Recipe] File size:', recipeData.imageFile.size, 'bytes');

        try {
          // Upload file directly
          const formData = new FormData();
          formData.append('image', recipeData.imageFile);

          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          console.log('[Manual Recipe] Uploading to:', `${apiUrl}/recipes/upload-image`);

          const uploadResponse = await fetch(`${apiUrl}/recipes/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          console.log('[Manual Recipe] Upload response status:', uploadResponse.status);
          const uploadResult = await uploadResponse.json();
          console.log('[Manual Recipe] Upload response:', uploadResult);

          if (uploadResult.success && uploadResult.imageUrl) {
            finalImageUrl = uploadResult.imageUrl;
            console.log('[Manual Recipe] ✅ Image file uploaded successfully!');
            console.log('[Manual Recipe] Final image URL:', finalImageUrl);
          } else {
            console.error('[Manual Recipe] ❌ Image file upload failed:', uploadResult.error || 'No imageUrl in response');
            console.error('[Manual Recipe] Full response:', uploadResult);
            setError('Warning: Photo upload failed. Recipe will be saved without image.');
          }
        } catch (uploadError) {
          console.error('[Manual Recipe] ❌ Exception during image file upload:', uploadError);
          setError('Warning: Could not upload photo. Recipe will be saved without image.');
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
        image: finalImageUrl || null, // Now includes uploaded image URL

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

      console.log('[Manual Recipe] Saving recipe:', recipeToSave.title);
      console.log('[Manual Recipe] Recipe image URL to save:', recipeToSave.image || 'NO IMAGE');
      console.log('[Manual Recipe] Full recipe object:', JSON.stringify(recipeToSave, null, 2));

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

      // Handle limit exceeded (backend fallback)
      if (response.status === 402 || data.error === 'LIMIT_EXCEEDED') {
        setUpgradeModal({
          isOpen: true,
          feature: 'uploaded recipes',
          current: data.current,
          limit: data.limit
        });
        setLoading(false);
        return;
      }

      if (data.success) {
        console.log('[Manual Recipe] Recipe saved successfully!');
        // Clear draft
        localStorage.removeItem('draft_recipe');
        // Navigate to uploaded recipes (user-created content)
        navigate('/uploaded-recipes');
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
  const dishTypeOptions = ['main course', 'side dish', 'dessert', 'appetizer', 'salad', 'bread', 'breakfast', 'soup', 'beverage', 'sauce', 'marinade', 'fingerfood', 'snack', 'drink'];

  // Common units for dropdown
  const unitOptions = ['', 'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'pieces', 'clove', 'cloves', 'can', 'package', 'bunch', 'handful'];

  return (
    <div className="manual-recipe-entry">
      {/* Header */}
      <div className="manual-recipe-entry__header">
        <button
          className="manual-recipe-entry__back-button"
          onClick={() => navigate('/meal-plans/recipes')}
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

            <div className="manual-recipe-entry__ingredients-minimal" onPaste={handleIngredientsPaste}>
              {recipeData.ingredients.map((ingredient, index) => (
                <div key={index} className="manual-recipe-entry__ingredient-minimal">
                  <span className="manual-recipe-entry__ingredient-circle"></span>
                  <div className="manual-recipe-entry__ingredient-info">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          // Move focus to amount field
                          const amountInput = e.target.parentElement.querySelector('.manual-recipe-entry__ingredient-amount-input');
                          if (amountInput) amountInput.focus();
                        }
                      }}
                      className="manual-recipe-entry__ingredient-name-input"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Amount (e.g., 2 cups)"
                      value={ingredient.amount && ingredient.unit ? `${ingredient.amount} ${ingredient.unit}` : ingredient.amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Parse amount and unit from single input
                        const match = value.match(/^([\d./]+)?\s*(.*)$/);
                        if (match) {
                          updateIngredient(index, 'amount', match[1] || '');
                          updateIngredient(index, 'unit', match[2] || '');
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          // If this is the last ingredient and both fields have values, add a new one
                          if (index === recipeData.ingredients.length - 1 && ingredient.name) {
                            addIngredient();
                          } else {
                            // Otherwise, move to next ingredient's name field
                            const nextIngredient = document.querySelectorAll('.manual-recipe-entry__ingredient-name-input')[index + 1];
                            if (nextIngredient) nextIngredient.focus();
                          }
                        }
                      }}
                      className="manual-recipe-entry__ingredient-amount-input"
                    />
                  </div>
                  {recipeData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="manual-recipe-entry__ingredient-delete-btn"
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

            <div className="manual-recipe-entry__instructions-minimal">
              {recipeData.instructions.map((instruction, index) => (
                <div key={index} className="manual-recipe-entry__instruction-minimal">
                  <span className="manual-recipe-entry__instruction-number">
                    {index + 1}
                  </span>
                  <div className="manual-recipe-entry__instruction-info">
                    <textarea
                      placeholder="Describe this step..."
                      value={instruction.step}
                      onChange={(e) => updateInstruction(index, 'step', e.target.value)}
                      onKeyPress={(e) => {
                        // Add new step on Enter (with Shift for new line within step)
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          // If this is the last step and it has content, add a new one
                          if (index === recipeData.instructions.length - 1 && instruction.step.trim()) {
                            addInstruction();
                          }
                        }
                      }}
                      className="manual-recipe-entry__instruction-input"
                      rows="2"
                      required
                    />
                  </div>
                  {recipeData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="manual-recipe-entry__instruction-delete-btn"
                      aria-label="Remove step"
                    >
                      ×
                    </button>
                  )}
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false })}
        feature={upgradeModal.feature}
        current={upgradeModal.current}
        limit={upgradeModal.limit}
        startCheckout={startCheckout}
      />

      {/* Embedded Checkout Modal */}
      {checkoutSecret && (
        <CheckoutModal
          clientSecret={checkoutSecret}
          onClose={closeCheckout}
          onSuccess={refresh}
          pollForUpgrade={pollForUpgrade}
        />
      )}
    </div>
  );
};

export default ManualRecipeEntryPage;