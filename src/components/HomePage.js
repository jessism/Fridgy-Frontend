import React, { useRef } from 'react';
import './HomePage.css';

const HomePage = ({ onImagesSelected }) => {
  const fileInputRef = useRef(null);

  const handleTakePicturesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onImagesSelected(files);
    }
  };

  return (
    <div className="homepage">
      <div className="homepage-content">
        <div className="logo-section">
          <h1 className="app-title">🍎 Fridgy</h1>
          <p className="app-subtitle">AI-Powered Fridge Inventory</p>
        </div>
        
        <div className="main-section">
          <p className="instruction-text">
            Take photos of your groceries and let AI analyze what's in your fridge!
          </p>
          
          <button 
            className="take-pictures-btn"
            onClick={handleTakePicturesClick}
          >
            📸 Take Pictures
          </button>
          
          {/* Hidden file input for camera access */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        
        <div className="tips-section">
          <h3>📝 Tips for better results:</h3>
          <ul>
            <li>Take clear, well-lit photos</li>
            <li>Show labels and expiration dates</li>
            <li>Capture multiple angles if needed</li>
            <li>Include multiple items in one photo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 