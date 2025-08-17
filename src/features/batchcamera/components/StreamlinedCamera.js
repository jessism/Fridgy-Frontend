import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import SuccessModal from '../../../components/modals/SuccessModal';
import './StreamlinedCamera.css';

const StreamlinedCamera = ({ onComplete }) => {
  const { user } = useAuth();
  const [capturedFiles, setCapturedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // const [analysisResults, setAnalysisResults] = useState(null); // Removed to fix unused variable warning
  const [editableResults, setEditableResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ items: [], count: 0 });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkExpiryPreset, setBulkExpiryPreset] = useState('');
  const fileInputRef = useRef(null);

  const handleFileCapture = (event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length > 0) {
      setCapturedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so same file can be captured again
    event.target.value = '';
  };

  const removePhoto = (indexToRemove) => {
    setCapturedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyzePhotos = async () => {
    if (capturedFiles.length === 0) {
      alert('Please take at least one photo');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      capturedFiles.forEach((file) => {
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
        // setAnalysisResults(data.items); // Not needed since we only use editableResults
        setEditableResults(data.items.map(item => ({ ...item })));
        setShowResults(true);
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

  // Bulk editing functions
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

  const applyBulkCategory = () => {
    if (!bulkCategory || selectedItems.size === 0) return;
    
    setEditableResults(prev => {
      const updated = [...prev];
      selectedItems.forEach(index => {
        if (updated[index]) {
          updated[index] = { ...updated[index], category: bulkCategory };
        }
      });
      return updated;
    });
    setBulkCategory('');
  };

  const applyBulkExpiry = () => {
    if (!bulkExpiryPreset || selectedItems.size === 0) return;
    
    const today = new Date();
    let expiryDate;
    
    switch (bulkExpiryPreset) {
      case '3-days':
        expiryDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
        break;
      case '1-week':
        expiryDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case '2-weeks':
        expiryDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case '1-month':
        expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }
    
    const formattedDate = expiryDate.toISOString().split('T')[0];
    
    setEditableResults(prev => {
      const updated = [...prev];
      selectedItems.forEach(index => {
        if (updated[index]) {
          updated[index] = { ...updated[index], expiryDate: formattedDate };
        }
      });
      return updated;
    });
    setBulkExpiryPreset('');
  };

  const handleSaveItems = async () => {
    if (!editableResults || editableResults.length === 0) {
      alert('No items to save');
      return;
    }

    if (!user || !user.id) {
      alert('You must be logged in to save items. Please sign in and try again.');
      return;
    }

    setIsSaving(true);
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/save-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: editableResults,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const itemCount = data.savedItems ? data.savedItems.length : editableResults.length;
        setSuccessData({
          items: editableResults,
          count: itemCount
        });
        setShowSuccessModal(true);
      } else {
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
    
    // Reset everything for next batch
    setCapturedFiles([]);
    setEditableResults(null);
    setShowResults(false);
    setSuccessData({ items: [], count: 0 });
    
    // Close the parent modal
    if (onComplete) {
      onComplete();
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Auto-trigger camera on component mount to skip prep screen
  useEffect(() => {
    // Add a small delay to ensure the modal is fully rendered
    const timer = setTimeout(() => {
      if (capturedFiles.length === 0 && !showResults) {
        triggerCamera();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Only run on mount

  return (
    <div className="streamlined-camera" style={{ position: 'relative' }}>
      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="streamlined-camera__loading-overlay">
          <div className="streamlined-camera__loading-spinner"></div>
          <div className="streamlined-camera__loading-text">
            Analyzing your photos...
          </div>
          <div className="streamlined-camera__loading-subtext">
            AI is identifying food items and expiry dates
          </div>
        </div>
      )}

      {!showResults ? (
        // Camera Capture Mode
        <div className="streamlined-camera__capture-mode">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileCapture}
            className="streamlined-camera__file-input"
            multiple
          />

          {/* Show capture button only if camera didn't auto-trigger or user wants to add more */}
          {capturedFiles.length === 0 && (
            <div className="streamlined-camera__capture-area">
              <div className="streamlined-camera__waiting-message">
                <p>Camera opening...</p>
                <button 
                  className="streamlined-camera__manual-trigger"
                  onClick={triggerCamera}
                >
                  📷 Open Camera Manually
                </button>
              </div>
            </div>
          )}

          {/* Thumbnail Tray */}
          {capturedFiles.length > 0 && (
            <div className="streamlined-camera__thumbnail-section">
              <div className="streamlined-camera__thumbnail-tray">
                {capturedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="streamlined-camera__thumbnail"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Captured food item ${index + 1}`}
                      className="streamlined-camera__thumbnail-image"
                    />
                    <button 
                      className="streamlined-camera__thumbnail-remove"
                      onClick={() => removePhoto(index)}
                      title="Remove this photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {/* Add Another Photo Button */}
                <button 
                  className="streamlined-camera__add-photo-btn"
                  onClick={triggerCamera}
                  title="Take another photo"
                >
                  +
                </button>
              </div>
              
              <p className="streamlined-camera__photo-count">
                {capturedFiles.length} photo{capturedFiles.length !== 1 ? 's' : ''} captured
              </p>
            </div>
          )}

          {/* Analyze Button */}
          {capturedFiles.length > 0 && (
            <div className="streamlined-camera__analyze-section">
              <button 
                className="streamlined-camera__analyze-btn"
                onClick={handleAnalyzePhotos}
                disabled={isAnalyzing}
              >
                {isAnalyzing 
                  ? '🔄 Analyzing...' 
                  : `🤖 Analyze ${capturedFiles.length} Photo${capturedFiles.length > 1 ? 's' : ''}`
                }
              </button>
            </div>
          )}
        </div>
      ) : (
        // Results Review Mode
        <div className="streamlined-camera__results-mode">
          <div className="streamlined-camera__results-header">
            <h3>Review & Edit Results</h3>
            <p>Review the AI-detected items below. You can edit any details before saving.</p>
            <button 
              className="streamlined-camera__back-btn"
              onClick={() => setShowResults(false)}
            >
              ← Back to Camera
            </button>
          </div>
          
          {/* Bulk Editing Toolbar */}
          {editableResults && editableResults.length > 1 && (
            <div className="streamlined-camera__bulk-toolbar">
              <div className="streamlined-camera__bulk-select">
                <label className="streamlined-camera__bulk-select-all">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === editableResults.length && editableResults.length > 0}
                    onChange={toggleSelectAll}
                  />
                  Select All ({selectedItems.size} selected)
                </label>
              </div>
              
              {selectedItems.size > 0 && (
                <div className="streamlined-camera__bulk-actions">
                  <div className="streamlined-camera__bulk-action">
                    <select 
                      value={bulkCategory} 
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="streamlined-camera__bulk-select-input"
                    >
                      <option value="">Apply Category...</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Protein">Protein</option>
                      <option value="Grains">Grains</option>
                      <option value="Fats and oils">Fats and oils</option>
                      <option value="Other">Other</option>
                    </select>
                    <button 
                      onClick={applyBulkCategory}
                      disabled={!bulkCategory}
                      className="streamlined-camera__bulk-apply-btn"
                    >
                      Apply
                    </button>
                  </div>
                  
                  <div className="streamlined-camera__bulk-action">
                    <select 
                      value={bulkExpiryPreset} 
                      onChange={(e) => setBulkExpiryPreset(e.target.value)}
                      className="streamlined-camera__bulk-select-input"
                    >
                      <option value="">Set Expiry...</option>
                      <option value="3-days">3 days</option>
                      <option value="1-week">1 week</option>
                      <option value="2-weeks">2 weeks</option>
                      <option value="1-month">1 month</option>
                    </select>
                    <button 
                      onClick={applyBulkExpiry}
                      disabled={!bulkExpiryPreset}
                      className="streamlined-camera__bulk-apply-btn"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Results Table/Cards will go here */}
          <div className="streamlined-camera__results-content">
            {/* Desktop Table */}
            <div className="streamlined-camera__results-table-container">
              <table className="streamlined-camera__results-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedItems.size === (editableResults && editableResults.length) && editableResults && editableResults.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Category</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {editableResults && editableResults.map((item, index) => (
                    <tr key={index} className={selectedItems.has(index) ? 'streamlined-camera__row-selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(index)}
                          onChange={() => toggleSelectItem(index)}
                        />
                      </td>
                      <td>
                        <select 
                          value={item.category} 
                          onChange={(e) => updateEditableItem(index, 'category', e.target.value)}
                          className="streamlined-camera__editable-select"
                        >
                          <option value="Fruits">Fruits</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Protein">Protein</option>
                          <option value="Grains">Grains</option>
                          <option value="Fats and oils">Fats and oils</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateEditableItem(index, 'name', e.target.value)}
                          className="streamlined-camera__editable-input"
                          placeholder="Item name"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateEditableItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="streamlined-camera__editable-input streamlined-camera__quantity-input"
                          min="1"
                          max="99"
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateEditableItem(index, 'expiryDate', e.target.value)}
                          className="streamlined-camera__editable-input streamlined-camera__date-input"
                        />
                      </td>
                      <td>
                        <button 
                          onClick={() => removeEditableItem(index)}
                          className="streamlined-camera__remove-item-btn"
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

            {/* Mobile Cards */}
            <div className="streamlined-camera__results-cards">
              {editableResults && editableResults.map((item, index) => (
                <div key={index} className={`streamlined-camera__result-card ${selectedItems.has(index) ? 'streamlined-camera__card-selected' : ''}`}>
                  <div className="streamlined-camera__card-header">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={() => toggleSelectItem(index)}
                      className="streamlined-camera__card-checkbox"
                    />
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateEditableItem(index, 'name', e.target.value)}
                      className="streamlined-camera__card-title-input"
                      placeholder="Item name"
                    />
                    <button 
                      onClick={() => removeEditableItem(index)}
                      className="streamlined-camera__card-remove-btn"
                      title="Remove this item"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="streamlined-camera__card-fields">
                    <div className="streamlined-camera__card-field">
                      <label>Category</label>
                      <select 
                        value={item.category} 
                        onChange={(e) => updateEditableItem(index, 'category', e.target.value)}
                        className="streamlined-camera__card-select"
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
                    
                    <div className="streamlined-camera__card-field">
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateEditableItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="streamlined-camera__card-input"
                        min="1"
                        max="99"
                      />
                    </div>
                    
                    <div className="streamlined-camera__card-field">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => updateEditableItem(index, 'expiryDate', e.target.value)}
                        className="streamlined-camera__card-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Save Actions */}
          <div className="streamlined-camera__save-actions">
            <div className="streamlined-camera__items-count">
              {(editableResults && editableResults.length) || 0} item{((editableResults && editableResults.length) || 0) !== 1 ? 's' : ''} ready to save
            </div>
            <button 
              onClick={handleSaveItems} 
              disabled={isSaving || !(editableResults && editableResults.length)}
              className="streamlined-camera__save-btn"
            >
              {isSaving ? '💾 Saving...' : `✔️ Add ${(editableResults && editableResults.length) || 0} Item${((editableResults && editableResults.length) || 0) !== 1 ? 's' : ''} to Inventory`}
            </button>
          </div>
        </div>
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

export default StreamlinedCamera;