import { CATEGORY_ICONS, CATEGORY_ALIASES } from './categoryIcons.js';

/**
 * Get the appropriate emoji icon for a given food category or item name
 * @param {string} category - The category name from the inventory item
 * @param {string} itemName - Optional item name for more specific matching
 * @returns {string} - The emoji icon for the category
 */
export const getItemIcon = (category, itemName = '') => {
  if (!category && !itemName) {
    return CATEGORY_ICONS.Default;
  }

  // First, try to match the exact category
  const normalizedCategory = category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();
  if (CATEGORY_ICONS[normalizedCategory]) {
    return CATEGORY_ICONS[normalizedCategory];
  }

  // Check if it's an alias
  if (CATEGORY_ALIASES[normalizedCategory]) {
    const aliasedCategory = CATEGORY_ALIASES[normalizedCategory];
    return CATEGORY_ICONS[aliasedCategory];
  }

  // Try to match based on item name if category doesn't match
  if (itemName) {
    const normalizedItemName = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
    
    // Check for exact item name matches
    if (CATEGORY_ICONS[normalizedItemName]) {
      return CATEGORY_ICONS[normalizedItemName];
    }

    // Check for partial matches in item name
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (normalizedItemName.includes(key) || key.includes(normalizedItemName)) {
        return icon;
      }
    }
  }

  // Try partial matching on category
  if (category) {
    const lowerCategory = category.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lowerCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCategory)) {
        return icon;
      }
    }
  }

  // Default fallback
  return CATEGORY_ICONS.Default;
};

/**
 * Get status color based on expiry days
 * @param {number} daysUntilExpiry - Days until expiration (negative if expired)
 * @returns {string} - Status string with appropriate urgency
 */
export const getExpiryStatus = (daysUntilExpiry) => {
  if (daysUntilExpiry < 0) {
    return { status: 'Expired', urgency: 'expired' };
  } else if (daysUntilExpiry <= 3) {
    return { status: 'Expiring Soon', urgency: 'expiring' };
  } else if (daysUntilExpiry <= 7) {
    return { status: 'Good', urgency: 'warning' };
  } else {
    return { status: 'Good', urgency: 'good' };
  }
};

/**
 * Format quantity for display in compact form
 * @param {string|number} quantity - The quantity value
 * @returns {string} - Formatted quantity string
 */
export const formatQuantity = (quantity) => {
  if (!quantity) return 'N/A';
  
  // If it's already a string with units, return as is
  if (typeof quantity === 'string' && /[a-zA-Z]/.test(quantity)) {
    return quantity;
  }
  
  // If it's just a number, add 'qty' prefix
  return `${quantity}`;
};