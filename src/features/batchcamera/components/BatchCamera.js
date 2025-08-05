import React, { useState } from 'react';
import './BatchCamera.css';

const BatchCamera = () => {
  const [accumulatedFiles, setAccumulatedFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleConfirm = () => {
    alert('Confirmed! (This will be implemented in later slices)');
    // Reset for next batch
    setAccumulatedFiles([]);
    setResults(null);
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
      {results && (
        <div className="results-section">
          <h3>Processing Results</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.expiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button onClick={handleConfirm} className="confirm-btn">
            ✔️ Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchCamera; 