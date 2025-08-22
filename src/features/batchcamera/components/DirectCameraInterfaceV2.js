import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import SuccessModal from '../../../components/modals/SuccessModal';
import { getItemIconIcons8, formatQuantity } from '../../../assets/inventory_emojis/iconHelpers.js';
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Analysis and results states
  const [editableResults, setEditableResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ items: [], count: 0 });
  const [selectedItems, setSelectedItems] = useState(new Set());

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
        // Show confirmation page instead of saving immediately
        setShowConfirmation(true);
      } else {
        console.error('Processing failed:', data.error);
        alert('Failed to process images. Please try again.');
        // Reset camera interface after error
        await resetCameraInterface();
      }
    } catch (error) {
      console.error('Error analyzing photos:', error);
      alert('Failed to process images. Please try again.');
      // Reset camera interface after error
      await resetCameraInterface();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveItems = async (items) => {
    setIsSaving(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('fridgy_token');
      
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
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
        
        // Stop camera only when we successfully save
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          setIsCameraActive(false);
        }
        
        setSuccessData({
          items: items,
          count: itemCount
        });
        setShowSuccessModal(true);
      } else {
        console.error('Save failed:', data.error);
        alert(`Failed to save items: ${data.error}\n\nPlease try again.`);
        // Reset camera interface after save error
        await resetCameraInterface();
      }
    } catch (error) {
      console.error('Error saving items:', error);
      alert(`Failed to save items to your inventory.\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`);
      // Reset camera interface after save error
      await resetCameraInterface();
    } finally {
      setIsSaving(false);
    }
  };

  const resetCameraInterface = async () => {
    // Reset all states
    setCapturedPhotos([]);
    setEditableResults(null);
    setIsAnalyzing(false);
    setIsSaving(false);
    
    // Force restart camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    await initializeCamera();
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Reset for next batch
    setCapturedPhotos([]);
    setEditableResults(null);
    setShowConfirmation(false);
    
    // Navigate back to home
    navigate('/home');
  };

  // Editable item functions (copied from DirectCameraInterface.js)
  const updateEditableItem = (index, field, value) => {
    setEditableResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeEditableItem = (indexToRemove) => {
    setEditableResults(prev => prev.filter((_, index) => index !== indexToRemove));
    // Remove from selected items if it was selected
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(indexToRemove);
      // Adjust indices for remaining items
      const adjustedSet = new Set();
      newSet.forEach(index => {
        if (index > indexToRemove) {
          adjustedSet.add(index - 1);
        } else {
          adjustedSet.add(index);
        }
      });
      return adjustedSet;
    });
  };

  // Selection functions (copied from StreamlinedCamera.js)
  const toggleSelectAll = () => {
    if (selectedItems.size === (editableResults && editableResults.length)) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(editableResults ? editableResults.map((_, index) => index) : []));
    }
  };

  const toggleSelectItem = (index) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleConfirm = async () => {
    if (!editableResults || editableResults.length === 0) {
      alert('No items to save');
      return;
    }
    await saveItems(editableResults);
  };

  const handleBackToCamera = async () => {
    setShowConfirmation(false);
    // Reset camera interface and restart camera
    await resetCameraInterface();
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

  // Render editable results interface (copied from DirectCameraInterface.js)
  if (showConfirmation && editableResults) {
    return (
      <div className="camera-interface-v2">
        <div className="camera-v2__header">
          <button 
            className="camera-v2__back-button"
            onClick={handleBackToCamera}
            aria-label="Back to camera"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="camera-v2__title">Review Items</h1>
        </div>

        <div className="camera-v2__results-section">
          <p className="camera-v2__results-subtitle">Review the AI-detected items below. You can edit any details before saving.</p>
          
          {/* Modern Card Interface (copied from StreamlinedCamera.js) */}
          <div className="camera-v2__results-cards">
            {editableResults.map((item, index) => {
              const itemIcon = getItemIconIcons8(item.category, item.name, { size: 28 });
              const formattedQuantity = formatQuantity(item.quantity);
              
              return (
                <div key={index} className="camera-v2__inventory-card">
                  {/* Left: Emoji icon */}
                  <div className="camera-v2__card-icon">
                    {itemIcon}
                  </div>
                  
                  {/* Middle: Content */}
                  <div className="camera-v2__card-content">
                    {/* Top: Item name (editable) with remove button */}
                    <div className="camera-v2__card-name-row">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateEditableItem(index, 'name', e.target.value)}
                        className="camera-v2__card-item-name-input"
                        placeholder="Item name"
                      />
                      <button 
                        onClick={() => removeEditableItem(index)}
                        className="camera-v2__card-remove-btn"
                        title="Remove this item"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Bottom: Details row with quantity and category (editable) */}
                    <div className="camera-v2__card-details-row">
                      <div className="camera-v2__card-detail-group">
                        <span className="camera-v2__card-label">Qty:</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateEditableItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="camera-v2__card-quantity-input"
                          min="1"
                          max="99"
                        />
                      </div>
                      <div className="camera-v2__card-detail-group">
                        <select 
                          value={item.category} 
                          onChange={(e) => updateEditableItem(index, 'category', e.target.value)}
                          className="camera-v2__card-category-select"
                        >
                          <option value="Fruits">Fruits</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Protein">Protein</option>
                          <option value="Grains">Grains</option>
                          <option value="Fats and oils">Fats and oils</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Expiry date row */}
                    <div className="camera-v2__card-expiry-row">
                      <span className="camera-v2__card-label">Expires:</span>
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => updateEditableItem(index, 'expiryDate', e.target.value)}
                        className="camera-v2__card-date-input"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Save Actions */}
          <div className="camera-v2__save-actions">
            <button 
              onClick={handleConfirm} 
              disabled={isSaving || editableResults.length === 0}
              className="camera-v2__save-btn"
            >
              {isSaving ? 'Saving...' : `✓ Add ${editableResults.length} Item${editableResults.length !== 1 ? 's' : ''} to Inventory`}
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

      {/* Instructions Section */}
      <div className="camera-v2__instructions">
        <ul className="camera-v2__instruction-list">
          <li className="camera-v2__instruction-item">
            <div className="camera-v2__instruction-number">1</div>
            <p className="camera-v2__instruction-text">
              Point the camera to the food item and capture the front.
            </p>
          </li>
          <li className="camera-v2__instruction-item">
            <div className="camera-v2__instruction-number">2</div>
            <p className="camera-v2__instruction-text">
              Find the expiry date and capture for a more accurate log.
            </p>
          </li>
        </ul>
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