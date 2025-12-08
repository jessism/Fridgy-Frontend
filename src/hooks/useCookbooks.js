import { useState, useCallback } from 'react';

// API base URL with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useCookbooks = () => {
  const [cookbooks, setCookbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('fridgy_token');

  // Fetch all cookbooks
  const fetchCookbooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/cookbooks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cookbooks');
      }

      const data = await response.json();
      setCookbooks(data.cookbooks || []);
      return data.cookbooks || [];
    } catch (err) {
      console.error('Error fetching cookbooks:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single cookbook with recipes
  const getCookbook = useCallback(async (cookbookId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cookbook');
      }

      const data = await response.json();
      return data.cookbook;
    } catch (err) {
      console.error('Error fetching cookbook:', err);
      throw err;
    }
  }, []);

  // Create new cookbook
  const createCookbook = async (name, description = '') => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create cookbook');
      }

      // Add to local state
      setCookbooks(prev => [data.cookbook, ...prev]);
      return data.cookbook;
    } catch (err) {
      console.error('Error creating cookbook:', err);
      throw err;
    }
  };

  // Update cookbook
  const updateCookbook = async (cookbookId, updates) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cookbook');
      }

      // Update local state
      setCookbooks(prev =>
        prev.map(cb => cb.id === cookbookId ? { ...cb, ...data.cookbook } : cb)
      );
      return data.cookbook;
    } catch (err) {
      console.error('Error updating cookbook:', err);
      throw err;
    }
  };

  // Delete cookbook
  const deleteCookbook = async (cookbookId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete cookbook');
      }

      // Remove from local state
      setCookbooks(prev => prev.filter(cb => cb.id !== cookbookId));
      return true;
    } catch (err) {
      console.error('Error deleting cookbook:', err);
      throw err;
    }
  };

  // Add recipes to cookbook
  const addRecipesToCookbook = async (cookbookId, recipes) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      // recipes should be array of { recipe_id, recipe_source }
      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}/recipes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipes })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add recipes');
      }

      // Update recipe count in local state
      setCookbooks(prev =>
        prev.map(cb => {
          if (cb.id === cookbookId) {
            return {
              ...cb,
              recipe_count: (cb.recipe_count || 0) + (data.added || 0)
            };
          }
          return cb;
        })
      );

      return data;
    } catch (err) {
      console.error('Error adding recipes to cookbook:', err);
      throw err;
    }
  };

  // Remove recipe from cookbook
  const removeRecipeFromCookbook = async (cookbookId, recipeId, recipeSource = 'saved') => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const url = `${API_BASE_URL}/cookbooks/${cookbookId}/recipes/${recipeId}?recipe_source=${recipeSource}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove recipe');
      }

      // Update recipe count in local state
      setCookbooks(prev =>
        prev.map(cb => {
          if (cb.id === cookbookId) {
            return {
              ...cb,
              recipe_count: Math.max(0, (cb.recipe_count || 1) - 1)
            };
          }
          return cb;
        })
      );

      return true;
    } catch (err) {
      console.error('Error removing recipe from cookbook:', err);
      throw err;
    }
  };

  // ============================================
  // Sharing Methods
  // ============================================

  // Generate or get share code for a cookbook
  const generateShareCode = useCallback(async (cookbookId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate share code');
      }

      return {
        shareCode: data.shareCode,
        shareLink: data.shareLink,
        cookbookName: data.cookbookName
      };
    } catch (err) {
      console.error('Error generating share code:', err);
      throw err;
    }
  }, []);

  // Join a cookbook via share code
  const joinCookbook = async (shareCode) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/join/${shareCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for limit exceeded error
        if (data.error === 'LIMIT_EXCEEDED') {
          const err = new Error(data.message);
          err.limitExceeded = true;
          err.upgradeRequired = data.upgradeRequired;
          err.current = data.current;
          err.limit = data.limit;
          throw err;
        }
        throw new Error(data.error || 'Failed to join cookbook');
      }

      // Refresh cookbooks list to include newly joined cookbook
      await fetchCookbooks();

      return {
        success: true,
        cookbook: data.cookbook,
        alreadyMember: data.alreadyMember
      };
    } catch (err) {
      console.error('Error joining cookbook:', err);
      throw err;
    }
  };

  // Get members of a cookbook
  const getMembers = useCallback(async (cookbookId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch members');
      }

      return data.members || [];
    } catch (err) {
      console.error('Error fetching members:', err);
      throw err;
    }
  }, []);

  // Remove a member from cookbook (owner only)
  const removeMember = async (cookbookId, memberId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      return true;
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  };

  // Leave a cookbook (for non-owners)
  const leaveCookbook = async (cookbookId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/cookbooks/${cookbookId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave cookbook');
      }

      // Remove from local state
      setCookbooks(prev => prev.filter(cb => cb.id !== cookbookId));
      return true;
    } catch (err) {
      console.error('Error leaving cookbook:', err);
      throw err;
    }
  };

  return {
    cookbooks,
    loading,
    error,
    fetchCookbooks,
    getCookbook,
    createCookbook,
    updateCookbook,
    deleteCookbook,
    addRecipesToCookbook,
    removeRecipeFromCookbook,
    // Sharing methods
    generateShareCode,
    joinCookbook,
    getMembers,
    removeMember,
    leaveCookbook
  };
};

export default useCookbooks;
