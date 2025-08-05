import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import './BatchCamera.css';

const BatchCamera = ({ onComplete }) => {
  const { user } = useAuth();
  const [accumulatedFiles, setAccumulatedFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableResults, setEditableResults] = useState(null);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length > 0) {
      // Add new photos to the accumulated batch
      setAccumulatedFiles(prev => [...prev, ...newFiles]);
      setResults(null); // Clear previous results
    }
    // Reset the file input so user can take another photo
    event.target.value = '';
  };

  const removePhoto = (indexToRemove) => {
    setAccumulatedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setResults(null); // Clear results when batch changes
    setEditableResults(null); // Clear editable results when batch changes
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

  const handleSubmitBatch = async () => {
    if (accumulatedFiles.length === 0) {
      alert('Please take at least one photo');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      accumulatedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Use the same API_BASE_URL logic as your App.js
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://fridgy-backend-production.up.railway.app' 
        : 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/process-images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.items);
        setEditableResults(data.items.map(item => ({ ...item }))); // Create editable copy
      } else {
        console.error('Processing failed:', data.error);
        alert('Failed to process images. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Error submitting batch:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!editableResults || editableResults.length === 0) {
      alert('No items to save');
      return;
    }

    // Debug user authentication
    console.log('🔍 Debug: Current user object:', user);
    console.log('🔍 Debug: User ID:', user?.id);
    console.log('🔍 Debug: Original AI results:', results);
    console.log('🔍 Debug: Edited items to save:', editableResults);

    if (!user?.id) {
      alert('You must be logged in to save items. Please sign in and try again.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Use the same API_BASE_URL logic
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://fridgy-backend-production.up.railway.app' 
        : 'http://localhost:5000';

      console.log('💾 Saving items with userId:', user.id);

      const response = await fetch(`${API_BASE_URL}/api/save-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: editableResults,
          userId: user.id
        }),
      });

      console.log('📡 Save response status:', response.status);
      console.log('📡 Save response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Save request failed:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Save response data:', data);
      
      if (data.success) {
        const itemCount = data.savedItems ? data.savedItems.length : editableResults.length;
        console.log('✅ Save successful! Items saved:', itemCount);
        
        alert(`🎉 Successfully saved ${itemCount} items to your inventory!\n\nItems saved:\n${editableResults.map(item => `• ${item.name} (${item.quantity})`).join('\n')}`);
        
        // Reset for next batch
        setAccumulatedFiles([]);
        setResults(null);
        setEditableResults(null);
        
        // Close the modal
        if (onComplete) {
          onComplete();
        }
      } else {
        console.error('❌ Save failed:', data.error);
        alert(`❌ Failed to save items: ${data.error}\n\nPlease try again.`);
      }
    } catch (error) {
      console.error('❌ Error saving items:', error);
      alert(`❌ Failed to save items to your inventory.\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`);
    } finally {
      console.log('💾 Save operation completed, resetting loading state');
      setIsSaving(false);
    }
  };

  return (
    <div className="batch-camera">
      <h2>📸 Batch Image Processing</h2>
      
      {/* File Input */}
      <div className="file-input-section">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="file-input"
          id="batch-images"
        />
        <label htmlFor="batch-images" className="file-input-label">
          {accumulatedFiles.length === 0 ? '📷 Take Photo' : '📷 Add Another Photo'}
        </label>
      </div>

      {/* Image Thumbnails */}
      {accumulatedFiles.length > 0 && (
        <div className="thumbnails-section">
          <h3>Captured Photos ({accumulatedFiles.length})</h3>
          <div className="thumbnails-grid">
            {accumulatedFiles.map((file, index) => (
              <div key={index} className="thumbnail">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Photo ${index + 1}`}
                  className="thumbnail-image"
                />
                <button 
                  className="remove-photo-btn"
                  onClick={() => removePhoto(index)}
                  title="Remove this photo"
                >
                  ✕
                </button>
                <p className="thumbnail-name">Photo {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {accumulatedFiles.length > 0 && (
        <button 
          onClick={handleSubmitBatch}
          disabled={isLoading}
          className="submit-batch-btn"
        >
          {isLoading 
            ? '🔄 Processing...' 
            : `🤖 Analyze ${accumulatedFiles.length} Photo${accumulatedFiles.length > 1 ? 's' : ''}`
          }
        </button>
      )}

      {/* Results Table */}
      {editableResults && (
        <div className="results-section">
          <h3>Review & Edit Results</h3>
          <p className="results-subtitle">Review the AI-detected items below. You can edit any details before saving.</p>
          
          <table className="results-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Name</th>
                <th>Quantity</th>
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
                      <option value="Fats and oils">Fats and oils</option>
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
      )}
    </div>
  );
};

export default BatchCamera; 