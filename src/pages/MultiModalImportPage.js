import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import RecipeDetailModal from '../components/modals/RecipeDetailModal';
import './MultiModalImportPage.css';

const MultiModalImportPage = () => {
  const [importUrl, setImportUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [extractedRecipe, setExtractedRecipe] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState(null);
  const [sourceBreakdown, setSourceBreakdown] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Check clipboard for Instagram URL on mount
    checkClipboard();
  }, []);

  const checkClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.includes('instagram.com')) {
          console.log('[MultiModal] Found Instagram URL in clipboard:', text);
          setImportUrl(text);
          setStatus('📋 Found Instagram link in your clipboard!');
        }
      }
    } catch (err) {
      console.log('[MultiModal] Clipboard access not available');
    }
  };

  const handleMultiModalImport = async () => {
    // Validate URL
    if (!importUrl || !importUrl.includes('instagram.com')) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('🎬 Starting multi-modal analysis...');
    setExtractedRecipe(null);
    setSourceBreakdown(null);
    setConfidence(null);

    // Initialize progress tracking
    setExtractionProgress({
      caption: 'active',
      visual: 'pending',
      audio: 'pending',
      synthesis: 'pending'
    });

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        setError('Please sign in to import recipes');
        navigate('/signin');
        return;
      }

      // Simulate progress updates for better UX
      const updateProgress = async () => {
        // Caption analysis
        await new Promise(resolve => setTimeout(resolve, 800));
        setExtractionProgress(prev => ({ ...prev, caption: 'complete', visual: 'active' }));
        setStatus('🎥 Analyzing 6 smart video frames...');

        // Visual analysis
        await new Promise(resolve => setTimeout(resolve, 1200));
        setExtractionProgress(prev => ({ ...prev, visual: 'complete', audio: 'active' }));
        setStatus('🎤 Extracting audio narration...');

        // Audio extraction
        await new Promise(resolve => setTimeout(resolve, 1000));
        setExtractionProgress(prev => ({ ...prev, audio: 'complete', synthesis: 'active' }));
        setStatus('🧠 Synthesizing all sources with trust hierarchy...');
      };

      // Start progress animation
      const progressPromise = updateProgress();

      // Make API call
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/multi-modal-extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: importUrl })
      });

      await progressPromise; // Ensure progress animation completes

      const data = await response.json();
      console.log('[MultiModal] Response:', data);

      setExtractionProgress(prev => ({ ...prev, synthesis: 'complete' }));

      if (data.success && data.recipe) {
        setStatus(`✅ Recipe extracted with ${Math.round(data.confidence * 100)}% confidence!`);
        console.log('[MultiModal] Extracted recipe with source_author:', data.recipe.source_author);
        console.log('[MultiModal] Full recipe object:', {
          title: data.recipe.title,
          source_author: data.recipe.source_author,
          source_type: data.recipe.source_type,
          source_url: data.recipe.source_url,
          hasIngredients: !!data.recipe.extendedIngredients,
          hasInstructions: !!data.recipe.analyzedInstructions
        });
        setExtractedRecipe(data.recipe);
        setConfidence(data.confidence);
        setProcessingTime(data.processingTime);

        // Process source breakdown
        if (data.sourcesUsed) {
          setSourceBreakdown(data.sourcesUsed);
        }

        // Store recipe for potential save later
        sessionStorage.setItem('multiModalExtractedRecipe', JSON.stringify(data.recipe));
      } else {
        setError(data.error || 'Multi-modal extraction failed. Please try again.');
        setStatus('');
      }
    } catch (error) {
      console.error('[MultiModal] Import error:', error);
      setError('Network error. Please check your connection and try again.');
      setStatus('');
    } finally {
      setLoading(false);
      setTimeout(() => setExtractionProgress(null), 2000); // Keep progress visible briefly
    }
  };

  const handleSaveRecipe = async () => {
    if (!extractedRecipe) return;

    setLoading(true);
    setStatus('💾 Saving recipe to your collection...');

    try {
      const token = localStorage.getItem('fridgy_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      // Ensure source_author is preserved in the recipe
      const recipeToSave = {
        ...extractedRecipe,
        source_author: extractedRecipe.source_author || null,
        source_type: 'instagram' // Ensure source_type is set for multi-modal imports
      };

      console.log('[MultiModal] Saving recipe with source_author:', recipeToSave.source_author);
      console.log('[MultiModal] Full recipe being saved:', {
        title: recipeToSave.title,
        source_author: recipeToSave.source_author,
        source_type: recipeToSave.source_type,
        source_url: importUrl
      });

      const response = await fetch(`${apiUrl}/recipes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipe: recipeToSave,
          source_url: importUrl,
          import_method: 'multi-modal',
          confidence: confidence
        })
      });

      if (response.ok) {
        setStatus('✅ Recipe saved successfully!');
        setExtractedRecipe(null); // Close modal
        setTimeout(() => navigate('/saved-recipes'), 1500);
      } else {
        setError('Failed to save recipe. Please try again.');
      }
    } catch (error) {
      console.error('[MultiModal] Save error:', error);
      setError('Failed to save recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAnother = () => {
    setImportUrl('');
    setExtractedRecipe(null);
    setError('');
    setStatus('');
    setSourceBreakdown(null);
    setConfidence(null);
    setProcessingTime(null);
  };

  const handleModalClose = () => {
    setExtractedRecipe(null);
    setImportUrl('');
    setStatus('');
    setSourceBreakdown(null);
    setConfidence(null);
    setProcessingTime(null);
  };

  return (
    <div className="multi-modal-import-page">
      <AppNavBar />

      <div className="multi-modal-import-page__container">
        <div className="multi-modal-import-page__header">
          <button
            className="multi-modal-import-page__back-button"
            onClick={() => navigate('/import')}
          >
            ← Back
          </button>
          <h1>🎬 Multi-Modal Recipe Import</h1>
          <p className="multi-modal-import-page__subtitle">
            Advanced extraction using caption, video, and audio analysis
          </p>
        </div>

        <div className="multi-modal-import-page__main-content">
          <div className="multi-modal-import-page__input-section">
              <div className="multi-modal-import-page__input-wrapper">
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="Paste Instagram recipe URL here..."
                  className="multi-modal-import-page__input"
                  disabled={loading}
                />
                <button
                  onClick={handleMultiModalImport}
                  disabled={loading || !importUrl}
                  className="multi-modal-import-page__button multi-modal-import-page__button--primary"
                >
                  {loading ? '🔄 Analyzing...' : '🎬 Try Multi-Modal Import'}
                </button>
              </div>

              {status && !error && (
                <div className="multi-modal-import-page__status">
                  {status}
                </div>
              )}

              {error && (
                <div className="multi-modal-import-page__error">
                  {error}
                </div>
              )}
            </div>

            {/* Extraction Progress Display */}
            {extractionProgress && (
              <div className="multi-modal-import-page__progress">
                <h3>Extraction Pipeline:</h3>
                <div className="multi-modal-import-page__progress-stages">
                  <div className={`multi-modal-import-page__stage multi-modal-import-page__stage--${extractionProgress.caption}`}>
                    <span className="multi-modal-import-page__stage-icon">
                      {extractionProgress.caption === 'complete' ? '✅' :
                       extractionProgress.caption === 'active' ? '⏳' : '⭕'}
                    </span>
                    <div className="multi-modal-import-page__stage-info">
                      <strong>Caption Analysis</strong>
                      <span>Primary source (100% trust)</span>
                    </div>
                  </div>

                  <div className={`multi-modal-import-page__stage multi-modal-import-page__stage--${extractionProgress.visual}`}>
                    <span className="multi-modal-import-page__stage-icon">
                      {extractionProgress.visual === 'complete' ? '✅' :
                       extractionProgress.visual === 'active' ? '⏳' : '⭕'}
                    </span>
                    <div className="multi-modal-import-page__stage-info">
                      <strong>Video Frame Analysis</strong>
                      <span>6 smart frames (80% trust)</span>
                    </div>
                  </div>

                  <div className={`multi-modal-import-page__stage multi-modal-import-page__stage--${extractionProgress.audio}`}>
                    <span className="multi-modal-import-page__stage-icon">
                      {extractionProgress.audio === 'complete' ? '✅' :
                       extractionProgress.audio === 'active' ? '⏳' : '⭕'}
                    </span>
                    <div className="multi-modal-import-page__stage-info">
                      <strong>Audio Narration</strong>
                      <span>Voice & music (60% trust)</span>
                    </div>
                  </div>

                  <div className={`multi-modal-import-page__stage multi-modal-import-page__stage--${extractionProgress.synthesis}`}>
                    <span className="multi-modal-import-page__stage-icon">
                      {extractionProgress.synthesis === 'complete' ? '✅' :
                       extractionProgress.synthesis === 'active' ? '⏳' : '⭕'}
                    </span>
                    <div className="multi-modal-import-page__stage-info">
                      <strong>AI Synthesis</strong>
                      <span>Unified extraction with Gemini 2.0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Section */}
            <div className="multi-modal-import-page__features">
              <h3>Why Multi-Modal?</h3>
              <div className="multi-modal-import-page__feature-grid">
                <div className="multi-modal-import-page__feature">
                  <span className="multi-modal-import-page__feature-icon">📝</span>
                  <strong>Caption First</strong>
                  <p>Primary trust in text descriptions</p>
                </div>
                <div className="multi-modal-import-page__feature">
                  <span className="multi-modal-import-page__feature-icon">🎥</span>
                  <strong>Visual Analysis</strong>
                  <p>6 key frames for ingredient detection</p>
                </div>
                <div className="multi-modal-import-page__feature">
                  <span className="multi-modal-import-page__feature-icon">🎤</span>
                  <strong>Audio Context</strong>
                  <p>Narration for missing details</p>
                </div>
                <div className="multi-modal-import-page__feature">
                  <span className="multi-modal-import-page__feature-icon">🎯</span>
                  <strong>90% Accuracy</strong>
                  <p>Best-in-class extraction quality</p>
                </div>
              </div>
            </div>
        </div>
      </div>

      <MobileBottomNav />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={!!extractedRecipe && !loading}
        onClose={handleModalClose}
        recipe={extractedRecipe}
        customActionLabel="Save Recipe"
        onCookNow={handleSaveRecipe}
      />
    </div>
  );
};

export default MultiModalImportPage;