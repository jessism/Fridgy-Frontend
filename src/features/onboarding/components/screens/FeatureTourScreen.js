import React, { useState } from 'react';
import './ScreenStyles.css';

const FeatureTourScreen = ({ data, updateData, onNext, onBack, onSkip }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: '📸',
      title: 'Snap Your Groceries',
      description: 'Take a photo of your groceries and we\'ll automatically identify and add them to your inventory',
      preview: '📱 → 📸 → ✅'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Recipe Suggestions',
      description: 'Get personalized recipes based on what\'s in your fridge and your dietary preferences',
      preview: '🥗 + 🥑 = 🍳'
    },
    {
      icon: '📊',
      title: 'Track Your Savings',
      description: 'See how much food and money you\'re saving with detailed analytics and insights',
      preview: '💰 📈 🎉'
    },
    {
      icon: '🛒',
      title: 'Smart Shopping Lists',
      description: 'Auto-generated shopping lists based on your meal plans and what you\'re running low on',
      preview: '📝 → 🛒 → 🏪'
    }
  ];

  const handleNext = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onNext();
    }
  };

  const handlePrev = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    } else {
      onBack();
    }
  };

  const feature = features[currentFeature];

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__content">
        <h1 className="onboarding-screen__title">
          Discover what Trackabite can do
        </h1>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '32px'
        }}>
          {features.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentFeature ? '#4fcf61' : '#e0e0e0',
                transition: 'background-color 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentFeature(index)}
            />
          ))}
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '32px',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>
            {feature.icon}
          </div>
          
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '12px'
          }}>
            {feature.title}
          </h2>
          
          <p style={{
            fontSize: '15px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.5',
            marginBottom: '24px',
            maxWidth: '320px'
          }}>
            {feature.description}
          </p>
          
          <div style={{
            fontSize: '24px',
            letterSpacing: '8px'
          }}>
            {feature.preview}
          </div>
        </div>
        
        <div className="onboarding-screen__actions">
          <button 
            className="onboarding-btn onboarding-btn--primary onboarding-btn--large"
            onClick={handleNext}
          >
            {currentFeature === features.length - 1 ? 'Continue' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureTourScreen;