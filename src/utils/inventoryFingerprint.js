/**
 * Inventory Fingerprinting Utility
 * 
 * Generates a deterministic hash from inventory items to detect meaningful changes.
 * Used to determine when recipe suggestions should be refreshed.
 * 
 * Changes that trigger new fingerprint:
 * - Items added/removed
 * - Category changes
 * - Expiry status changes (fresh -> expiring -> expired)
 * 
 * Changes that DON'T trigger new fingerprint:
 * - Minor quantity adjustments
 * - Exact expiry date changes (if status unchanged)
 * - Item order changes
 */

/**
 * Simple hash function for generating fingerprints
 * @param {string} str - String to hash
 * @returns {string} Hash string
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Determines the expiry status of an item
 * @param {string} expiryDate - ISO date string
 * @returns {string} Status: 'fresh', 'expiring', or 'expired'
 */
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return 'unknown';
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 3) return 'expiring';
  return 'fresh';
};

/**
 * Normalizes quantity to detect significant changes only
 * @param {number|string} quantity - Item quantity
 * @returns {string} Normalized quantity category
 */
const normalizeQuantity = (quantity) => {
  const num = typeof quantity === 'string' ? 
    parseFloat(quantity.replace(/[^0-9.]/g, '')) : quantity;
  
  if (isNaN(num) || num <= 0) return 'empty';
  if (num <= 2) return 'low';
  if (num <= 5) return 'medium';
  return 'high';
};

/**
 * Generates a fingerprint from inventory items
 * @param {Array} items - Array of inventory items
 * @returns {string} Fingerprint hash representing inventory state
 */
export const generateInventoryFingerprint = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 'empty-inventory';
  }
  
  try {
    // Create normalized representation of each item
    const normalizedItems = items.map(item => {
      const name = (item.itemName || item.name || '').toLowerCase().trim();
      const category = (item.category || 'uncategorized').toLowerCase().trim();
      const expiryStatus = getExpiryStatus(item.expiryDate || item.expiry_date);
      const quantityCategory = normalizeQuantity(item.quantity);
      
      // Only include if item has a name (valid item)
      if (!name) return null;
      
      return `${name}|${category}|${expiryStatus}|${quantityCategory}`;
    })
    .filter(item => item !== null) // Remove invalid items
    .sort(); // Sort for consistency
    
    // Generate fingerprint from normalized items
    const fingerprintString = normalizedItems.join('::');
    const hash = simpleHash(fingerprintString);
    
    // Include item count in fingerprint for additional differentiation
    return `${hash}-${normalizedItems.length}`;
    
  } catch (error) {
    console.error('Error generating inventory fingerprint:', error);
    // Return a fallback that will trigger refresh
    return `error-${Date.now()}`;
  }
};

/**
 * Compares two fingerprints to determine if inventory has changed
 * @param {string} fingerprint1 - First fingerprint
 * @param {string} fingerprint2 - Second fingerprint
 * @returns {boolean} True if fingerprints are different
 */
export const hasInventoryChanged = (fingerprint1, fingerprint2) => {
  // Treat null/undefined as changed
  if (!fingerprint1 || !fingerprint2) return true;
  
  return fingerprint1 !== fingerprint2;
};

/**
 * Extracts item count from fingerprint
 * @param {string} fingerprint - Inventory fingerprint
 * @returns {number} Number of items in inventory
 */
export const getItemCountFromFingerprint = (fingerprint) => {
  if (!fingerprint || fingerprint === 'empty-inventory') return 0;
  
  const parts = fingerprint.split('-');
  const count = parseInt(parts[parts.length - 1], 10);
  
  return isNaN(count) ? 0 : count;
};

/**
 * Generates a cache key combining user ID and inventory fingerprint
 * @param {string} userId - User identifier
 * @param {string} fingerprint - Inventory fingerprint
 * @returns {string} Cache key for storing recipes
 */
export const generateCacheKey = (userId, fingerprint) => {
  if (!userId) return null;
  return `recipes_${userId}_${fingerprint}`;
};

// Export all utilities
export default {
  generateInventoryFingerprint,
  hasInventoryChanged,
  getItemCountFromFingerprint,
  generateCacheKey
};