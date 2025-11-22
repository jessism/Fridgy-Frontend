import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import './CancelSubscriptionPage.css';

const CancelSubscriptionPage = () => {
  const navigate = useNavigate();
  const { subscription, cancelSubscription, refresh } = useSubscription();
  const [canceling, setCanceling] = useState(false);

  const handleConfirmCancel = async () => {
    try {
      setCanceling(true);
      await cancelSubscription();
      await refresh();

      // Navigate back to subscription page with success message
      navigate('/subscription', {
        state: { message: 'Subscription canceled. You can still use Pro features until your billing period ends.' }
      });
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
      setCanceling(false);
    }
  };

  const handleGoBack = () => {
    navigate('/subscription');
  };

  const trialEndDate = subscription?.billing?.date
    ? new Date(subscription.billing.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : subscription?.trial_end
      ? new Date(subscription.trial_end).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      : 'your trial period';

  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const endDate = subscription?.status === 'trialing' ? trialEndDate : currentPeriodEnd;

  return (
    <div className="cancel-subscription-page">
      {/* Header */}
      <div className="cancel-subscription-page__header">
        <button
          className="cancel-subscription-page__back-btn"
          onClick={handleGoBack}
          disabled={canceling}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="cancel-subscription-page__title">Cancel Subscription</h1>
      </div>

      <div className="cancel-subscription-page__container">
        {/* Main Message */}
        <h2 className="cancel-subscription-page__heading">
          Cancel subscription?
        </h2>

        <p className="cancel-subscription-page__description">
          You'll have access to Pro features until {endDate}.
        </p>

        {/* What You'll Lose */}
        <div className="cancel-subscription-page__features">
          <ul className="cancel-subscription-page__features-list">
            <li className="cancel-subscription-page__feature-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Unlimited inventory items</span>
            </li>
            <li className="cancel-subscription-page__feature-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Unlimited recipe imports</span>
            </li>
            <li className="cancel-subscription-page__feature-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>AI recipe generation</span>
            </li>
            <li className="cancel-subscription-page__feature-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Advanced analytics & insights</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="cancel-subscription-page__actions">
          <button
            className="cancel-subscription-page__btn cancel-subscription-page__btn--primary"
            onClick={handleGoBack}
            disabled={canceling}
          >
            Keep my subscription
          </button>
          <button
            className="cancel-subscription-page__btn cancel-subscription-page__btn--text"
            onClick={handleConfirmCancel}
            disabled={canceling}
          >
            {canceling ? 'Canceling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionPage;
