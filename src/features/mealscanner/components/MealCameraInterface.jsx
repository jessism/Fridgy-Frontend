import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MealTypeSelector from './MealTypeSelector';
import '../styles/MealScanner.css';

const MealCameraInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [isDineOutMode, setIsDineOutMode] = useState(false);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Stop camera after capture
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
    startCamera();
  };

  const analyzeMeal = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'meal.jpg');

      // Get auth token
      const token = localStorage.getItem('fridgy_token');
      
      // Send to backend for AI analysis
      const apiResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/meals/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await apiResponse.json();

      if (data.success && data.ingredients) {
        // Navigate to ingredient selector with detected ingredients, image URL, meal name, and context from meal history
        navigate('/mealscanner/ingredients', { 
          state: { 
            ingredients: data.ingredients,
            mealImage: capturedImage,  // Keep for display purposes
            imageUrl: data.imageUrl,   // Storage URL for saving
            mealName: data.meal_name,  // AI-generated meal name
            mealType: location.state?.mealType,  // Pass through meal type from meal history
            targetDate: location.state?.targetDate,  // Pass through target date from meal history
            returnTo: location.state?.returnTo,  // Pass through return navigation
            returnDate: location.state?.returnDate  // Pass through return date
          } 
        });
      } else {
        throw new Error(data.error || 'Failed to analyze meal');
      }
    } catch (err) {
      console.error('Error analyzing meal:', err);
      setError('Failed to analyze meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    navigate(-1);
  };

  const handleDineOut = () => {
    setIsDineOutMode(true);
    setShowMealTypeModal(true);
  };

  const handleMealTypeSelect = async (mealType) => {
    setShowMealTypeModal(false);

    if (!isDineOutMode) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'meal.jpg');
      formData.append('mealType', mealType);

      // Get auth token
      const token = localStorage.getItem('fridgy_token');

      // Send to backend for dine-out meal logging
      const apiResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/meals/dine-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await apiResponse.json();

      if (data.success) {
        // Navigate back with success message
        navigate(-1, {
          state: {
            message: 'Meal successfully logged!',
            returnDate: location.state?.targetDate || new Date().toISOString()
          }
        });
      } else {
        throw new Error(data.error || 'Failed to log dine-out meal');
      }
    } catch (err) {
      console.error('Error logging dine-out meal:', err);
      setError('Failed to log meal. Please try again.');
    } finally {
      setIsLoading(false);
      setIsDineOutMode(false);
    }
  };

  return (
    <div className="meal-camera-interface">
      {/* Header */}
      <div className="meal-camera-header">
        <button className="meal-camera-back-button" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="meal-camera-title">Scan Your Meal</h1>
      </div>

      {/* Camera Container */}
      <div className="meal-camera-container">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="meal-camera-video"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        ) : (
          <div className="meal-camera-preview">
            <img src={capturedImage} alt="Captured meal" />
          </div>
        )}

        {error && (
          <div className="meal-camera-error">
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="meal-camera-controls">
        {!capturedImage ? (
          <>
            <button 
              className="meal-camera-control-button"
              disabled
            >
              Edit
            </button>

            <button 
              className="meal-camera-capture-button"
              onClick={capturePhoto}
            >
              <div className="meal-camera-capture-button-inner"></div>
            </button>

            <button 
              className="meal-camera-control-button meal-camera-done-button"
              disabled
            >
              Done
            </button>
          </>
        ) : (
          <div className="meal-camera-actions">
            <button
              className="meal-camera-action-btn secondary"
              onClick={retakePhoto}
              disabled={isLoading}
            >
              Retake
            </button>
            <button
              className="meal-camera-action-btn primary"
              onClick={analyzeMeal}
              disabled={isLoading}
            >
              {isLoading && !isDineOutMode ? (
                <>
                  <span className="meal-camera-spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Eat in'
              )}
            </button>
            <button
              className="meal-camera-action-btn dine-out"
              onClick={handleDineOut}
              disabled={isLoading}
            >
              {isLoading && isDineOutMode ? (
                <>
                  <span className="meal-camera-spinner"></span>
                  Logging...
                </>
              ) : (
                'Dine out'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Meal Type Modal */}
      <MealTypeSelector
        isOpen={showMealTypeModal}
        onClose={() => {
          setShowMealTypeModal(false);
          setIsDineOutMode(false);
        }}
        onSelectMealType={handleMealTypeSelect}
      />
    </div>
  );
};

export default MealCameraInterface;