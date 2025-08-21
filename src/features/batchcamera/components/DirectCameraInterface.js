import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import SuccessModal from '../../../components/modals/SuccessModal';
import './DirectCameraInterface.css';

const DirectCameraInterface = ({ onComplete }) => {
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
  
  // Analysis and results states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
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

  const handleAnalyzePhotos = async () => {
    if (capturedPhotos.length === 0) {
      alert('Please take at least one photo');
      return;
    }

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
        setShowResults(true);
        // Stop camera when showing results
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          setIsCameraActive(false);
        }
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

  const updateEditableItem = (index, field, value) => {
    setEditableResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeEditableItem = (indexToRemove) => {
    setEditableResults(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleConfirm = async () => {
    if (!editableResults || editableResults.length === 0) {
      alert('No items to save');
      return;
    }

    setIsSaving(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: editableResults.map(item => ({
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
        const itemCount = data.savedItems ? data.savedItems.length : editableResults.length;
        
        setSuccessData({
          items: editableResults,
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
    setShowResults(false);
    
    // Navigate back to home
    navigate('/home');
  };

  // If showing results, render the editing interface
  if (showResults && editableResults) {
    return (
      <div className="direct-camera-interface">
        <div className="camera-header">
          <button 
            className="back-button"
            onClick={() => setShowResults(false)}
            aria-label="Back to camera"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="camera-title">Review Items</h1>
        </div>

        <div className="results-section">
          <p className="results-subtitle">Review the AI-detected items below. You can edit any details before saving.</p>
          
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editableResults.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select 
                        value={item.category} 
                        onChange={(e) => updateEditableItem(index, 'category', e.target.value)}
                        className="editable-select"
                      >
                        <option value="Fruits">Fruits</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Protein">Protein</option>
                        <option value="Grains">Grains</option>
                        <option value="Fats and Oils">Fats and Oils</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateEditableItem(index, 'name', e.target.value)}
                        className="editable-input"
                        placeholder="Item name"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateEditableItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="editable-input quantity-input"
                        min="1"
                        max="99"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => updateEditableItem(index, 'expiryDate', e.target.value)}
                        className="editable-input date-input"
                      />
                    </td>
                    <td>
                      <button 
                        onClick={() => removeEditableItem(index)}
                        className="remove-item-btn"
                        title="Remove this item"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="results-actions">
            <div className="items-count">
              {editableResults.length} item{editableResults.length !== 1 ? 's' : ''} ready to save
            </div>
            <button 
              onClick={handleConfirm} 
              disabled={isSaving || editableResults.length === 0}
              className="confirm-btn"
            >
              {isSaving ? '💾 Saving...' : `✔️ Save ${editableResults.length} Item${editableResults.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          savedItems={successData.items}
          itemCount={successData.count}
        />
      </div>
    );
  }

  // Main camera interface
  return (
    <div className="direct-camera-interface">
      {/* Header */}
      <div className="camera-header">
        <button 
          className="back-button"
          onClick={handleBackNavigation}
          aria-label="Back to home"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="camera-title">Add to Fridge</h1>
      </div>

      {/* Camera Viewfinder */}
      <div className="camera-container">
        {permissionDenied || cameraError ? (
          <div className="camera-error">
            <div className="error-icon">📷</div>
            <p className="error-message">{cameraError}</p>
            {permissionDenied && (
              <button 
                onClick={initializeCamera}
                className="retry-button"
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
            className="camera-video"
          />
        )}
      </div>

      {/* White space with instructions */}
      <div className="camera-instructions">
        <p className="instruction-text">
          1. Point at food item & capture the whole object<br/>
          2. Capture expiry date
        </p>
      </div>

      {/* Capture Button */}
      {isCameraActive && (
        <div className="capture-controls">
          <button 
            className="capture-button"
            onClick={capturePhoto}
            aria-label="Capture photo"
          >
            <div className="capture-button-inner"></div>
          </button>
        </div>
      )}

      {/* Captured Photos Gallery */}
      {capturedPhotos.length > 0 && (
        <div className="photos-gallery">
          <div className="photos-header">
            <span className="photos-count">{capturedPhotos.length} photo{capturedPhotos.length !== 1 ? 's' : ''} captured</span>
          </div>
          <div className="photos-row">
            {capturedPhotos.map((photo, index) => (
              <div key={index} className="photo-thumbnail">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Captured ${index + 1}`}
                  className="thumbnail-image"
                />
                <button 
                  className="remove-photo-btn"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          {/* Analyze Button */}
          <div className="analyze-controls">
            <button 
              onClick={handleAnalyzePhotos}
              disabled={isAnalyzing}
              className="analyze-button"
            >
              {isAnalyzing 
                ? '🔄 Analyzing...' 
                : `Analyze ${capturedPhotos.length} Photo${capturedPhotos.length > 1 ? 's' : ''}`
              }
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default DirectCameraInterface;