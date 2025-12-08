import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import RecipeDetailModal from '../../../components/modals/RecipeDetailModal';
import { safeJSONStringify } from '../../../utils/jsonSanitizer';
import FridgyLogo from '../../../assets/images/Logo.png';
import './RecipeScannerCamera.css';

const RecipeScannerCamera = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Check if coming from cookbook flow
  const cookbookId = location.state?.cookbookId;
  const cookbookName = location.state?.cookbookName;

  // Camera and photo states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // New V2 states
  const [editMode, setEditMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRecipePreview, setShowRecipePreview] = useState(false);

  // Recipe results states
  const [extractedRecipe, setExtractedRecipe] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Reconnect video stream when returning from edit mode
  useEffect(() => {
    if (!editMode && videoRef.current && streamRef.current && isCameraActive) {
      // Reconnect the stream to the video element
      videoRef.current.srcObject = streamRef.current;
    }
  }, [editMode, isCameraActive]);

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setPermissionDenied(false);
        setCameraError('');
      }
    } catch (error) {
      console.error('Camera access error:', error);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setCameraError('Camera permission denied. Please allow camera access and refresh the page.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Unable to access camera. Please check your device settings.');
      }
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `recipe-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedPhotos(prev => [...prev, file]);
      }
    }, 'image/jpeg', 0.8); // 80% quality
  };

  const removePhoto = (indexToRemove) => {
    setCapturedPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleBackNavigation = () => {
    // Stop camera stream before navigating
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleCloseEditMode = async () => {
    setEditMode(false);
    // If camera wasn't active or stream is lost, reinitialize
    if (!isCameraActive || !streamRef.current) {
      await initializeCamera();
    }
    // The useEffect will handle reconnecting the stream to video element
  };

  const handleDone = async () => {
    if (capturedPhotos.length === 0) {
      alert('Please take at least one photo of the recipe');
      return;
    }

    // Immediately start analysis
    await handleAnalyzeRecipe();
  };

  const handleAnalyzeRecipe = async () => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      capturedPhotos.forEach((file) => {
        formData.append('images', file);
      });

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('fridgy_token');

      const response = await fetch(`${API_BASE_URL}/scan-recipe`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      console.log('[RecipeScanner] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RecipeScanner] Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('[RecipeScanner] Response data:', data);

      if (data.success && data.recipe) {
        setExtractedRecipe(data.recipe);
        setShowRecipePreview(true);
      } else {
        console.error('Recipe extraction failed:', data.error);
        alert('Failed to extract recipe. Please try again with clearer photos.');
        // Reset camera interface after error
        await resetCameraInterface();
      }
    } catch (error) {
      console.error('[RecipeScanner] Error analyzing recipe:', error);
      console.error('[RecipeScanner] Full error:', error.message);

      // More specific error messages
      if (error.message.includes('401')) {
        alert('Authentication required. Please log in and try again.');
      } else if (error.message.includes('500')) {
        alert('Server error while processing recipe. Please check the backend logs.');
      } else {
        alert(`Failed to process recipe: ${error.message}`);
      }

      // Reset camera interface after error
      await resetCameraInterface();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to add recipe to cookbook
  const addRecipeToCookbook = async (recipeId) => {
    if (!cookbookId || !recipeId) return;
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('fridgy_token');
      await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}/recipes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipes: [{ recipe_id: recipeId, recipe_source: 'saved' }]
        })
      });
      console.log('[RecipeScanner] Recipe added to cookbook:', cookbookId);
    } catch (error) {
      console.error('[RecipeScanner] Failed to add recipe to cookbook:', error);
    }
  };

  const saveRecipe = async () => {
    if (!extractedRecipe) return;

    setIsSaving(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('fridgy_token');

      // Prepare recipe data for saving
      const recipeData = {
        ...extractedRecipe,
        source_type: 'scanned'
      };

      const response = await fetch(`${API_BASE_URL}/saved-recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: safeJSONStringify(recipeData),
      });

      const data = await response.json();

      if (data.success) {
        // Add to cookbook if coming from cookbook flow
        if (cookbookId && data.recipe?.id) {
          console.log('[RecipeScanner] Adding scanned recipe to cookbook:', cookbookId);
          await addRecipeToCookbook(data.recipe.id);
        }

        // Stop camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          setIsCameraActive(false);
        }

        // Navigate to saved recipes (or cookbook view if from cookbook flow)
        navigate(cookbookId ? '/meal-plans/recipes' : '/saved-recipes', {
          state: cookbookId ? { openCookbook: cookbookId, message: `Recipe added to "${cookbookName}"` } : undefined
        });
      } else {
        console.error('Save failed:', data.error);
        alert('Failed to save recipe. Please try again.');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetCameraInterface = async () => {
    // Reset all states
    setCapturedPhotos([]);
    setExtractedRecipe(null);
    setIsAnalyzing(false);
    setIsSaving(false);
    setShowRecipePreview(false);

    // Force restart camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    await initializeCamera();
  };

  const handleRecipeModalClose = () => {
    setShowRecipePreview(false);
    // Reset and go back to camera
    resetCameraInterface();
  };

  // Render analyzing overlay
  if (isAnalyzing) {
    return (
      <div className="recipe-scanner-camera">
        <div className="recipe-scanner__analyzing">
          <img
            src={FridgyLogo}
            alt="Fridgy"
            className="recipe-scanner__analyzing-icon"
          />
          <div className="recipe-scanner__analyzing-text">Analyzing Recipe...</div>
          <div className="recipe-scanner__analyzing-subtext">
            Extracting ingredients and instructions from your photos
          </div>
        </div>
      </div>
    );
  }

  // Render edit mode overlay
  if (editMode) {
    return (
      <div className="recipe-scanner-camera">
        <div className="recipe-scanner__edit-overlay">
          <div className="recipe-scanner__edit-header">
            <h2 className="recipe-scanner__edit-title">
              {capturedPhotos.length} Photo{capturedPhotos.length !== 1 ? 's' : ''}
            </h2>
            <button
              className="recipe-scanner__edit-close"
              onClick={handleCloseEditMode}
              aria-label="Close edit mode"
            >
              ✕
            </button>
          </div>

          <div className="recipe-scanner__photo-grid">
            {capturedPhotos.map((photo, index) => (
              <div key={index} className="recipe-scanner__photo-item">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Recipe page ${index + 1}`}
                  className="recipe-scanner__photo-item-image"
                />
                <div className="recipe-scanner__photo-item-number">
                  {index + 1}
                </div>
                <button
                  className="recipe-scanner__photo-delete"
                  onClick={() => removePhoto(index)}
                  aria-label={`Delete photo ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Floating Done Button */}
          <button
            className="recipe-scanner__edit-done"
            onClick={handleCloseEditMode}
            aria-label="Finish editing"
          >
            ✓
          </button>
        </div>
      </div>
    );
  }

  // Main camera interface
  return (
    <div className="recipe-scanner-camera">
      {/* Header */}
      <div className="recipe-scanner__header">
        <button
          className="recipe-scanner__back-button"
          onClick={handleBackNavigation}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="recipe-scanner__title">Scan Recipe</h1>
      </div>

      {/* Camera Container */}
      <div className="recipe-scanner__container">
        {permissionDenied || cameraError ? (
          <div className="recipe-scanner__error">
            <div className="recipe-scanner__error-icon">📷</div>
            <p className="recipe-scanner__error-message">{cameraError}</p>
            {permissionDenied && (
              <button
                onClick={initializeCamera}
                className="recipe-scanner__retry-button"
              >
                Try Again
              </button>
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="recipe-scanner__video"
          />
        )}

        {/* Photo Thumbnail Stack */}
        {capturedPhotos.length > 0 && (
          <div className="recipe-scanner__thumbnail-stack">
            <div className="recipe-scanner__thumbnail">
              <img
                src={URL.createObjectURL(capturedPhotos[capturedPhotos.length - 1])}
                alt={`Photo ${capturedPhotos.length}`}
                className="recipe-scanner__thumbnail-image"
              />
              <div className="recipe-scanner__thumbnail-number">
                {capturedPhotos.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="recipe-scanner__controls">
        <button
          className="recipe-scanner__control-button"
          onClick={handleEditMode}
          disabled={capturedPhotos.length === 0}
        >
          Edit
        </button>

        {isCameraActive && (
          <button
            className="recipe-scanner__capture-button"
            onClick={capturePhoto}
            aria-label="Capture photo"
          >
            <div className="recipe-scanner__capture-button-inner"></div>
          </button>
        )}

        <button
          className="recipe-scanner__control-button recipe-scanner__done-button"
          onClick={handleDone}
          disabled={capturedPhotos.length === 0 || isAnalyzing}
        >
          Done
        </button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Recipe Preview Modal */}
      {showRecipePreview && extractedRecipe && (
        <RecipeDetailModal
          isOpen={showRecipePreview}
          recipe={extractedRecipe}
          onClose={handleRecipeModalClose}
          onCookNow={saveRecipe}
          isLoading={isSaving}
          customActionLabel="Save Recipe"
        />
      )}
    </div>
  );
};

export default RecipeScannerCamera;