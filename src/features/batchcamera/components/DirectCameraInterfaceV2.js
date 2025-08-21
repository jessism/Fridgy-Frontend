import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import SuccessModal from '../../../components/modals/SuccessModal';
import './DirectCameraInterfaceV2.css';

const DirectCameraInterfaceV2 = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // Camera and photo states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // New V2 states
  const [editMode, setEditMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Analysis and results states
  const [editableResults, setEditableResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ items: [], count: 0 });

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
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
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
    navigate('/home');
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleCloseEditMode = () => {
    setEditMode(false);
  };

  const handleDone = async () => {
    if (capturedPhotos.length === 0) {
      alert('Please take at least one photo');
      return;
    }

    // Immediately start analysis
    await handleAnalyzePhotos();
  };

  const handleAnalyzePhotos = async () => {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      capturedPhotos.forEach((file) => {
        formData.append('images', file);
      });

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/process-images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setEditableResults(data.items.map(item => ({ ...item })));
        // Stop camera when showing results
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          setIsCameraActive(false);
        }
        // Proceed to save items immediately
        await saveItems(data.items);
      } else {
        console.error('Processing failed:', data.error);
        alert('Failed to process images. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing photos:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveItems = async (items) => {
    setIsSaving(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            item_name: item.name,
            quantity: item.quantity,
            category: item.category,
            expiration_date: item.expiryDate,
            user_id: user.id
          }))
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const itemCount = data.savedItems ? data.savedItems.length : items.length;
        
        setSuccessData({
          items: items,
          count: itemCount
        });
        setShowSuccessModal(true);
      } else {
        console.error('Save failed:', data.error);
        alert(`Failed to save items: ${data.error}\n\nPlease try again.`);
      }
    } catch (error) {
      console.error('Error saving items:', error);
      alert(`Failed to save items to your inventory.\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Reset for next batch
    setCapturedPhotos([]);
    setEditableResults(null);
    
    // Navigate back to home
    navigate('/home');
  };

  // Render analyzing overlay
  if (isAnalyzing) {
    return (
      <div className="camera-interface-v2">
        <div className="camera-v2__analyzing">
          <div className="camera-v2__analyzing-icon">🔄</div>
          <div className="camera-v2__analyzing-text">Analyzing Photos...</div>
          <div className="camera-v2__analyzing-subtext">
            AI is identifying food items and expiration dates
          </div>
        </div>
      </div>
    );
  }

  // Render edit mode overlay
  if (editMode) {
    return (
      <div className="camera-interface-v2">
        <div className="camera-v2__edit-overlay">
          <div className="camera-v2__edit-header">
            <h2 className="camera-v2__edit-title">
              {capturedPhotos.length} Photo{capturedPhotos.length !== 1 ? 's' : ''}
            </h2>
            <button 
              className="camera-v2__edit-close"
              onClick={handleCloseEditMode}
              aria-label="Close edit mode"
            >
              ✕
            </button>
          </div>
          
          <div className="camera-v2__photo-grid">
            {capturedPhotos.map((photo, index) => (
              <div key={index} className="camera-v2__photo-item">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="camera-v2__photo-item-image"
                />
                <div className="camera-v2__photo-item-number">
                  {index + 1}
                </div>
                <button 
                  className="camera-v2__photo-delete"
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
            className="camera-v2__edit-done"
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
    <div className="camera-interface-v2">
      {/* Header */}
      <div className="camera-v2__header">
        <button 
          className="camera-v2__back-button"
          onClick={handleBackNavigation}
          aria-label="Back to home"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="camera-v2__title">Add to Fridge</h1>
      </div>

      {/* Camera Container */}
      <div className="camera-v2__container">
        {permissionDenied || cameraError ? (
          <div className="camera-v2__error">
            <div className="camera-v2__error-icon">📷</div>
            <p className="camera-v2__error-message">{cameraError}</p>
            {permissionDenied && (
              <button 
                onClick={initializeCamera}
                className="camera-v2__retry-button"
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
            className="camera-v2__video"
          />
        )}

        {/* Photo Thumbnail Stack */}
        {capturedPhotos.length > 0 && (
          <div className="camera-v2__thumbnail-stack">
            <div className="camera-v2__thumbnail">
              <img
                src={URL.createObjectURL(capturedPhotos[capturedPhotos.length - 1])}
                alt={`Photo ${capturedPhotos.length}`}
                className="camera-v2__thumbnail-image"
              />
              <div className="camera-v2__thumbnail-number">
                {capturedPhotos.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="camera-v2__controls">
        <button 
          className="camera-v2__control-button"
          onClick={handleEditMode}
          disabled={capturedPhotos.length === 0}
        >
          Edit
        </button>

        {isCameraActive && (
          <button 
            className="camera-v2__capture-button"
            onClick={capturePhoto}
            aria-label="Capture photo"
          >
            <div className="camera-v2__capture-button-inner"></div>
          </button>
        )}

        <button 
          className="camera-v2__control-button camera-v2__done-button"
          onClick={handleDone}
          disabled={capturedPhotos.length === 0 || isAnalyzing}
        >
          Done
        </button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        savedItems={successData.items}
        itemCount={successData.count}
      />
    </div>
  );
};

export default DirectCameraInterfaceV2;