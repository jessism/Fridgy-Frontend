import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenerateGroceryListModal.css';

// API base URL with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GenerateGroceryListModal = ({ isOpen, onClose, onSuccess, initialStartDate, initialEndDate }) => {
  const navigate = useNavigate();

  // State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [listName, setListName] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Get auth token
  const getAuthToken = () => localStorage.getItem('fridgy_token');

  // Get week range helper
  const getWeekRange = useCallback((weeksFromNow = 0, numWeeks = 1) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (weeksFromNow * 7));

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + (numWeeks * 7) - 1);

    return {
      start: formatDateForInput(startOfWeek),
      end: formatDateForInput(endOfWeek)
    };
  }, []);

  // Format date for input element (using local date to avoid timezone issues)
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const d = new Date(dateString + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Initialize dates when modal opens - use passed dates or fall back to current week
  useEffect(() => {
    if (isOpen) {
      if (initialStartDate && initialEndDate) {
        // Use the visible week from meal plan page
        setStartDate(formatDateForInput(initialStartDate));
        setEndDate(formatDateForInput(initialEndDate));
      } else {
        // Fall back to current week
        const { start, end } = getWeekRange(0);
        setStartDate(start);
        setEndDate(end);
      }
      setPreview(null);
      setError(null);
      setExpandedCategories({});
    }
  }, [isOpen, initialStartDate, initialEndDate, getWeekRange]);

  // Auto-generate list name when dates change
  useEffect(() => {
    if (startDate) {
      const weekOf = formatDateForDisplay(startDate);
      setListName(`Week of ${weekOf} Groceries`);
    }
  }, [startDate]);

  // Fetch preview when dates change
  const fetchPreview = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/meal-plans/generate-grocery-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate })
      });

      if (!response.ok) {
        throw new Error('Failed to load ingredients');
      }

      const data = await response.json();
      setPreview(data);

      // Expand all categories by default
      if (data.ingredients) {
        const expanded = {};
        Object.keys(data.ingredients).forEach(cat => {
          expanded[cat] = true;
        });
        setExpandedCategories(expanded);
      }
    } catch (err) {
      console.error('Error fetching preview:', err);
      setError(err.message || 'Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Fetch preview when dates change (with debounce)
  useEffect(() => {
    if (startDate && endDate && isOpen) {
      const timer = setTimeout(() => {
        fetchPreview();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [startDate, endDate, isOpen, fetchPreview]);

  // Handle preset buttons
  const handlePreset = (preset) => {
    let range;
    switch (preset) {
      case 'thisWeek':
        range = getWeekRange(0);
        break;
      case 'nextWeek':
        range = getWeekRange(1);
        break;
      case 'twoWeeks':
        range = getWeekRange(0, 2);
        break;
      default:
        return;
    }
    setStartDate(range.start);
    setEndDate(range.end);
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Create the grocery list
  const handleCreate = async () => {
    if (!listName.trim()) {
      setError('Please enter a list name');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/meal-plans/generate-grocery-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          list_name: listName.trim(),
          list_color: '#c3f0ca'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create list');
      }

      const data = await response.json();

      if (data.success && data.list) {
        if (onSuccess) {
          onSuccess(data.list);
        }
        onClose();
        // Navigate to the new shopping list
        navigate(`/shopping-list/${data.list.id}`);
      }
    } catch (err) {
      console.error('Error creating grocery list:', err);
      setError(err.message || 'Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  // Count total items
  const getTotalItems = () => {
    if (!preview?.ingredients) return 0;
    return Object.values(preview.ingredients).reduce((sum, items) => sum + items.length, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="generate-grocery-modal__overlay" onClick={onClose}>
      <div className="generate-grocery-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="generate-grocery-modal__header">
          <h2 className="generate-grocery-modal__title">Create Grocery List</h2>
          <button className="generate-grocery-modal__close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="generate-grocery-modal__content">
          {/* Date Range Section */}
          <div className="generate-grocery-modal__section">
            <label className="generate-grocery-modal__label">Date Range</label>
            <div className="generate-grocery-modal__date-inputs">
              <input
                type="date"
                className="generate-grocery-modal__date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="generate-grocery-modal__date-separator">to</span>
              <input
                type="date"
                className="generate-grocery-modal__date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="generate-grocery-modal__presets">
              <button
                className="generate-grocery-modal__preset-btn"
                onClick={() => handlePreset('thisWeek')}
              >
                This Week
              </button>
              <button
                className="generate-grocery-modal__preset-btn"
                onClick={() => handlePreset('nextWeek')}
              >
                Next Week
              </button>
              <button
                className="generate-grocery-modal__preset-btn"
                onClick={() => handlePreset('twoWeeks')}
              >
                2 Weeks
              </button>
            </div>
          </div>

          {/* List Name Section */}
          <div className="generate-grocery-modal__section">
            <label className="generate-grocery-modal__label">List Name</label>
            <input
              type="text"
              className="generate-grocery-modal__name-input"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name..."
            />
          </div>

          {/* Preview Section */}
          <div className="generate-grocery-modal__section">
            <label className="generate-grocery-modal__label">
              Preview
              {preview && !loading && (
                <span className="generate-grocery-modal__preview-count">
                  {getTotalItems()} items from {preview.recipe_count || 0} recipes
                </span>
              )}
            </label>

            <div className="generate-grocery-modal__preview">
              {loading ? (
                <div className="generate-grocery-modal__loading">
                  <div className="generate-grocery-modal__spinner"></div>
                  <span>Loading ingredients...</span>
                </div>
              ) : preview && Object.keys(preview.ingredients || {}).length > 0 ? (
                <div className="generate-grocery-modal__categories">
                  {Object.entries(preview.ingredients).map(([category, items]) => (
                    <div key={category} className="generate-grocery-modal__category">
                      <button
                        className="generate-grocery-modal__category-header"
                        onClick={() => toggleCategory(category)}
                      >
                        <span className="generate-grocery-modal__category-arrow">
                          {expandedCategories[category] ? '▼' : '▶'}
                        </span>
                        <span className="generate-grocery-modal__category-name">
                          {category}
                        </span>
                        <span className="generate-grocery-modal__category-count">
                          ({items.length})
                        </span>
                      </button>
                      {expandedCategories[category] && (
                        <ul className="generate-grocery-modal__items">
                          {items.map((item, idx) => (
                            <li key={idx} className="generate-grocery-modal__item">
                              <span className="generate-grocery-modal__item-quantity">
                                {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                              </span>
                              <span className="generate-grocery-modal__item-name">
                                {item.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : preview && preview.meal_count === 0 ? (
                <div className="generate-grocery-modal__empty">
                  <span>No meals planned for this date range</span>
                  <p>Add recipes to your meal plan first</p>
                </div>
              ) : (
                <div className="generate-grocery-modal__empty">
                  <span>Select dates to see ingredients</span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="generate-grocery-modal__error">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="generate-grocery-modal__footer">
          <button
            className="generate-grocery-modal__button generate-grocery-modal__button--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="generate-grocery-modal__button generate-grocery-modal__button--primary"
            onClick={handleCreate}
            disabled={creating || loading || getTotalItems() === 0}
          >
            {creating ? 'Creating...' : 'Create Grocery List'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateGroceryListModal;
