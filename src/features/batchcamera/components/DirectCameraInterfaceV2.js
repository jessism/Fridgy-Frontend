import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useGuidedTourContext } from '../../../contexts/GuidedTourContext';
import GuidedTooltip from '../../../components/guided-tour/GuidedTooltip';
import '../../../components/guided-tour/GuidedTour.css';
import SuccessModal from '../../../components/modals/SuccessModal';
import { getItemIconIcons8, formatQuantity } from '../../../assets/inventory_emojis/iconHelpers.js';
import IngredientImage from '../../../components/IngredientImage';
import { safeJSONStringify } from '../../../utils/jsonSanitizer';
import FridgyLogo from '../../../assets/images/Logo.png';
import './DirectCameraInterfaceV2.css';

const DirectCameraInterfaceV2 = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shouldShowTooltip, goToStep, STEPS, currentStep, isActive, addDemoInventoryItems } = useGuidedTourContext();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Category color helper - matches InventoryPage colors
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Fruits': { bg: '#fff5e6', text: '#8b6914' },
      'Vegetables': { bg: '#f0f9f0', text: '#4a6741' },
      'Protein': { bg: '#fff0f0', text: '#8b4561' },
      'Dairy': { bg: '#e6f3ff', text: '#4a6b8b' },
      'Grains': { bg: '#fff7e6', text: '#8b6332' },
      'Fats and oils': { bg: '#fffde7', text: '#827717' },
      'Beverages': { bg: '#ffe8cc', text: '#cc6600' },
      'Seasonings': { bg: '#e0f2f1', text: '#2e7d6e' },
      'Other': { bg: '#f5f5f5', text: '#666666' }
    };
    return categoryColors[category] || categoryColors['Other'];
  };
  
  // Camera and photo states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCameraTooltip, setShowCameraTooltip] = useState(false);
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

  // Demo mode detection - active during "Log Your Groceries" tour
  const isDemoMode = isActive && (
    shouldShowTooltip(STEPS.ADD_GROCERIES) ||
    shouldShowTooltip(STEPS.ADD_ITEMS_MENU) ||
    shouldShowTooltip(STEPS.ITEMS_ADDED) ||
    shouldShowTooltip(STEPS.GO_TO_MEALS) ||              // Keep demo mode during celebration
    shouldShowTooltip(STEPS.VIEWING_INVENTORY) ||        // Keep demo mode while viewing items
    shouldShowTooltip(STEPS.PUSH_NOTIFICATION_PROMPT)    // Keep demo mode during tour end
  );

  // Demo mode: Track which item to show (0-3 for 4 items)
  const [demoItemIndex, setDemoItemIndex] = useState(0);

  // Helper: Calculate date N days from now in YYYY-MM-DD format
  const getDateDaysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // Demo items configuration - 4 unique items, 4 photos
  const demoItems = [
    {
      emoji: '🍗',
      name: 'Chicken Breast',
      expiry: '7 days',
      item: 'Chicken Breast',
      category: 'Protein',
      quantity: 1,
      total_weight_oz: 16,
      expires: getDateDaysFromNow(7),
      expiryDate: getDateDaysFromNow(7),
      uniqueItemId: 'item-1',
      showExpiry: true,
      imageUrl: require('../../../assets/images/mock-inventories/chicken breast.png')
    },
    {
      emoji: '🥦',
      name: 'Broccoli',
      expiry: '5 days',
      item: 'Broccoli',
      category: 'Vegetables',
      quantity: 1,
      total_weight_oz: 8,
      expires: getDateDaysFromNow(5),
      expiryDate: getDateDaysFromNow(5),
      uniqueItemId: 'item-2',
      showExpiry: true,
      imageUrl: require('../../../assets/images/mock-inventories/Brocolli.png')
    },
    {
      emoji: '🥚',
      name: 'Eggs',
      expiry: '14 days',
      item: 'Eggs',
      category: 'Protein',
      quantity: 3,
      total_weight_oz: 12,
      expires: getDateDaysFromNow(14),
      expiryDate: getDateDaysFromNow(14),
      uniqueItemId: 'item-3',
      showExpiry: true,
      imageUrl: require('../../../assets/images/mock-inventories/eggs.png')
    },
    {
      emoji: '🌿',
      name: 'Asparagus',
      expiry: '4 days',
      item: 'Asparagus',
      category: 'Vegetables',
      quantity: 1,
      total_weight_oz: 6,
      expires: getDateDaysFromNow(4),
      expiryDate: getDateDaysFromNow(4),
      uniqueItemId: 'item-4',
      showExpiry: true,
      imageUrl: require('../../../assets/images/mock-inventories/Asparagus.png')
    }
  ];

  // Reset demo index when entering demo mode
  useEffect(() => {
    if (isDemoMode && capturedPhotos.length === 0) {
      console.log('[Camera] Entering demo mode - resetting demo index');
      setDemoItemIndex(0);
    }
  }, [isDemoMode, capturedPhotos.length]);

  // Debug: Log guided tour state when in edit mode
  useEffect(() => {
    console.log('[Camera] Mode changed:', {
      editMode,
      isCameraActive,
      hasResults: !!editableResults,
      photoCount: capturedPhotos.length,
      currentStep,
      shouldShowItemsAdded: shouldShowTooltip(STEPS.ITEMS_ADDED)
    });
  }, [editMode, isCameraActive, editableResults, capturedPhotos, currentStep, shouldShowTooltip, STEPS]);

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

  // Show camera tooltip after camera loads + 1 second delay
  useEffect(() => {
    if (isCameraActive && isDemoMode && capturedPhotos.length === 0) {
      const timer = setTimeout(() => {
        console.log('[Camera] Camera active + 1s delay - showing tooltip');
        setShowCameraTooltip(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowCameraTooltip(false);
    }
  }, [isCameraActive, isDemoMode, capturedPhotos.length]);

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

  const capturePhoto = async () => {
    // Demo mode: Use fake photo without camera
    if (isDemoMode) {
      const currentItem = demoItems[demoItemIndex];
      console.log('[Camera] Demo mode: Capturing item', currentItem.name);

      // Create a simple demo photo with item emoji
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      // Fill with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 640, 480);
      gradient.addColorStop(0, '#f5f5f5');
      gradient.addColorStop(1, '#e8e8e8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 480);

      // Draw the emoji large in center
      ctx.font = '120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentItem.emoji, 320, 240);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `demo-${currentItem.name}-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setCapturedPhotos(prev => [...prev, file]);

          // Move to next demo item (but don't go past the last one)
          if (demoItemIndex < demoItems.length - 1) {
            setDemoItemIndex(prev => prev + 1);
          }
        }
      }, 'image/jpeg', 0.8);

      return;
    }

    // Real camera capture
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
      alert('Please take at least one photo');
      return;
    }

    // Immediately start analysis
    await handleAnalyzePhotos();
  };

  const handleAnalyzePhotos = async () => {
    setIsAnalyzing(true);

    try {
      // Demo mode: Return fake results immediately
      if (isDemoMode) {
        console.log('[Camera] Demo mode: Returning mock analysis results');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return items matching the number of photos captured
        // All items are unique (chicken, broccoli, eggs, asparagus)
        const capturedCount = capturedPhotos.length;
        const mockItems = demoItems.slice(0, capturedCount).map(item => ({
          item: item.item,
          name: item.item,  // Add name field for display
          category: item.category,
          quantity: item.quantity,
          total_weight_oz: item.total_weight_oz,
          expires: item.expires,
          expiryDate: item.expiryDate,  // For date input field
          imageUrl: item.imageUrl  // Direct image URL from Supabase (if provided)
        }));

        console.log('[Camera] Demo mode:', capturedCount, 'photos →', mockItems.length, 'items');
        setEditableResults(mockItems);
        setShowConfirmation(true);
        setIsAnalyzing(false);
        return;
      }

      // Real API call
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
      // Demo mode: Save to tour context (virtual inventory)
      if (isDemoMode) {
        console.log('[Camera] Demo mode: Saving items to virtual tour inventory');

        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          setIsCameraActive(false);
        }

        // Transform items for virtual inventory
        const demoInventoryItems = items.map((item, index) => ({
          id: `demo-${Date.now()}-${index}`,  // Temporary ID
          itemName: item.name,
          quantity: item.quantity,
          category: item.category,
          expirationDate: item.expiryDate,
          total_weight_oz: item.total_weight_oz,
          imageUrl: item.imageUrl,  // Include Supabase image URL
          isDemo: true,  // Flag as demo item
          uploadedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        console.log('[Camera] 🎯 Demo items to save:', demoInventoryItems);

        // Save to tour context (NOT database)
        addDemoInventoryItems(demoInventoryItems);

        console.log('[Camera] ✅ Demo items saved to tour context');

        setSuccessData({
          items: items,
          count: items.length
        });
        setShowSuccessModal(true);
        setIsSaving(false);

        return;
      }

      // Real API call
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('fridgy_token');

      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: safeJSONStringify({
          items: items.map(item => ({
            item_name: item.name,
            quantity: item.quantity,
            category: item.category,
            expiration_date: item.expiryDate,
            total_weight_oz: item.total_weight_oz || null, // Include weight data from AI
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

    // Advance tour step before navigating to inventory
    if (shouldShowTooltip(STEPS.ITEMS_ADDED)) {
      console.log('[Camera] Demo mode - advancing tour to VIEWING_INVENTORY before navigation');
      goToStep(STEPS.VIEWING_INVENTORY);
    }

    // Navigate to demo inventory page in demo mode, regular inventory otherwise
    if (isDemoMode) {
      console.log('[Camera] Demo mode - Navigating to /demo-inventory');
      navigate('/demo-inventory');
    } else {
      console.log('[Camera] Real mode - Navigating to /inventory');
      navigate('/inventory');
    }
  };

  // Editable item functions
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

  // Selection functions
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
          <img 
            src={FridgyLogo} 
            alt="Fridgy" 
            className="camera-v2__analyzing-icon" 
          />
          <div className="camera-v2__analyzing-text">Analyzing Photos...</div>
          <div className="camera-v2__analyzing-subtext">
            Fridgy is identifying food items and expiration dates
          </div>
        </div>
      </div>
    );
  }

  // Render editable results interface
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
          
          {/* Modern Card Interface */}
          <div className="camera-v2__results-cards">
            {editableResults.map((item, index) => {
              const formattedQuantity = formatQuantity(item.quantity);
              const categoryColor = getCategoryColor(item.category);

              return (
                <div key={index} className="camera-v2__inventory-card">
                  {/* Left: Ingredient image with category background */}
                  <div className="camera-v2__card-icon">
                    <IngredientImage
                      item={{
                        itemName: item.name,
                        category: item.category,
                        imageUrl: item.imageUrl  // Pass direct Supabase URL if available
                      }}
                      size={64}
                      className="camera-v2__card-image"
                      fallbackToIcon={true}
                    />
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
                          <option value="Beverages">Beverages</option>
                          <option value="Fats and oils">Fats and oils</option>
                          <option value="Seasonings">Seasonings</option>
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

        {/* Guided Tour Tooltip for Confirmation Screen */}
        {shouldShowTooltip(STEPS.ITEMS_ADDED) && (
          <>
            {console.log('[Camera] 🎯 Rendering CONFIRMATION tooltip on Review Items screen')}
            <GuidedTooltip
              targetSelector=".camera-v2__save-btn"
              message="Add items to your inventory"
              position="bottom"
              showAction={false}
              onDismiss={null}
              highlight={true}
              offset={20}
            />
          </>
        )}
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
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-v2__video"
            />

            {/* Demo Mode: Floating Grocery Overlays - One at a time */}
            {isDemoMode && isCameraActive && !editMode && demoItemIndex < demoItems.length && (
              <div className="camera-v2__demo-overlay">
                {/* Current Item Only */}
                <div className="camera-v2__demo-item camera-v2__demo-item--center">
                  <div className="camera-v2__demo-icon">
                    {demoItems[demoItemIndex].imageUrl && (
                      <img
                        src={demoItems[demoItemIndex].imageUrl}
                        alt={demoItems[demoItemIndex].name}
                        style={{
                          width: '360px',
                          height: '360px',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
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

      {/* Guided Tour Tooltips for Camera */}
      {shouldShowTooltip(STEPS.ITEMS_ADDED) && (
        <>
          {console.log('[Camera] Tour tooltip - Photo count:', capturedPhotos.length, 'Demo mode:', isDemoMode)}

          {/* Priority 1: Confirmation screen - show ONLY this if results exist */}
          {editableResults ? (
            <>
              {console.log('[Camera] 🎯 Rendering CONFIRMATION tooltip')}
              <GuidedTooltip
                targetSelector=".camera-v2__save-btn"
                message="Add items to your inventory"
                position="bottom"
                showAction={false}
                onDismiss={null}
                highlight={true}
                offset={20}
              />
            </>
          ) : isDemoMode ? (
            /* DEMO MODE: Contextual tooltips based on photo count */
            <>
              {/* Before 1st photo: "Snap a photo of your groceries" */}
              {showCameraTooltip && (
                <>
                  {console.log('[Camera] 🎯 Demo tooltip: Snap first photo')}
                  <GuidedTooltip
                    targetSelector=".camera-v2__capture-button"
                    message="Snap a photo of your groceries"
                    position="top"
                    showAction={false}
                    onDismiss={null}
                    highlight={true}
                    offset={30}
                  />
                </>
              )}

              {/* After 1st photo: "Snap to add your next item" */}
              {capturedPhotos.length === 1 && (
                <>
                  {console.log('[Camera] 🎯 Demo tooltip: Snap next item')}
                  <GuidedTooltip
                    targetSelector=".camera-v2__capture-button"
                    message="Snap to add your next item (1/4)"
                    position="top"
                    showAction={false}
                    onDismiss={null}
                    highlight={true}
                    offset={30}
                  />
                </>
              )}

              {/* After 2nd photo: "Snap to add your next item" */}
              {capturedPhotos.length === 2 && (
                <>
                  {console.log('[Camera] 🎯 Demo tooltip: Snap next item (2)')}
                  <GuidedTooltip
                    targetSelector=".camera-v2__capture-button"
                    message="Snap to add your next item (2/4)"
                    position="top"
                    showAction={false}
                    onDismiss={null}
                    highlight={true}
                    offset={30}
                  />
                </>
              )}

              {/* After 3rd photo: "Snap to add your next item" */}
              {capturedPhotos.length === 3 && (
                <>
                  {console.log('[Camera] 🎯 Demo tooltip: Snap next item (3)')}
                  <GuidedTooltip
                    targetSelector=".camera-v2__capture-button"
                    message="Snap to add your next item (3/4)"
                    position="top"
                    showAction={false}
                    onDismiss={null}
                    highlight={true}
                    offset={30}
                  />
                </>
              )}

              {/* After 4th photo: "Tap Done" */}
              {capturedPhotos.length === 4 && (
                <>
                  {console.log('[Camera] 🎯 Demo tooltip: Tap Done')}
                  <GuidedTooltip
                    targetSelector=".camera-v2__done-button"
                    message='Tap "Done"'
                    position="top"
                    showAction={false}
                    onDismiss={null}
                    highlight={true}
                    offset={50}
                  />
                </>
              )}
            </>
          ) : capturedPhotos.length > 0 ? (
            /* NON-DEMO MODE: Regular "Tap Done" tooltip after any photos */
            <>
              {console.log('[Camera] 🎯 Rendering DONE tooltip (non-demo)')}
              <GuidedTooltip
                targetSelector=".camera-v2__done-button"
                message='Tap "Done"'
                position="top"
                showAction={false}
                onDismiss={null}
                highlight={true}
                offset={30}
              />
            </>
          ) : (
            /* No photos - show initial capture tooltip */
            <>
              {console.log('[Camera] 🎯 Rendering CAPTURE tooltip')}
              <GuidedTooltip
                targetSelector=".camera-v2__capture-button"
                message={isDemoMode ? "Snap a photo of your groceries" : "Snap photos of groceries and their expiration date all in one go!"}
                position="top"
                showAction={false}
                onDismiss={null}
                highlight={true}
                offset={30}
              />
            </>
          )}
        </>
      )}

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