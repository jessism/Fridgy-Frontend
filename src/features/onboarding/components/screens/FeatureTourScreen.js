import React, { useState } from 'react';
import './ScreenStyles.css';

// Video import - comment out or update with your actual video file
// import snapGroceriesVideo from '../../../../assets/videos/snap-groceries-demo.mp4';

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
        <p style={{
          fontSize: '14px',
          color: '#666',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Discover what Trackabite can do
        </p>

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
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {currentFeature === 0 ? (
            // Video for "Snap Your Groceries" feature
            <>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {feature.title}
              </h2>

              {/* iPhone Frame Container */}
              <div style={{
                marginBottom: '16px',
                position: 'relative',
                width: '240px',
                height: '490px',
                backgroundColor: '#1a1a1a',
                borderRadius: '35px',
                padding: '10px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* iPhone Notch */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '110px',
                  height: '20px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '0 0 12px 12px',
                  zIndex: 2
                }}/>

                {/* iPhone Screen Container */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '26px',
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  position: 'relative'
                }}>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      // If video fails to load, show placeholder
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  >
                  {/*
                    TO ADD YOUR VIDEO (Choose one method):

                    Method 1 - Public Folder (Recommended):
                    1. Add your video file to: Frontend/public/videos/snap-groceries-demo.mp4
                    2. The src below will work automatically

                    Method 2 - Assets Folder:
                    1. Add your video file to: Frontend/src/assets/videos/snap-groceries-demo.mp4
                    2. Uncomment the import at the top of this file
                    3. Replace the src below with: src={snapGroceriesVideo}
                  */}
                    <source src="/videos/snap-groceries-demo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* Fallback placeholder - shown if video doesn't load */}
                  <div style={{
                    textAlign: 'center',
                    width: '100%',
                    height: '100%',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '26px',
                    padding: '30px 15px'
                  }}>
                    <div style={{ fontSize: '64px' }}>{feature.icon}</div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 10px 0' }}>
                        Video Not Found
                      </p>
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>
                        To add your iPhone demo video:
                      </p>
                      <ol style={{
                        fontSize: '13px',
                        color: '#666',
                        textAlign: 'left',
                        margin: '0 auto',
                        maxWidth: '250px',
                        lineHeight: '1.6'
                      }}>
                        <li>Place your video file at:<br/>
                          <code style={{ fontSize: '11px', backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '3px' }}>
                            Frontend/public/videos/snap-groceries-demo.mp4
                          </code>
                        </li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '15px',
                color: '#666',
                textAlign: 'center',
                lineHeight: '1.5',
                maxWidth: '320px'
              }}>
                {feature.description}
              </p>
            </>
          ) : (
            // Original display for other features with green background
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '16px',
              padding: '40px',
              width: '100%',
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
          )}
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