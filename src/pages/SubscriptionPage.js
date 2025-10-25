import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { CheckoutModal } from '../components/modals/CheckoutModal';
import './SubscriptionPage.css';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    subscription,
    usage,
    loading,
    isPremium,
    isFreeTier,
    openBillingPortal,
    startCheckout,
    checkoutSecret,
    closeCheckout,
  } = useSubscription();

  const [promoCode, setPromoCode] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="subscription-page__loading">
          <div className="loading-spinner"></div>
          <p>Loading your subscription...</p>
        </div>
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

  const getUsagePercentage = (current, limit) => {
    if (!limit) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'yellow';
    return 'green';
  };

  return (
    <div className="subscription-page">
      {/* Header */}
      <div className="subscription-page__header">
        <button className="subscription-page__back-btn" onClick={() => navigate('/profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="subscription-page__title">Manage Subscription</h1>
      </div>

      <div className="subscription-page__container">

        {/* Current Plan Hero Section */}
        {isPremium ? (
          /* Premium User Card - Golden gradient */
          <div className="subscription-page__hero" style={{
            background: 'linear-gradient(135deg, #f39c12 0%, #ffd700 50%, #fff4a3 100%)',
            borderRadius: '20px',
            padding: '20px',
            color: '#222222',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px'
          }}>
            <div style={{ marginBottom: '10px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '2px', fontWeight: '500' }}>
                {user?.email || 'user@trackabite.com'}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#222222' }}>
                Trackabite Pro
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '10px',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '6px', fontWeight: '500' }}>Details:</div>
                <div style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap' }}>$4.99/month</div>
              </div>
              {subscription?.status === 'trialing' && subscription.trial_end && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '6px', fontWeight: '500' }}>Trial ends:</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {new Date(subscription.trial_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
              {subscription?.status === 'active' && subscription.current_period_end && subscription.tier !== 'grandfathered' && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '6px', fontWeight: '500' }}>Renews:</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '10px', lineHeight: '1.4' }}>
              {subscription?.status === 'trialing'
                ? `You're on a 7-day free trial. Your card will be charged $4.99 on ${new Date(subscription.trial_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
                : subscription?.tier === 'grandfathered'
                  ? 'You have lifetime premium access as an early supporter. Thank you!'
                  : `Subscribed through Trackabite. Your next charge will be $4.99 on ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`}
            </div>

            {subscription?.tier !== 'grandfathered' && (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '12px',
                  color: '#222222',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  opacity: 0.8
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.28)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.opacity = '1';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.18)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.opacity = '0.8';
                }}
              >
                {portalLoading ? 'Opening...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        ) : (
          /* Free User - Pro Pitch Card */
          <div className="subscription-page__hero" style={{
            background: 'linear-gradient(135deg, rgba(129, 224, 83, 0.12) 0%, rgba(107, 201, 63, 0.08) 100%)',
            borderRadius: '20px',
            padding: '28px 24px',
            color: '#222222',
            boxShadow: '0 4px 12px rgba(129, 224, 83, 0.15)',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid rgba(129, 224, 83, 0.2)'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: '13px',
                opacity: 0.7,
                marginBottom: '8px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                color: '#666'
              }}>
                UPGRADE TO
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '12px',
                lineHeight: '1.2',
                color: '#222222'
              }}>
                Trackabite Pro
              </div>
              <p style={{
                fontSize: '15px',
                color: '#222222',
                marginBottom: '20px',
                lineHeight: '1.5',
                opacity: 0.85
              }}>
                Unlock unlimited inventory, AI recipes, and advanced analytics
              </p>

              {/* Benefits Checklist */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '20px'
              }}>
                {[
                  'Unlimited inventory items',
                  'Unlimited recipe imports',
                  'AI recipe generation',
                  'Advanced analytics & insights',
                  'Unlimited shopping lists',
                  'Priority support'
                ].map(benefit => (
                  <div key={benefit} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#81e053"/>
                      <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#222222' }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpgrade}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#81e053',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '17px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(129, 224, 83, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#6bc93f';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#81e053';
                }}
              >
                Start 7-Day Free Trial
              </button>
              <p style={{
                fontSize: '12px',
                opacity: 0.7,
                marginTop: '12px',
                marginBottom: 0,
                textAlign: 'center',
                color: '#666'
              }}>
                Then $4.99/month • Cancel anytime
              </p>
            </div>
          </div>
        )}

        {/* Usage Statistics Section */}
        <div className="subscription-page__usage">
          <button
            className="subscription-page__comparison-header"
            onClick={() => setShowUsage(!showUsage)}
          >
            <h2 className="subscription-page__section-title">Your Usage</h2>
            <svg
              className={`comparison-arrow ${showUsage ? 'comparison-arrow--expanded' : ''}`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showUsage && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px'
            }}>
              {/* Compact Usage List */}
              {[
                { name: 'Inventory Items', count: usage?.grocery_items_count || 0, limit: 20 },
                { name: 'Recipe Imports', count: usage?.imported_recipes_count || 0, limit: 10 },
                { name: 'Shopping Lists', count: usage?.owned_shopping_lists_count || 0, limit: 5 },
                { name: 'Meal Logs', count: usage?.meal_logs_count || 0, limit: null }
              ].map((item, index) => (
                <div key={item.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < 3 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>
                    {!item.limit || isPremium
                      ? item.count
                      : `${item.count} / ${item.limit}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Comparison Section */}
        <div className="subscription-page__comparison">
          <button
            className="subscription-page__comparison-header"
            onClick={() => setShowComparison(!showComparison)}
          >
            <h2 className="subscription-page__section-title">Compare Plans</h2>
            <svg
              className={`comparison-arrow ${showComparison ? 'comparison-arrow--expanded' : ''}`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showComparison && (
            <div className="comparison-table">
              {/* Table Header */}
              <div className="comparison-table__header">
                <div className="comparison-table__cell comparison-table__cell--feature"></div>
                <div className="comparison-table__cell comparison-table__cell--plan">
                  <h3>Free</h3>
                  <p className="plan-price">$0/month</p>
                </div>
                <div className="comparison-table__cell comparison-table__cell--plan comparison-table__cell--premium">
                  <h3>Pro</h3>
                  <p className="plan-price">$4.99/month</p>
                </div>
              </div>

              {/* Feature Rows */}
              <div className="comparison-table__row">
                <div className="comparison-table__cell comparison-table__cell--feature">Inventory Items</div>
                <div className="comparison-table__cell">20 items</div>
                <div className="comparison-table__cell comparison-table__cell--premium">Unlimited</div>
              </div>

              <div className="comparison-table__row">
                <div className="comparison-table__cell comparison-table__cell--feature">Recipe Imports</div>
                <div className="comparison-table__cell">10 recipes</div>
                <div className="comparison-table__cell comparison-table__cell--premium">Unlimited</div>
              </div>

              <div className="comparison-table__row">
                <div className="comparison-table__cell comparison-table__cell--feature">Shopping Lists</div>
                <div className="comparison-table__cell">5 lists</div>
                <div className="comparison-table__cell comparison-table__cell--premium">Unlimited</div>
              </div>

              <div className="comparison-table__row">
                <div className="comparison-table__cell comparison-table__cell--feature">Meal Tracking</div>
                <div className="comparison-table__cell">
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                    <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="comparison-table__cell comparison-table__cell--premium">
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                    <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="comparison-table__row">
                <div className="comparison-table__cell comparison-table__cell--feature">AI Recipe Generation</div>
                <div className="comparison-table__cell">
                  <svg className="x-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#e0e0e0"/>
                    <path d="M7 7L13 13M13 7L7 13" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="comparison-table__cell comparison-table__cell--premium">
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                    <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="comparison-table__row">
                <div className="comparison-table__cell comparison-table__cell--feature">Advanced Analytics</div>
                <div className="comparison-table__cell">
                  <svg className="x-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#e0e0e0"/>
                    <path d="M7 7L13 13M13 7L7 13" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="comparison-table__cell comparison-table__cell--premium">
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                    <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="comparison-table__row">
                <div className="comparison-table__cell comparison-table__cell--feature">Priority Support</div>
                <div className="comparison-table__cell">
                  <svg className="x-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#e0e0e0"/>
                    <path d="M7 7L13 13M13 7L7 13" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="comparison-table__cell comparison-table__cell--premium">
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#4fcf61"/>
                    <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* CTA Row for Free Users */}
              {isFreeTier && (
                <div className="comparison-table__cta-row">
                  <div className="comparison-table__cell"></div>
                  <div className="comparison-table__cell"></div>
                  <div className="comparison-table__cell comparison-table__cell--premium">
                    <button className="plan-card__btn plan-card__btn--primary" onClick={handleUpgrade}>
                      Start Free Trial
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Checkout Modal */}
      {checkoutSecret && (
        <CheckoutModal
          clientSecret={checkoutSecret}
          onClose={closeCheckout}
        />
      )}
    </div>
  );
};

export default SubscriptionPage;
