/**
 * BillingPage Component
 * Displays subscription status, usage statistics, and billing management
 */

import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { UsageIndicator } from '../components/common/UsageIndicator';
import { PremiumBadge } from '../components/common/PremiumBadge';
import './BillingPage.css';

function BillingPage() {
  const {
    subscription,
    usage,
    loading,
    isPremium,
    isFreeTier,
    openBillingPortal,
    startCheckout,
  } = useSubscription();

  const [promoCode, setPromoCode] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  if (loading) {
    return (
      <div className="billing-page">
        <div className="billing-page__loading">Loading your subscription...</div>
      </div>
    );
  }

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      await openBillingPortal();
    } catch (error) {
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      await startCheckout(promoCode || null);
    } catch (error) {
      alert('Failed to start checkout. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="billing-page">
      <div className="billing-page__container">
        <h1 className="billing-page__title">Billing & Subscription</h1>

        {/* Current Plan Section */}
        <div className="billing-page__plan-card">
          <div className="billing-page__plan-header">
            <div>
              <h2 className="billing-page__plan-title">Current Plan</h2>
              <div className="billing-page__plan-tier">
                {isPremium && <PremiumBadge size="large" />}
                {isFreeTier && (
                  <span className="billing-page__free-badge">Free Tier</span>
                )}
                {subscription?.tier === 'grandfathered' && (
                  <span className="billing-page__grandfathered-badge">
                    👑 Grandfathered - Lifetime Premium
                  </span>
                )}
              </div>
            </div>

            {isPremium && subscription?.tier !== 'grandfathered' && (
              <button
                className="billing-page__manage-btn"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? 'Opening...' : 'Manage Billing'}
              </button>
            )}
          </div>

          {/* Subscription Details */}
          {subscription && (
            <div className="billing-page__details">
              {subscription.status === 'trialing' && (
                <div className="billing-page__detail-row">
                  <span className="billing-page__detail-label">
                    Trial Ends:
                  </span>
                  <span className="billing-page__detail-value">
                    {formatDate(subscription.trial_end)}
                  </span>
                </div>
              )}

              {subscription.status === 'active' && (
                <div className="billing-page__detail-row">
                  <span className="billing-page__detail-label">
                    Next Billing Date:
                  </span>
                  <span className="billing-page__detail-value">
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
              )}

              {subscription.cancel_at_period_end && (
                <div className="billing-page__warning">
                  ⚠️ Your subscription will cancel on{' '}
                  {formatDate(subscription.current_period_end)}. You'll keep
                  access until then.
                </div>
              )}

              {subscription.status === 'past_due' && (
                <div className="billing-page__error">
                  ⚠️ Payment failed. Please update your payment method to
                  continue your subscription.
                </div>
              )}
            </div>
          )}

          {/* Free Tier Upgrade Section */}
          {isFreeTier && (
            <div className="billing-page__upgrade-section">
              <h3>Upgrade to Premium</h3>
              <p>
                Get unlimited access to all features with our 7-day free trial.
              </p>

              <div className="billing-page__promo-section">
                <input
                  type="text"
                  className="billing-page__promo-input"
                  placeholder="Enter promo code (optional)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
              </div>

              <button
                className="billing-page__upgrade-btn"
                onClick={handleUpgrade}
              >
                Start 7-Day Free Trial
              </button>

              <p className="billing-page__trial-note">
                Then $4.99/month. Cancel anytime.
              </p>
            </div>
          )}
        </div>

        {/* Usage Statistics Section */}
        <div className="billing-page__usage-card">
          <h2 className="billing-page__section-title">Usage Statistics</h2>

          {usage && (
            <div className="billing-page__usage-grid">
              <UsageIndicator
                current={usage.grocery_items_count || 0}
                limit={isPremium ? null : 20}
                feature="Grocery Items"
                showUpgrade={isFreeTier ? handleUpgrade : null}
              />

              <UsageIndicator
                current={usage.imported_recipes_count || 0}
                limit={isPremium ? null : 10}
                feature="Imported Recipes"
                showUpgrade={isFreeTier ? handleUpgrade : null}
              />

              <UsageIndicator
                current={usage.uploaded_recipes_count || 0}
                limit={isPremium ? null : 10}
                feature="Uploaded Recipes"
                showUpgrade={isFreeTier ? handleUpgrade : null}
              />

              <UsageIndicator
                current={usage.meal_logs_count || 0}
                limit={isPremium ? null : 10}
                feature="Meal Logs"
                showUpgrade={isFreeTier ? handleUpgrade : null}
              />

              <UsageIndicator
                current={usage.owned_shopping_lists_count || 0}
                limit={isPremium ? null : 5}
                feature="Shopping Lists (Owned)"
                showUpgrade={isFreeTier ? handleUpgrade : null}
              />

              <UsageIndicator
                current={usage.joined_shopping_lists_count || 0}
                limit={isPremium ? null : 1}
                feature="Shopping Lists (Joined)"
                showUpgrade={isFreeTier ? handleUpgrade : null}
              />
            </div>
          )}
        </div>

        {/* Premium Features Section */}
        {isPremium && (
          <div className="billing-page__features-card">
            <h2 className="billing-page__section-title">
              Your Premium Features
            </h2>
            <div className="billing-page__features-grid">
              <div className="billing-page__feature">
                <span className="billing-page__feature-icon">✅</span>
                <span className="billing-page__feature-text">
                  Unlimited Inventory Items
                </span>
              </div>
              <div className="billing-page__feature">
                <span className="billing-page__feature-icon">✅</span>
                <span className="billing-page__feature-text">
                  Unlimited Recipe Imports
                </span>
              </div>
              <div className="billing-page__feature">
                <span className="billing-page__feature-icon">✅</span>
                <span className="billing-page__feature-text">
                  AI Recipe Recommendations
                </span>
              </div>
              <div className="billing-page__feature">
                <span className="billing-page__feature-icon">✅</span>
                <span className="billing-page__feature-text">
                  Advanced Analytics
                </span>
              </div>
              <div className="billing-page__feature">
                <span className="billing-page__feature-icon">✅</span>
                <span className="billing-page__feature-text">
                  Unlimited Shopping Lists
                </span>
              </div>
              <div className="billing-page__feature">
                <span className="billing-page__feature-icon">✅</span>
                <span className="billing-page__feature-text">
                  Priority Support
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BillingPage;
