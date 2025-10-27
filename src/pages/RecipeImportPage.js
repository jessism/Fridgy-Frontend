import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FridgyLogo from '../assets/images/Logo.png';
import './RecipeImportPage.css';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { CheckoutModal } from '../components/modals/CheckoutModal';
import { useGuidedTourContext } from '../contexts/GuidedTourContext';
import GuidedTooltip from '../components/guided-tour/GuidedTooltip';
import RecipeImportSuccessModal from '../components/guided-tour/RecipeImportSuccessModal';
import '../components/guided-tour/GuidedTour.css'; // Import guided tour styles

const RecipeImportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccess, startCheckout, checkoutSecret, closeCheckout } = useSubscription();
  const { shouldShowTooltip, completeStep, goToStep, isActive, STEPS } = useGuidedTourContext();

  // Check if coming from push notification
  const params = new URLSearchParams(location.search);
  const importing = params.get('importing');

  const [importUrl, setImportUrl] = useState('');
  const [loading, setLoading] = useState(importing === 'true'); // Initialize from URL param
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false });
  const [status, setStatus] = useState(importing === 'true' ? '📥 Importing recipe from Instagram...' : '');
  const [error, setError] = useState('');
  const [extractedRecipe, setExtractedRecipe] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCaption, setManualCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [apifyLoading, setApifyLoading] = useState(false);
  const [apifyUsage, setApifyUsage] = useState(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isTimeoutError, setIsTimeoutError] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [tourSuccessRecipe, setTourSuccessRecipe] = useState(null); // Store recipe for tour success modal

  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Pre-fill URL if coming from guided tour
  useEffect(() => {
    if (shouldShowTooltip(STEPS.PASTE_URL) && !importUrl) {
      console.log('[GuidedTour] Pre-filling default recipe URL');
      setImportUrl('https://www.instagram.com/p/DGioQ5qOWij/');
    }
  }, [shouldShowTooltip, STEPS.PASTE_URL]);

  useEffect(() => {
    // Check if came from iOS Shortcut or Web Share Target with URL parameter
    const url = params.get('url');
    const text = params.get('text'); // Instagram might send URL in text param
    const title = params.get('title');

    let pollInterval;
    let timeoutId;

    // Check if this is from shortcut import push notification
    if (importing === 'true') {
      console.log('[RecipeImport] Opened from import push notification - showing loading state');

      // Set loading state to show the loading screen (handles both fresh mount and re-render)
      setLoading(true);
      setStatus('📥 Importing recipe from Instagram...');

      // Poll for new recipe every 500ms for faster detection
      let pollErrorCount = 0;
      pollInterval = setInterval(async () => {
        try {
          const token = localStorage.getItem('fridgy_token');
          if (!token) {
            clearInterval(pollInterval);
            setError('Please sign in to continue.');
            return;
          }

          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${apiUrl}/saved-recipes?limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            const latestRecipe = data.recipes?.[0];

            // Check if recipe was created in last 60 seconds
            if (latestRecipe && latestRecipe.created_at) {
              const recipeAge = Date.now() - new Date(latestRecipe.created_at).getTime();
              if (recipeAge < 60000) {
                console.log('[RecipeImport] New recipe detected!', latestRecipe.title);
                clearInterval(pollInterval);
                clearTimeout(timeoutId);
                setStatus('✅ Recipe imported successfully!');
                setError('');

                // Check if user is in guided tour
                if (isActive) {
                  console.log('[RecipeImport] User in tour - showing success celebration');
                  setTourSuccessRecipe(latestRecipe);
                  goToStep(STEPS.IMPORT_RECIPE_SUCCESS);
                } else {
                  // Normal flow - navigate to saved recipes
                  setTimeout(() => navigate('/saved-recipes'), 1500);
                }
              }
            }
          } else if (response.status === 401) {
            clearInterval(pollInterval);
            setError('Session expired. Please sign in again.');
          }
        } catch (error) {
          console.error('[RecipeImport] Polling error:', error);
          pollErrorCount++;
          // If multiple consecutive errors, stop polling and show error
          if (pollErrorCount >= 5) {
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            setError('Connection issue while checking for your recipe. Please check your internet connection and try again.');
          }
        }
      }, 500); // Poll every 500ms for faster detection

      // Stop polling after 60 seconds and show error
      timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        // Keep loading=true to stay on loading screen, but show error
        setError('Import is taking longer than expected. The recipe might still be saved - check your saved recipes, or try importing again.');
        setStatus('');
      }, 60000);
    }

    // Check both url and text parameters for Instagram links (only if not in importing mode)
    if (importing !== 'true') {
      const instagramUrl = url || text;

      if (instagramUrl && instagramUrl.includes('instagram.com')) {
        console.log('[RecipeImport] Detected Instagram URL from share/shortcut:', instagramUrl);
        setImportUrl(instagramUrl);
        setStatus('🎉 Recipe detected from Instagram!');
        // Auto-import after 1 second
        setTimeout(() => handleImport(instagramUrl), 1000);
      }

      // Check clipboard for Instagram URL (optional enhancement)
      checkClipboard();

      // Fetch Apify usage stats
      fetchApifyUsage();

      // Check if iOS user hasn't installed shortcut
      if (isIOS && !localStorage.getItem('shortcut_installed')) {
        const lastPrompt = localStorage.getItem('last_ios_prompt');
        const now = Date.now();
        // Show prompt once per week
        if (!lastPrompt || now - parseInt(lastPrompt) > 7 * 24 * 60 * 60 * 1000) {
          setShowIOSPrompt(true);
        }
      }
    }

    // Cleanup function
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location, isIOS]);

  const checkClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.includes('instagram.com') && !importUrl) {
          console.log('[RecipeImport] Found Instagram URL in clipboard:', text);
          setImportUrl(text);
          setStatus('📋 Found Instagram link in your clipboard!');
        }
      }
    } catch (err) {
      // Clipboard access denied or not available
      console.log('[RecipeImport] Clipboard access not available');
    }
  };

  const fetchApifyUsage = async () => {
    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) return;

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/apify-usage`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApifyUsage(data.usage);
        console.log('[RecipeImport] Apify usage:', data.usage);
      }
    } catch (error) {
      console.log('[RecipeImport] Could not fetch Apify usage:', error);
    }
  };

  const handleImport = async (url) => {
    // Validate URL
    const urlToImport = url || importUrl;
    if (!urlToImport || !urlToImport.includes('instagram.com')) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    // Check imported recipes limit
    const limitCheck = canAccess('imported_recipes');
    if (!limitCheck.allowed) {
      setUpgradeModal({
        isOpen: true,
        feature: 'imported recipes',
        current: limitCheck.current,
        limit: limitCheck.limit
      });
      return;
    }

    setLoading(true);
    setError('');
    setStatus('🔄 Extracting recipe from Instagram...');

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        setError('Please sign in to import recipes');
        navigate('/signin');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/import-instagram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: urlToImport,
          manualCaption: manualCaption || undefined
        })
      });

      const data = await response.json();
      console.log('[RecipeImport] Import response:', data);

      // Handle limit exceeded (backend fallback)
      if (response.status === 402 || data.error === 'LIMIT_EXCEEDED') {
        setUpgradeModal({
          isOpen: true,
          feature: 'imported recipes',
          current: data.current,
          limit: data.limit
        });
        setLoading(false);
        return;
      }

      if (data.success && data.recipe) {
        setStatus('✅ Recipe imported successfully!');
        setExtractedRecipe(data.recipe);

        // Check if user is in guided tour
        if (isActive) {
          console.log('[RecipeImport] User in tour - showing success celebration (multi-modal)');
          setTourSuccessRecipe(data.recipe);
          goToStep(STEPS.IMPORT_RECIPE_SUCCESS);
        } else {
          // Normal flow - show success for 2 seconds then redirect
          setTimeout(() => {
            navigate('/saved-recipes');
          }, 2000);
        }
      } else if (data.requiresManualCaption) {
        // Need manual caption input
        setStatus('📋 Could not fetch caption automatically. Please paste it below.');
        setShowCaptionInput(true);
        setError('');
      } else if (data.requiresManualInput) {
        setStatus('📝 Need your help to complete the recipe...');
        setExtractedRecipe(data.partialRecipe);
        setShowManualForm(true);
      } else {
        setError(data.error || 'Failed to import recipe. Please try manual entry.');
        setShowManualForm(true);
      }
    } catch (error) {
      console.error('[RecipeImport] Import error:', error);
      setError('Failed to connect to server. Please try again.');
      setShowManualForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApifyImport = async () => {
    // Validate URL
    if (!importUrl || !importUrl.includes('instagram.com')) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    // Check imported recipes limit
    const limitCheck = canAccess('imported_recipes');
    if (!limitCheck.allowed) {
      setUpgradeModal({
        isOpen: true,
        feature: 'imported recipes',
        current: limitCheck.current,
        limit: limitCheck.limit
      });
      return;
    }

    setApifyLoading(true);
    setError('');
    setStatus('🎥 Extracting recipe with video analysis...');
    setShowVideoPreview(false);
    setVideoUrl(null);

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        setError('Please sign in to import recipes');
        navigate('/signin');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/import-instagram-apify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: importUrl
        })
      });

      const data = await response.json();
      console.log('[RecipeImport] Apify import response:', data);

      // Handle limit exceeded (backend fallback)
      if (response.status === 402 || data.error === 'LIMIT_EXCEEDED') {
        setUpgradeModal({
          isOpen: true,
          feature: 'imported recipes',
          current: data.current,
          limit: data.limit
        });
        setApifyLoading(false);
        return;
      }

      if (data.success && data.recipe) {
        setStatus('✅ Recipe imported successfully with video analysis!');
        setExtractedRecipe(data.recipe);

        // Update usage stats
        if (data.usage) {
          setApifyUsage(data.usage);
        }

        // Show video preview if available
        if (data.recipe.video_url) {
          setVideoUrl(data.recipe.video_url);
          setShowVideoPreview(true);
        }

        // Show success for 2 seconds then redirect
        setTimeout(() => {
          navigate('/saved-recipes');
        }, 2000);
      } else if (data.limitExceeded) {
        setError(`Monthly limit reached (${data.usage?.used}/${data.usage?.limit}). Please use standard import.`);
        setApifyUsage(data.usage);
      } else if (data.requiresManualInput) {
        setStatus('📝 Need your help to complete the recipe...');
        setExtractedRecipe(data.partialRecipe);
        if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setShowVideoPreview(true);
        }
        setShowManualForm(true);
      } else if (data.fallbackAvailable) {
        setError(data.error || 'Premium import failed. Try standard import.');
      } else {
        setError(data.error || 'Failed to import recipe with video analysis.');
      }
    } catch (error) {
      console.error('[RecipeImport] Apify import error:', error);
      setError('Premium import service unavailable. Please try standard import.');
    } finally {
      setApifyLoading(false);
    }
  };

  const handleMultiModalImport = async () => {
    if (!importUrl) {
      setError('Please enter an Instagram URL');
      return;
    }

    setLoading(true);
    setError('');
    setExtractedRecipe(null);
    setIsTimeoutError(false);

    // Show progress message
    const progressMessages = [
      '📝 Analyzing caption text...',
      '🎥 Processing video frames...',
      '🎤 Extracting audio narration...',
      '🧠 Synthesizing all sources...'
    ];

    let messageIndex = 0;
    const progressInterval = setInterval(() => {
      if (messageIndex < progressMessages.length) {
        setError(''); // Clear error to use for status
        // Using a temporary status display
        const statusEl = document.querySelector('.recipe-import-page__error');
        if (statusEl) {
          statusEl.textContent = progressMessages[messageIndex];
          statusEl.style.color = '#4fcf61';
        }
        messageIndex++;
      }
    }, 1500);

    try {
      const token = localStorage.getItem('fridgy_token');
      if (!token) {
        clearInterval(progressInterval);
        setError('Please sign in to import recipes');
        navigate('/signin');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/recipes/multi-modal-extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: importUrl })
      });

      clearInterval(progressInterval);
      const data = await response.json();
      console.log('[MultiModal] Response data:', data); // Log the actual response to see errors

      if (data.success && data.recipe) {
        console.log('[MultiModal] Recipe extracted successfully');
        setExtractedRecipe(data.recipe);

        // Show success message
        const statusEl = document.querySelector('.recipe-import-page__error');
        if (statusEl) {
          statusEl.textContent = `✅ Recipe extracted with ${Math.round((data.confidence || 0.85) * 100)}% confidence!`;
          statusEl.style.color = '#4fcf61';
        }

        // Auto-save after 2 seconds
        setTimeout(() => {
          handleSaveExtractedRecipe(data.recipe);
        }, 2000);
      } else {
        console.error('[MultiModal] Extraction failed:', data);

        // Handle timeout errors specially
        if (data.isTimeout) {
          setError(data.error || 'Instagram is taking longer than usual. Please try again.');
          setIsTimeoutError(true);
          // Keep the URL populated for easy retry
          // The URL is already in the state, so no need to change it
        } else {
          setError(data.error || 'Failed to extract recipe. Please try again.');
          setIsTimeoutError(false);
        }
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('[MultiModal] Error:', error);
      setError('Failed to extract recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExtractedRecipe = async (recipe) => {
    try {
      const token = localStorage.getItem('fridgy_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${apiUrl}/recipes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipe: recipe,
          source_url: importUrl,
          import_method: 'multi-modal',
          confidence: 0.85
        })
      });

      if (response.ok) {
        // Mark guided tour step as complete
        if (shouldShowTooltip(STEPS.PASTE_URL)) {
          completeStep(STEPS.PASTE_URL);
          localStorage.setItem('has_imported_recipe', 'true');

          // Show success celebration before navigating
          goToStep(STEPS.RECIPE_IMPORTED);

          // Navigate after celebration (3 seconds)
          setTimeout(() => {
            navigate('/saved-recipes');
          }, 3000);
        } else {
          // Normal flow - navigate immediately
          navigate('/saved-recipes');
        }
      } else {
        setError('Failed to save recipe. Please try again.');
      }
    } catch (error) {
      console.error('[MultiModal] Save error:', error);
      setError('Failed to save recipe. Please try again.');
    }
  };

  const handleManualSave = async (recipeData) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('fridgy_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${apiUrl}/saved-recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...recipeData,
          source_type: 'instagram',
          source_url: importUrl,
          import_method: 'manual'
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('✅ Recipe saved successfully!');

        // Check if user is in guided tour
        if (isActive) {
          console.log('[RecipeImport] User in tour - showing success celebration (manual form)');
          setTourSuccessRecipe(data.recipe || recipeData);
          goToStep(STEPS.IMPORT_RECIPE_SUCCESS);
        } else {
          // Normal flow - navigate after delay
          setTimeout(() => navigate('/saved-recipes'), 1500);
        }
      } else {
        setError('Failed to save recipe. Please try again.');
      }
    } catch (error) {
      console.error('[RecipeImport] Save error:', error);
      setError('Failed to save recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show full-screen loading animation when processing
  if (loading || apifyLoading) {
    return (
      <div className="recipe-import-page__loading-screen">
        <div className="recipe-import-page__loading-content">
          <img
            src={FridgyLogo}
            alt="Fridgy"
            className={`recipe-import-page__analyzing-icon ${error ? 'recipe-import-page__analyzing-icon--error' : ''}`}
          />

          {error ? (
            // Error State
            <>
              <div className="recipe-import-page__error-icon">⚠️</div>
              <div className="recipe-import-page__loading-title">
                Import Issue
              </div>
              <div className="recipe-import-page__error-message">
                {error}
              </div>
              <div className="recipe-import-page__action-buttons">
                <button
                  className="recipe-import-page__button recipe-import-page__button--secondary"
                  onClick={() => navigate('/saved-recipes')}
                >
                  View Saved Recipes
                </button>
                <button
                  className="recipe-import-page__button recipe-import-page__button--primary"
                  onClick={() => navigate('/import')}
                >
                  Try Again
                </button>
              </div>
            </>
          ) : status && status.includes('✅') ? (
            // Success State
            <>
              <div className="recipe-import-page__success-icon">✅</div>
              <div className="recipe-import-page__loading-title">
                Recipe Imported!
              </div>
              <div className="recipe-import-page__loading-subtitle">
                Taking you to your saved recipes...
              </div>
            </>
          ) : (
            // Loading State
            <>
              <div className="recipe-import-page__loading-title">
                {status || 'Importing your recipe...'}
              </div>
              <div className="recipe-import-page__loading-subtitle">
                Fridgy is analyzing the Instagram post
              </div>
              <div className="recipe-import-page__loading-spinner"></div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-import-page">
      <div className="recipe-import-page__container">
        {/* Header */}
        <div className="recipe-import-page__header">
          <button
            className="recipe-import-page__back-button"
            onClick={() => navigate('/saved-recipes')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1>Import Recipe from Instagram</h1>
        </div>

        {/* iOS Shortcut Prompt */}
        {showIOSPrompt && isIOS && (
          <div className="recipe-import-page__ios-prompt" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowIOSPrompt(false);
                localStorage.setItem('last_ios_prompt', Date.now().toString());
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h3 style={{ marginTop: '0', marginBottom: '12px' }}>📱 Save recipes with 2 taps!</h3>
            <p style={{ marginBottom: '12px' }}>Install our iOS Shortcut to save Instagram recipes directly from the share menu.</p>
            <button
              onClick={() => {
                localStorage.setItem('last_ios_prompt', Date.now().toString());
                navigate('/shortcut-setup');
              }}
              style={{
                background: 'white',
                color: '#667eea',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Setup Quick Share →
            </button>
          </div>
        )}

        {/* Status Messages */}
        {status && !error && (
          <div className="recipe-import-page__status recipe-import-page__status--info">
            {status}
          </div>
        )}

        {error && (
          <div className="recipe-import-page__status recipe-import-page__status--error">
            {error}
            {isTimeoutError && (
              <button
                className="recipe-import-page__retry-button"
                onClick={handleMultiModalImport}
                style={{
                  display: 'block',
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#4fcf61',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Import Form */}
        {!showManualForm && (
          <div className="recipe-import-page__form">
            <div className="recipe-import-page__input-group">
              <label htmlFor="url" style={{ textAlign: 'center', display: 'block' }}>Instagram URL</label>
              <input
                id="url"
                type="url"
                placeholder="https://www.instagram.com/p/..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={loading}
                className="recipe-import-page__input"
              />
              <small className="recipe-import-page__help" style={{ textAlign: 'center', display: 'block' }}>
                Paste an Instagram post or reel URL containing a recipe
              </small>
            </div>

            {/* Manual Caption Input (shows when auto-fetch fails) */}
            {showCaptionInput && (
              <div className="recipe-import-page__input-group">
                <label htmlFor="caption">
                  Instagram Caption
                  <span className="recipe-import-page__required">*</span>
                </label>
                <textarea
                  id="caption"
                  placeholder="Please paste the recipe text/caption from the Instagram post here..."
                  value={manualCaption}
                  onChange={(e) => setManualCaption(e.target.value)}
                  disabled={loading}
                  className="recipe-import-page__input recipe-import-page__textarea"
                  rows="8"
                />
                <small className="recipe-import-page__help">
                  Copy the caption from Instagram that contains the recipe ingredients and instructions
                </small>
              </div>
            )}

            {/* Standard import button hidden - using only Apify import
            <button
              onClick={() => handleImport(importUrl)}
              disabled={loading || !importUrl || (showCaptionInput && !manualCaption)}
              className="recipe-import-page__button recipe-import-page__button--primary"
            >
              {loading ? 'Importing...' : showCaptionInput ? 'Import with Caption' : 'Import Recipe'}
            </button>
            */}

            {/* Import Button */}
            <div className="recipe-import-page__button-group">
              <button
                onClick={handleMultiModalImport}
                className="recipe-import-page__button recipe-import-page__button--primary"
                title="Import recipe from Instagram"
                disabled={loading || !importUrl}
              >
                {loading ? (
                  <span>🔄 Analyzing...</span>
                ) : (
                  <span>Import Recipe</span>
                )}
              </button>
            </div>

            {showVideoPreview && videoUrl && (
              <div className="recipe-import-page__video-preview">
                <p>📹 Video analyzed for enhanced recipe extraction</p>
                <video
                  src={videoUrl}
                  controls
                  className="recipe-import-page__video"
                  style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Manual Form (simplified for now) */}
        {showManualForm && !loading && (
          <div className="recipe-import-page__manual-form">
            <h2>Enter Recipe Details</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const recipe = {
                title: formData.get('title'),
                summary: formData.get('summary'),
                extendedIngredients: [],
                analyzedInstructions: [{
                  name: '',
                  steps: [{
                    number: 1,
                    step: formData.get('instructions')
                  }]
                }],
                readyInMinutes: parseInt(formData.get('time')) || 30,
                servings: parseInt(formData.get('servings')) || 4
              };
              handleManualSave(recipe);
            }}>
              <div className="recipe-import-page__input-group">
                <label htmlFor="title">Recipe Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={extractedRecipe?.title || ''}
                  className="recipe-import-page__input"
                />
              </div>

              <div className="recipe-import-page__input-group">
                <label htmlFor="summary">Description</label>
                <textarea
                  id="summary"
                  name="summary"
                  rows="3"
                  defaultValue={extractedRecipe?.summary || ''}
                  className="recipe-import-page__input"
                />
              </div>

              <div className="recipe-import-page__input-row">
                <div className="recipe-import-page__input-group">
                  <label htmlFor="time">Time (minutes)</label>
                  <input
                    id="time"
                    name="time"
                    type="number"
                    defaultValue={extractedRecipe?.readyInMinutes || 30}
                    className="recipe-import-page__input"
                  />
                </div>

                <div className="recipe-import-page__input-group">
                  <label htmlFor="servings">Servings</label>
                  <input
                    id="servings"
                    name="servings"
                    type="number"
                    defaultValue={extractedRecipe?.servings || 4}
                    className="recipe-import-page__input"
                  />
                </div>
              </div>

              <div className="recipe-import-page__input-group">
                <label htmlFor="instructions">Instructions</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows="6"
                  placeholder="Enter cooking instructions..."
                  className="recipe-import-page__input"
                />
              </div>

              <div className="recipe-import-page__button-group">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="recipe-import-page__button recipe-import-page__button--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="recipe-import-page__button recipe-import-page__button--primary"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
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
        />
      )}

      {/* Guided Tour Tooltips */}
      {shouldShowTooltip(STEPS.PASTE_URL) && (
        <GuidedTooltip
          targetSelector="#url"
          message="We've prepared a delicious Rosemary Gnocchi recipe for you! Just tap Import below."
          position="bottom"
          onAction={() => {
            if (importUrl) {
              document.querySelector('.recipe-import-page__button--primary')?.click();
            }
          }}
          actionLabel="Import recipe"
          highlight={true}
        />
      )}

      {/* Success Celebration Toast (Legacy) */}
      {shouldShowTooltip(STEPS.RECIPE_IMPORTED) && (
        <div className="guided-tour__success-toast">
          <div className="guided-tour__success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="guided-tour__success-title">Recipe Imported!</h2>
          <p className="guided-tour__success-text">
            You've successfully imported your first recipe. Great job!
          </p>
          <button
            className="welcome-step__button"
            onClick={() => {
              completeStep(STEPS.RECIPE_IMPORTED);
              navigate('/saved-recipes');
            }}
            style={{ width: '100%' }}
          >
            View Recipe
          </button>
        </div>
      )}

      {/* Recipe Import Success Modal - New Tour Flow */}
      {shouldShowTooltip(STEPS.IMPORT_RECIPE_SUCCESS) && (
        <RecipeImportSuccessModal
          recipe={tourSuccessRecipe}
          onViewRecipes={() => {
            console.log('[RecipeImport] Tour complete - viewing recipes');
            navigate('/saved-recipes');
          }}
        />
      )}
    </div>
  );
};

export default RecipeImportPage;