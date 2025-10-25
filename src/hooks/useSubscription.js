/**
 * useSubscription Hook
 * Manages subscription state and provides methods for subscription operations
 */

import { useState, useEffect, useCallback } from 'react';
import { safeJSONStringify } from '../utils/jsonSanitizer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutSecret, setCheckoutSecret] = useState(null); // For embedded checkout

  // Debug: Log checkoutSecret changes inside the hook
  useEffect(() => {
    console.log('[useSubscription HOOK] checkoutSecret state changed:', checkoutSecret ? 'Present ✅' : 'Null ❌');
  }, [checkoutSecret]);

  /**
   * Fetch subscription status and usage from backend
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      // Load cached data immediately for instant display
      const cachedSubscription = localStorage.getItem('fridgy_subscription_cache');
      const cachedUsage = localStorage.getItem('fridgy_usage_cache');

      let hasCache = false;
      if (cachedSubscription && cachedUsage) {
        try {
          setSubscription(JSON.parse(cachedSubscription));
          setUsage(JSON.parse(cachedUsage));
          setLoading(false); // Show cached data immediately
          hasCache = true;
        } catch (e) {
          console.error('[useSubscription] Error parsing cache:', e);
        }
      }

      // Only show loading if there's no cache
      if (!hasCache) {
        setLoading(true);
      }

      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        setSubscription({ tier: 'free', status: null });
        setUsage({
          grocery_items_count: 0,
          imported_recipes_count: 0,
          uploaded_recipes_count: 0,
          meal_logs_count: 0,
          owned_shopping_lists_count: 0,
          joined_shopping_lists_count: 0,
          ai_recipe_generations_count: 0,
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      setUsage(data.usage);
      setError(null);

      // Cache the fresh data
      localStorage.setItem('fridgy_subscription_cache', JSON.stringify(data.subscription));
      localStorage.setItem('fridgy_usage_cache', JSON.stringify(data.usage));
    } catch (err) {
      console.error('[useSubscription] Error fetching status:', err);
      setError(err.message);
      // Set defaults on error
      setSubscription({ tier: 'free', status: null });
      setUsage({
        grocery_items_count: 0,
        imported_recipes_count: 0,
        uploaded_recipes_count: 0,
        meal_logs_count: 0,
        owned_shopping_lists_count: 0,
        joined_shopping_lists_count: 0,
        ai_recipe_generations_count: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  /**
   * Check if user is premium (includes grandfathered users)
   */
  const isPremium = useCallback(() => {
    return subscription?.tier === 'premium' || subscription?.tier === 'grandfathered';
  }, [subscription]);

  /**
   * Check if user is free tier
   */
  const isFreeTier = useCallback(() => {
    return subscription?.tier === 'free' || !subscription?.tier;
  }, [subscription]);

  /**
   * Check if user can access a feature (based on usage limits)
   * @param {string} feature - Feature name (e.g., 'grocery_items', 'imported_recipes')
   * @returns {Object} { allowed: boolean, current: number, limit: number }
   */
  const canAccess = useCallback((feature) => {
    // Premium users have unlimited access
    if (isPremium()) {
      return { allowed: true, current: null, limit: null };
    }

    // Free tier limits
    const limits = {
      grocery_items: 20,
      imported_recipes: 10,
      uploaded_recipes: 10,
      meal_logs: Infinity, // Unlimited - historical tracking
      owned_shopping_lists: 5,
      joined_shopping_lists: 1,
      ai_recipes: 0, // Not allowed
      analytics: 0, // Not allowed
    };

    const current = usage?.[`${feature}_count`] || 0;
    const limit = limits[feature];

    return {
      allowed: current < limit,
      current,
      limit,
    };
  }, [isPremium, usage]);

  /**
   * Start Stripe Checkout flow
   * @param {string|null} promoCode - Optional promo code
   * @param {string|null} returnUrl - URL to return to on cancel (defaults to current path)
   */
  const startCheckout = useCallback(async (promoCode = null, returnUrl = null) => {
    try {
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        throw new Error('User not authenticated');
      }

      // Use provided returnUrl or current path
      const cancelReturnUrl = returnUrl || window.location.pathname;

      console.log('[useSubscription] Creating checkout session...');

      const response = await fetch(`${API_BASE_URL}/subscriptions/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: safeJSONStringify({ promoCode, returnUrl: cancelReturnUrl }),
      });

      console.log('[useSubscription] Checkout response status:', response.status);

      const data = await response.json();
      console.log('[useSubscription] Checkout response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.clientSecret) {
        // Use embedded checkout (show modal in-app)
        console.log('[useSubscription] ✅ Got clientSecret, setting state...');
        setCheckoutSecret(data.clientSecret);
        console.log('[useSubscription] ✅ CheckoutSecret state set!');
      } else if (data.url) {
        // Fallback to redirect (shouldn't happen with embedded mode)
        console.warn('[useSubscription] ⚠️ Got URL instead of clientSecret, redirecting...');
        window.location.href = data.url;
      } else {
        console.error('[useSubscription] ❌ No clientSecret or URL in response!', data);
      }
    } catch (err) {
      console.error('[useSubscription] Checkout error:', err);
      throw err;
    }
  }, []);

  /**
   * Open Stripe Customer Portal for billing management
   */
  const openBillingPortal = useCallback(async () => {
    try {
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/create-portal-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to open billing portal');
      }

      if (data.url) {
        // Open portal in new tab
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('[useSubscription] Portal error:', err);
      throw err;
    }
  }, []);

  /**
   * Cancel subscription (access remains until end of billing period)
   */
  const cancelSubscription = useCallback(async () => {
    try {
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      // Refresh subscription status
      await fetchSubscriptionStatus();

      return data;
    } catch (err) {
      console.error('[useSubscription] Cancel error:', err);
      throw err;
    }
  }, [fetchSubscriptionStatus]);

  /**
   * Reactivate canceled subscription
   */
  const reactivateSubscription = useCallback(async () => {
    try {
      const token = localStorage.getItem('fridgy_token');

      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/subscriptions/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reactivate subscription');
      }

      // Refresh subscription status
      await fetchSubscriptionStatus();

      return data;
    } catch (err) {
      console.error('[useSubscription] Reactivate error:', err);
      throw err;
    }
  }, [fetchSubscriptionStatus]);

  /**
   * Validate promo code
   * @param {string} code - Promo code to validate
   */
  const validatePromoCode = useCallback(async (code) => {
    try {
      const token = localStorage.getItem('fridgy_token');

      const response = await fetch(`${API_BASE_URL}/subscriptions/validate-promo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: safeJSONStringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid promo code');
      }

      return data;
    } catch (err) {
      console.error('[useSubscription] Validate promo error:', err);
      throw err;
    }
  }, []);

  return {
    // State
    subscription,
    usage,
    loading,
    error,

    // Computed values
    isPremium: isPremium(),
    isFreeTier: isFreeTier(),

    // Methods
    canAccess,
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
    validatePromoCode,
    refresh: fetchSubscriptionStatus,

    // Embedded checkout state
    checkoutSecret,
    closeCheckout: () => setCheckoutSecret(null),
  };
}
