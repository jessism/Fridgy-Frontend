import React from 'react';
import './ScreenStyles.css';
import Logo from '../../../../assets/images/Logo.png';
import PaywallBackground from '../../../../assets/images/Paywall3.jpg';

const PremiumUpsellScreen = ({ data, onNext, onBack, onSkip, jumpToStep }) => {
  const premiumFeatures = [
    'AI-powered food recognition from photos',
    'Smart expiration date tracking',
    'Personalized recipe recommendations', 
    'Inventory management & notifications',
    'Meal planning based on your fridge',
    'Reduce food waste & save money'
  ];

  return (
    <div className="onboarding-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${PaywallBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: 999
    }}>
      {/* Full-screen glass overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.1)'
      }} />
      
      <button 
        onClick={onSkip}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 10,
          padding: '0',
          margin: '0',
          lineHeight: '1'
        }}
      >
        ×
      </button>
      
      {/* Content container */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '380px',
          width: '100%',
          textAlign: 'center'
        }}>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '8px',
          lineHeight: '1.3'
        }}>
          Try Trackabite for free
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: 'white',
          marginBottom: '32px',
          lineHeight: '1.4',
          opacity: '0.9'
        }}>
          Turn your fridge into a smart inventory system and never waste food again
        </p>
        
        <div style={{
          textAlign: 'left',
          marginBottom: '32px'
        }}>
          {premiumFeatures.map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4.5L4 7.5L11 0.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: '15px', color: 'white', fontWeight: '500' }}>{feature}</span>
            </div>
          ))}
        </div>
        
        <div style={{
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ 
            fontSize: '16px', 
            color: 'white',
            marginBottom: '4px',
            opacity: '0.9'
          }}>
            Try 7 days free, then $2.99/month
          </div>
        </div>
        
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          alignItems: 'center'
        }}>
          <button 
            onClick={onNext}
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '8px',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start Free Trial
          </button>
        </div>
        
        <p style={{
          fontSize: '14px',
          color: 'white',
          marginTop: '8px',
          textAlign: 'center',
          opacity: '0.7'
        }}>
          Cancel anytime
        </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpsellScreen;