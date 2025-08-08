import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';

// API base URL - adjust for your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('fridgy_token');
  };

  // API request helper with authentication
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  };

  // Fetch inventory items
  const fetchInventory = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching inventory for user:', user.id);
      
      const response = await apiRequest('/inventory');
      
      if (response.success) {
        console.log('✅ Inventory fetched successfully:', response.items);
        setItems(response.items || []);
      } else {
        throw new Error(response.error || 'Failed to fetch inventory');
      }
    } catch (err) {
      console.error('❌ Error fetching inventory:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update an inventory item
  const updateItem = async (itemId, updateData) => {
    try {
      setError(null);
      
      console.log('🔄 Updating item:', itemId, updateData);
      
      const response = await apiRequest(`/inventory/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        console.log('✅ Item updated successfully:', response.item);
        // Refresh inventory after update
        await fetchInventory();
        return response.item;
      } else {
        throw new Error(response.error || 'Failed to update item');
      }
    } catch (err) {
      console.error('❌ Error updating item:', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete an inventory item with analytics
  const deleteItem = async (itemId, deleteReason = 'unknown') => {
    try {
      setError(null);
      
      console.log('🔄 Deleting item:', itemId, 'with reason:', deleteReason);
      
      const response = await apiRequest(`/inventory/${itemId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          deleteReason: deleteReason
        }),
      });

      if (response.success) {
        console.log('✅ Item deleted successfully with analytics:', response.analytics);
        // Refresh inventory after deletion
        await fetchInventory();
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('❌ Error deleting item:', err);
      setError(err.message);
      throw err;
    }
  };

  // Refresh inventory data
  const refreshInventory = useCallback(() => {
    console.log('🔄 Refreshing inventory...');
    fetchInventory();
  }, [fetchInventory]);

  // Fetch inventory on mount and when user changes
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    items,
    loading,
    error,
    updateItem,
    deleteItem,
    refreshInventory,
    fetchInventory
  };
};

export default useInventory;