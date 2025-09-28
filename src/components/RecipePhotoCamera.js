import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RecipePhotoCamera.css';

const RecipePhotoCamera = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');

  // Get return path from navigation state
  const returnPath = location.state?.returnPath || '/recipes/manual';

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeCamera = async () => {
    setIsLoading(true);
    try {
      // First try with facingMode
      let constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // If facingMode fails (common on laptops), try without it
        console.log('Facingmode failed, trying without it');
        constraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Add event listener to ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsCameraActive(true);
            setIsLoading(false);
          }).catch(err => {
            console.error('Error playing video:', err);
            setIsCameraActive(true);
            setIsLoading(false);
          });
        };
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
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application.');
      } else {
        setCameraError('Unable to access camera. Please check your device settings.');
      }
      setIsCameraActive(false);
      setIsLoading(false);
    }
  };

  const switchCamera = async () => {
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Toggle facing mode
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);

    // Reinitialize with new facing mode
    try {
      let constraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // If facingMode fails, try getting any available camera
        console.log('Switch camera with facingMode failed, trying default camera');
        constraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      // Fall back to reinitialize
      initializeCamera();
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

    // Convert canvas to blob and navigate back with image
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);

        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Navigate back with image data
        navigate(returnPath, {
          state: {
            capturedImage: imageUrl,
            imageBlob: blob
          }
        });
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCancel = () => {
    // Stop camera stream before navigating
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate(returnPath);
  };

  // Render error states
  if (permissionDenied) {
    return (
      <div className="recipe-camera">
        <div className="recipe-camera__error-container">
          <div className="recipe-camera__error-message">
            <h2>Camera Permission Required</h2>
            <p>{cameraError}</p>
            <button
              className="recipe-camera__error-button"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            <button
              className="recipe-camera__error-button recipe-camera__error-button--secondary"
              onClick={handleCancel}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cameraError && !permissionDenied) {
    return (
      <div className="recipe-camera">
        <div className="recipe-camera__error-container">
          <div className="recipe-camera__error-message">
            <h2>Camera Error</h2>
            <p>{cameraError}</p>
            <button
              className="recipe-camera__error-button"
              onClick={handleCancel}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main camera interface
  return (
    <div className="recipe-camera">
      {/* Top Header */}
      <div className="recipe-camera__header">
        <button
          className="recipe-camera__back-button"
          onClick={handleCancel}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="recipe-camera__title">Take Photo</h1>
        <div className="recipe-camera__header-spacer"></div>
      </div>

      {/* Camera View */}
      <div className="recipe-camera__viewport">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="recipe-camera__video"
          style={{ display: isCameraActive ? 'block' : 'none' }}
        />
        {isLoading && (
          <div className="recipe-camera__loading">
            <div className="recipe-camera__spinner"></div>
            <p>Initializing camera...</p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="recipe-camera__controls">
        <button
          className="recipe-camera__control-button"
          onClick={handleCancel}
        >
          Cancel
        </button>

        {isCameraActive && (
          <button
            className="recipe-camera__capture-button"
            onClick={capturePhoto}
            aria-label="Capture photo"
          >
            <div className="recipe-camera__capture-button-inner"></div>
          </button>
        )}

        <button
          className="recipe-camera__control-button"
          onClick={switchCamera}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16 3L19 6L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 6H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 21L5 18L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 18H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RecipePhotoCamera;