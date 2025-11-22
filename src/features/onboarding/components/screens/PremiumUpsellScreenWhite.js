import React, { useEffect } from 'react';
import { trackOnboardingStepViewed, trackPaymentChoice } from '../../../../utils/onboardingTracking';
import './ScreenStyles.css';
import Logo from '../../../../assets/images/Logo.png';

const PremiumUpsellScreenWhite = ({ data, onNext, onBack, onSkip, jumpToStep, updateData }) => {
  useEffect(() => {
    trackOnboardingStepViewed(9);
  }, []);
  const premiumFeatures = [
    'Inventory management & notifications',
    'Personalized recipe recommendations',
    'Meal planning based on your fridge',
    'Smart expiration date tracking',
    'Reduce food waste & save money'
  ];

  const handleStartTrial = () => {
    // Track payment choice
    trackPaymentChoice('trial');

    // Save user's choice to start trial
    if (updateData) {
      updateData({ wantsTrial: true });
    }
    localStorage.setItem('fridgy_wants_trial', 'true');
    jumpToStep(10); // Go to payment screen
  };

  const handleContinueFree = () => {
    // Track payment choice
    trackPaymentChoice('free');

    // Save user's choice for free tier
    if (updateData) {
      updateData({ wantsTrial: false });
    }
    localStorage.setItem('fridgy_wants_trial', 'false');
    jumpToStep(13); // Go to account creation (skip payment)
  };

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
      padding: '20px 15px',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      
      <button
        onClick={handleContinueFree}
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
        paddingTop: '20px'
      }}>
        <img
          src={Logo}
          alt="Fridgy Logo"
          style={{
            width: '100px',
            height: '100px',
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
              marginBottom: '10px'
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
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          marginTop: '32px'
        }}>
          {/* No Payment Due Now with checkmark */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '4px',
            color: '#333',
            fontSize: '15px'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 10L9 13L14 7" stroke="#4fcf61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>No Payment Due Now</span>
          </div>

          {/* Start Trial Button */}
          <button
            onClick={handleStartTrial}
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #81e053 0%, #6bc93f 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #6bc93f 0%, #5eb849 100%)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #81e053 0%, #6bc93f 100%)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start 7-Day Free Trial
          </button>

          {/* Text container for both lines */}
          <div style={{
            marginTop: '8px',
            lineHeight: '1.2'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              textAlign: 'center'
            }}>
              7 days free, then $4.99/month
            </div>
            <div style={{
              fontSize: '13px',
              color: '#666',
              textAlign: 'center',
              marginTop: '0px'
            }}>
              Cancel anytime. No commitments.
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}></div>
      </div>
    </div>
  );
};

export default PremiumUpsellScreenWhite;