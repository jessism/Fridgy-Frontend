import React, { useState } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import LoadingScreen from './components/LoadingScreen';
import ConfirmationPage from './components/ConfirmationPage';
import SuccessPage from './components/SuccessPage';

// Backend API configuration
const API_BASE_URL = 'https://fridgy-backend-production.up.railway.app';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedImages, setSelectedImages] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImagesSelected = async (images) => {
    setSelectedImages(images);
    setCurrentScreen('loading');
    setLoading(true);

    try {
      // Send images to backend for AI analysis
      const response = await fetch(`${API_BASE_URL}/api/analyze-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageCount: images.length
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResults(result.items);
        setCurrentScreen('confirmation');
      } else {
        console.error('Analysis failed:', result.error);
        // Handle error - could show error screen
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error('Error analyzing images:', error);
      setCurrentScreen('home');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmItems = async (confirmedItems) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/save-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: confirmedItems,
          userId: 'anonymous' // TODO: Replace with actual user ID when auth is implemented
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentScreen('success');
      } else {
        console.error('Save failed:', result.error);
        // Handle error
      }
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const resetApp = () => {
    setCurrentScreen('home');
    setSelectedImages([]);
    setAnalysisResults([]);
    setLoading(false);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage onImagesSelected={handleImagesSelected} />;
      case 'loading':
        return <LoadingScreen />;
      case 'confirmation':
        return (
          <ConfirmationPage
            items={analysisResults}
            onConfirm={handleConfirmItems}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'success':
        return <SuccessPage onStartOver={resetApp} />;
      default:
        return <HomePage onImagesSelected={handleImagesSelected} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
