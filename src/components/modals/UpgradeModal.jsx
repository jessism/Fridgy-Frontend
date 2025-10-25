/**
 * UpgradeModal Component
 * Shown when free users try to access premium features
 */

import React, { useState } from 'react';
import './UpgradeModal.css';

export function UpgradeModal({ isOpen, onClose, feature, current, limit, startCheckout }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    try {
      console.log('[UpgradeModal] Starting checkout...');
      setLoading(true);
      await startCheckout(); // Opens embedded checkout or redirects
      console.log('[UpgradeModal] startCheckout completed, closing modal...');
      // Close this modal so CheckoutModal can show
      onClose();
      console.log('[UpgradeModal] Modal closed!');
    } catch (error) {
      console.error('[UpgradeModal] Error starting checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  // Feature-specific benefits
  const getFeatureBenefits = (featureName) => {
    const benefitsMap = {
      'inventory analytics': {
        subtitle: 'Upgrade to Pro Plan to unlock inventory analytics',
        benefits: [
          'Track your inventory trends over time',
          'See which items you use most',
          'Identify patterns in food waste',
          'Get smart restocking suggestions',
          'Visualize your spending on groceries'
        ]
      },
      'meal analytics': {
        subtitle: 'Upgrade to Pro Plan to unlock meal analytics',
        benefits: [
          'Track all your meals and cooking history',
          'See nutritional trends over time',
          'Analyze your favorite recipes',
          'Get personalized meal insights',
          'Monitor your dietary patterns'
        ]
      },
      'ai recipes': {
        subtitle: 'Upgrade to Pro Plan to unlock AI recipe generation',
        benefits: [
          'Generate custom recipes from your inventory',
          'Get AI-powered recipe suggestions',
          'Adapt recipes to your preferences',
          'Create meal plans automatically',
          'Never run out of cooking ideas'
        ]
      },
      'default': {
        subtitle: 'Upgrade to Pro Plan to unlock unlimited access',
        benefits: [
          'Unlimited inventory items',
          'Unlimited recipe imports',
          'Advanced analytics & insights',
          'AI-powered recommendations',
          'Priority customer support'
        ]
      }
    };

    return benefitsMap[featureName] || benefitsMap['default'];
  };

  const featureContent = getFeatureBenefits(feature);

  return (
    <div className="upgrade-modal__overlay">
      <div className="upgrade-modal__content">
        <button className="upgrade-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className="upgrade-modal__title">Try Trackabite Pro</h2>

        <p className="upgrade-modal__message">
          {featureContent.subtitle}
        </p>

        <div className="upgrade-modal__features">
          <ul>
            {featureContent.benefits.map((benefit, index) => (
              <li key={index}>
                <svg className="feature-check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                  <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="upgrade-modal__pricing-text">
          7-day free trial, then $4.99/month
        </p>

        <button
          className="upgrade-modal__cta"
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Start Free Trial'}
        </button>

        <p className="upgrade-modal__disclaimer">
          Cancel anytime. No commitments.
        </p>
      </div>
    </div>
  );
}
