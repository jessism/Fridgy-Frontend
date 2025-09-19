import { useState, useEffect, useCallback } from 'react';

// API base URL with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useShoppingLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('fridgy_token');

  // Fetch all shopping lists
  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/shopping-lists`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shopping lists');
      }

      const data = await response.json();
      setLists(data.lists || []);
    } catch (err) {
      console.error('Error fetching shopping lists:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new shopping list
  const createList = async (name, color = '#c3f0ca', items = []) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, color, items })
      });

      if (!response.ok) {
        throw new Error('Failed to create shopping list');
      }

      const data = await response.json();
      await fetchLists(); // Refresh the list
      return data.list;
    } catch (err) {
      console.error('Error creating shopping list:', err);
      throw err;
    }
  };

  // Get a single shopping list with items
  const getList = useCallback(async (listId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shopping list');
      }

      const data = await response.json();
      return data.list;
    } catch (err) {
      console.error('Error fetching shopping list:', err);
      throw err;
    }
  }, []);

  // Update a shopping list
  const updateList = async (listId, updates) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update shopping list');
      }

      await fetchLists(); // Refresh the list
    } catch (err) {
      console.error('Error updating shopping list:', err);
      throw err;
    }
  };

  // Delete a shopping list
  const deleteList = async (listId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete shopping list');
      }

      await fetchLists(); // Refresh the list
    } catch (err) {
      console.error('Error deleting shopping list:', err);
      throw err;
    }
  };

  // Add item to shopping list
  const addItem = async (listId, item) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const data = await response.json();
      console.log('[useShoppingLists] Item added successfully:', data.item);
      return data.item;
    } catch (err) {
      console.error('Error adding item:', err);
      throw err;
    }
  };

  // Update item in shopping list
  const updateItem = async (listId, itemId, updates) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const data = await response.json();
      return data.item;
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  };

  // Toggle item checked status
  const toggleItem = async (listId, itemId) => {
    console.log('[useShoppingLists] toggleItem called:', { listId, itemId });

    try {
      const token = getAuthToken();
      console.log('[useShoppingLists] Auth token present:', !!token);
      if (!token) throw new Error('Not authenticated');

      const url = `${API_BASE_URL}/shopping-lists/${listId}/items/${itemId}/toggle`;
      console.log('[useShoppingLists] Making request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[useShoppingLists] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[useShoppingLists] Error response:', errorText);
        throw new Error(`Failed to toggle item: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[useShoppingLists] Toggle response data:', data);
      return data.item;
    } catch (err) {
      console.error('[useShoppingLists] Error toggling item:', err);
      throw err;
    }
  };

  // Delete item from shopping list
  const deleteItem = async (listId, itemId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  };

  // Clear completed items
  const clearCompleted = async (listId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/clear-completed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear completed items');
      }

      const data = await response.json();
      return data.cleared;
    } catch (err) {
      console.error('Error clearing completed items:', err);
      throw err;
    }
  };

  // Share list with users
  const shareList = async (listId, emails) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails })
      });

      if (!response.ok) {
        throw new Error('Failed to share list');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error sharing list:', err);
      throw err;
    }
  };

  // Join list via share code
  const joinList = async (shareCode) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/join/${shareCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid share code');
      }

      const data = await response.json();
      await fetchLists(); // Refresh lists after joining
      return data;
    } catch (err) {
      console.error('Error joining list:', err);
      throw err;
    }
  };

  // Move checked items to inventory
  const moveToInventory = async (listId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/purchase-to-inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to move items to inventory');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error moving items to inventory:', err);
      throw err;
    }
  };

  // Migrate local lists to database (one-time migration)
  const migrateLists = async (localLists) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/shopping-lists/migrate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lists: localLists })
      });

      if (!response.ok) {
        throw new Error('Failed to migrate lists');
      }

      const data = await response.json();
      await fetchLists(); // Refresh lists after migration
      return data;
    } catch (err) {
      console.error('Error migrating lists:', err);
      throw err;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchLists();
    }
  }, [fetchLists]);

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    getList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    clearCompleted,
    shareList,
    joinList,
    moveToInventory,
    migrateLists
  };
};

export default useShoppingLists;