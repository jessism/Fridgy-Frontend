import React from 'react';
import { usePrice } from '../../../../contexts/PriceContext';
import './ScreenStyles.css';

const PremiumUpsellScreenGreen = ({ data, onNext, onBack, onSkip, jumpToStep }) => {
  const { formattedWithInterval } = usePrice();

  const premiumFeatures = [
    'Inventory management & notifications',
    'Personalized recipe recommendations',
    'Meal planning based on your fridge',
    'Smart expiration date tracking',
    'Reduce food waste & save money'
  ];

  const handleStartTrial = () => {
    // Go to payment screen (step 11)
    jumpToStep(11);
  };

  const handleSkipToFree = () => {
    // Skip to account creation for free tier
    jumpToStep(14);
  };

  return (
    <div className="onboarding-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #6bc93f 0%, #5eb849 100%)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 20px'
    }}>
      
      <button
        onClick={handleSkipToFree}
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
      
      {/* Full-screen glass overlay with texture */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backdropFilter: 'blur(20px)',
        background: `
          radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 60% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
          radial-gradient(circle at 10% 70%, rgba(0, 0, 0, 0.08) 0%, transparent 35%),
          rgba(255, 255, 255, 0.05)
        `
      }} />
      
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
        
        {/* No Payment Due Now */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: '15px', color: 'white', fontWeight: '500' }}>No Payment Due Now</span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          alignItems: 'center'
        }}>
          <button
            onClick={handleStartTrial}
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              background: 'white',
              color: '#6bc93f',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '12px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start 7-Day Free Trial
          </button>
        </div>

        <p style={{
          fontSize: '14px',
          color: 'white',
          marginTop: '4px',
          textAlign: 'center',
          opacity: '0.85',
          lineHeight: '1.4'
        }}>
          7 days free, then {formattedWithInterval}.<br />
          Cancel anytime. No commitments.
        </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpsellScreenGreen;