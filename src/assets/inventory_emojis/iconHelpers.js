import { CATEGORY_ICONS, CATEGORY_ALIASES } from './categoryIcons.js';
import { CATEGORY_ICONS_SVG, CATEGORY_ALIASES_SVG, renderSVGIcon } from './categoryIconsSVG.js';
import { ICONS8_CATEGORY_MAPPING, ICONS8_CATEGORY_ALIASES, renderIcons8Icon } from '../icons/icons8/icons8IconMapping.js';

/**
 * Get the appropriate SVG icon component for a given food category or item name
 * @param {string} category - The category name from the inventory item
 * @param {string} itemName - Optional item name for more specific matching
 * @param {object} props - Props to pass to the SVG icon component
 * @returns {JSX.Element} - The SVG icon component for the category
 */
export const getItemIconSVG = (category, itemName = '', props = {}) => {
  if (!category && !itemName) {
    return renderSVGIcon(CATEGORY_ICONS_SVG.Default, props);
  }

  // First, try to match based on item name for specific matches
  if (itemName) {
    const normalizedItemName = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
    
    // Check for exact item name matches
    if (CATEGORY_ICONS_SVG[normalizedItemName]) {
      return renderSVGIcon(CATEGORY_ICONS_SVG[normalizedItemName], props);
    }

    // Check for partial matches in item name
    for (const [key, IconComponent] of Object.entries(CATEGORY_ICONS_SVG)) {
      if (normalizedItemName.includes(key) || key.includes(normalizedItemName)) {
        return renderSVGIcon(IconComponent, props);
      }
    }
  }

  // Then try to match the exact category
  const normalizedCategory = category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();
  if (CATEGORY_ICONS_SVG[normalizedCategory]) {
    return renderSVGIcon(CATEGORY_ICONS_SVG[normalizedCategory], props);
  }

  // Check if it's an alias
  if (CATEGORY_ALIASES_SVG[normalizedCategory]) {
    const aliasedCategory = CATEGORY_ALIASES_SVG[normalizedCategory];
    return renderSVGIcon(CATEGORY_ICONS_SVG[aliasedCategory], props);
  }

  // Try partial matching on category
  if (category) {
    const lowerCategory = category.toLowerCase();
    for (const [key, IconComponent] of Object.entries(CATEGORY_ICONS_SVG)) {
      if (lowerCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCategory)) {
        return renderSVGIcon(IconComponent, props);
      }
    }
  }

  // Default fallback
  return renderSVGIcon(CATEGORY_ICONS_SVG.Default, props);
};

/**
 * Get the appropriate emoji icon for a given food category or item name (LEGACY)
 * @param {string} category - The category name from the inventory item
 * @param {string} itemName - Optional item name for more specific matching
 * @returns {string} - The emoji icon for the category
 */
export const getItemIcon = (category, itemName = '') => {
  if (!category && !itemName) {
    return CATEGORY_ICONS.Default;
  }

  // First, try to match based on item name for specific matches
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

  // Then try to match the exact category
  const normalizedCategory = category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();
  if (CATEGORY_ICONS[normalizedCategory]) {
    return CATEGORY_ICONS[normalizedCategory];
  }

  // Check if it's an alias
  if (CATEGORY_ALIASES[normalizedCategory]) {
    const aliasedCategory = CATEGORY_ALIASES[normalizedCategory];
    return CATEGORY_ICONS[aliasedCategory];
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
  } else if (daysUntilExpiry <= 4) {
    return { status: 'Expiring Soon', urgency: 'expiring' };
  } else if (daysUntilExpiry <= 7) {
    return { status: 'Good', urgency: 'warning' };
  } else {
    return { status: 'Good', urgency: 'good' };
  }
};

/**
 * Get the appropriate Icons8 colorful SVG icon for a given food category or item name
 * @param {string} category - The category name from the inventory item
 * @param {string} itemName - Optional item name for more specific matching
 * @param {object} props - Props to pass to the SVG icon component
 * @returns {JSX.Element} - The colorful Icons8 SVG icon component for the category
 */
export const getItemIconIcons8 = (category, itemName = '', props = {}) => {
  if (!category && !itemName) {
    return renderIcons8Icon(ICONS8_CATEGORY_MAPPING.Default, props);
  }

  // First, try to match based on item name for specific matches
  if (itemName) {
    const normalizedItemName = itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
    
    // Check for exact item name matches
    if (ICONS8_CATEGORY_MAPPING[normalizedItemName]) {
      return renderIcons8Icon(ICONS8_CATEGORY_MAPPING[normalizedItemName], props);
    }

    // Check for partial matches in item name
    for (const [key, IconComponent] of Object.entries(ICONS8_CATEGORY_MAPPING)) {
      if (normalizedItemName.includes(key) || key.includes(normalizedItemName)) {
        return renderIcons8Icon(IconComponent, props);
      }
    }
  }

  // Then try to match the exact category
  const normalizedCategory = category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();
  if (ICONS8_CATEGORY_MAPPING[normalizedCategory]) {
    return renderIcons8Icon(ICONS8_CATEGORY_MAPPING[normalizedCategory], props);
  }

  // Check if it's an alias
  if (ICONS8_CATEGORY_ALIASES[normalizedCategory]) {
    const aliasedCategory = ICONS8_CATEGORY_ALIASES[normalizedCategory];
    return renderIcons8Icon(ICONS8_CATEGORY_MAPPING[aliasedCategory], props);
  }

  // Try partial matching on category
  if (category) {
    const lowerCategory = category.toLowerCase();
    for (const [key, IconComponent] of Object.entries(ICONS8_CATEGORY_MAPPING)) {
      if (lowerCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCategory)) {
        return renderIcons8Icon(IconComponent, props);
      }
    }
  }

  // Default fallback
  return renderIcons8Icon(ICONS8_CATEGORY_MAPPING.Default, props);
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