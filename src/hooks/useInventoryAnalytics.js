import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useInventoryAnalytics = (days = 30) => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    itemsConsumed: 0,
    itemsWasted: 0,
    valueSaved: 0,
    usagePercentage: 0,
    previousPeriod: {
      itemsConsumed: 0,
      itemsWasted: 0,
      valueSaved: 0,
      usagePercentage: 0
    },
    categoryBreakdown: {},
    mostUsedItems: [],
    period: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (selectedDays) => {
    if (!user?.token) {
      console.log('No user token available for analytics');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📊 Fetching inventory analytics for ${selectedDays} days...`);
      
      const response = await fetch(
        `${API_BASE_URL}/inventory-analytics/usage?days=${selectedDays}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('📊 Analytics data received:', result.data);
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }

    } catch (err) {
      console.error('Error fetching inventory analytics:', err);
      setError(err.message);
      
      // Set empty state on error
      setAnalyticsData({
        itemsConsumed: 0,
        itemsWasted: 0,
        valueSaved: 0,
        usagePercentage: 0,
        previousPeriod: {
          itemsConsumed: 0,
          itemsWasted: 0,
          valueSaved: 0,
          usagePercentage: 0
        },
        categoryBreakdown: {},
        mostUsedItems: [],
        period: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch analytics when user, days, or component mounts
  useEffect(() => {
    fetchAnalytics(days);
  }, [user?.token, days]);

  // Function to refresh analytics (useful for manual refresh)
  const refreshAnalytics = () => {
    console.log('🔄 Manual refresh called from component');
    fetchAnalytics(days);
  };

  // Function to test with mock data (debugging)
  const testMockData = () => {
    console.log('🧪 Testing with mock data...');
    
    const mockAnalyticsData = {
      itemsConsumed: 15,
      itemsWasted: 3,
      valueSaved: 45.80,
      usagePercentage: 83,
      previousPeriod: {
        itemsConsumed: 12,
        itemsWasted: 5,
        valueSaved: 38.20,
        usagePercentage: 71
      },
      categoryBreakdown: {
        'Vegetables': 35,
        'Protein': 25,
        'Fruits': 20,
        'Dairy': 15,
        'Other': 5
      },
      mostUsedItems: [
        { itemName: 'Chicken Breast', count: 4, avgDays: 2 },
        { itemName: 'Broccoli', count: 3, avgDays: 3 },
        { itemName: 'Milk', count: 2, avgDays: 1 }
      ],
      period: {
        days: days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    };
    
    console.log('🧪 Setting mock data:', mockAnalyticsData);
    setAnalyticsData(mockAnalyticsData);
    setIsLoading(false);
    setError(null);
  };

  // Function to change date range
  const changeDateRange = (newDays) => {
    fetchAnalytics(newDays);
  };

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics,
    changeDateRange,
    testMockData // DEBUG: Export mock data function
  };
};

export default useInventoryAnalytics;