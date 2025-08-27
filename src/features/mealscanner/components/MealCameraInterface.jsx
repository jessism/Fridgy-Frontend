import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
        // Navigate to ingredient selector with detected ingredients, image URL, and context from meal history
        navigate('/mealscanner/ingredients', { 
          state: { 
            ingredients: data.ingredients,
            mealImage: capturedImage,  // Keep for display purposes
            imageUrl: data.imageUrl,   // Storage URL for saving
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

  return (
    <div className="meal-camera-interface">
      {/* Header */}
      <div className="meal-camera-header">
        <button className="meal-camera-close" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h2 className="meal-camera-title">Scan Your Meal</h2>
        <div className="meal-camera-spacer"></div>
      </div>

      {/* Camera View */}
      <div className="meal-camera-view">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="meal-camera-video"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Camera Overlay */}
            <div className="meal-camera-overlay">
              <div className="meal-camera-guide">
                <div className="meal-camera-corner top-left"></div>
                <div className="meal-camera-corner top-right"></div>
                <div className="meal-camera-corner bottom-left"></div>
                <div className="meal-camera-corner bottom-right"></div>
              </div>
            </div>
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

      {/* Controls */}
      <div className="meal-camera-controls">
        {!capturedImage ? (
          <>
            <div className="meal-camera-hint">
              Position your meal within the frame
            </div>
            <button 
              className="meal-camera-capture"
              onClick={capturePhoto}
            >
              <div className="meal-camera-capture-inner"></div>
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
              {isLoading ? (
                <>
                  <span className="meal-camera-spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze Meal'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCameraInterface;