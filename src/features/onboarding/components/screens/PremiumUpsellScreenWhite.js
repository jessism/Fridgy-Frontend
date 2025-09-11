import React from 'react';
import './ScreenStyles.css';
import Logo from '../../../../assets/images/Logo.png';

const PremiumUpsellScreenWhite = ({ data, onNext, onBack, onSkip, jumpToStep }) => {
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
      background: `
        radial-gradient(circle at 15% 20%, rgba(79, 207, 97, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 85% 30%, rgba(79, 207, 97, 0.06) 0%, transparent 40%),
        radial-gradient(circle at 50% 80%, rgba(79, 207, 97, 0.04) 0%, transparent 60%),
        radial-gradient(circle at 20% 70%, rgba(79, 207, 97, 0.03) 0%, transparent 35%),
        white
      `,
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 20px'
    }}>
      
      <button 
        onClick={onSkip}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'transparent',
          border: 'none',
          color: '#666',
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
      
      {/* Header with Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        paddingTop: '60px'
      }}>
        <img 
          src={Logo} 
          alt="Fridgy Logo" 
          style={{
            width: '140px',
            height: '140px',
            objectFit: 'contain'
          }}
        />
      </div>
      
      {/* Content container */}
      <div style={{
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        margin: '0 auto'
      }}>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '8px',
          lineHeight: '1.3',
          marginTop: '0'
        }}>
          Try Trackabite for free
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px',
          lineHeight: '1.4'
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
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(79, 207, 97, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(79, 207, 97, 0.2)'
              }}>
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M2 5.5L5.5 9L12 2" stroke="#4fcf61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: '15px', color: '#333', fontWeight: 'normal' }}>{feature}</span>
            </div>
          ))}
        </div>
        
        <div style={{
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '4px'
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
              background: '#4fcf61',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#45b556';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#4fcf61';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start Free Trial
          </button>
        </div>
        
        <p style={{
          fontSize: '13px',
          color: '#999',
          marginTop: '6px',
          textAlign: 'center'
        }}>
          Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default PremiumUpsellScreenWhite;