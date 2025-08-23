/**
 * JSON Sanitizer Utility
 * 
 * Fixes invalid Unicode characters and encoding issues that can cause
 * "invalid JSON" errors when sending data to APIs.
 */

/**
 * Sanitizes a string by removing invalid Unicode characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove invalid Unicode surrogate pairs and control characters
  return str
    // Remove unpaired high surrogates (U+D800–U+DBFF)
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '')
    // Remove unpaired low surrogates (U+DC00–U+DFFF)
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    // Remove null bytes and control characters (except tab, newline, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove replacement characters
    .replace(/\uFFFD/g, '')
    // Normalize Unicode
    .normalize('NFC');
};

/**
 * Recursively sanitizes an object by cleaning all string values
 * @param {any} obj - Object to sanitize
 * @returns {any} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Safe JSON.stringify that sanitizes data first
 * @param {any} data - Data to stringify
 * @param {function} replacer - Optional replacer function
 * @param {string|number} space - Optional space parameter
 * @returns {string} Safe JSON string
 */
export const safeJSONStringify = (data, replacer = null, space = null) => {
  try {
    // First sanitize the data
    const sanitized = sanitizeObject(data);
    
    // Then stringify with error handling
    return JSON.stringify(sanitized, replacer, space);
  } catch (error) {
    console.error('JSON stringify error:', error);
    console.error('Problematic data:', data);
    
    // Fallback: try to stringify without problematic characters
    try {
      const fallback = sanitizeObject(data);
      return JSON.stringify(fallback);
    } catch (fallbackError) {
      console.error('Fallback JSON stringify also failed:', fallbackError);
      // Return a safe empty object as last resort
      return '{}';
    }
  }
};

/**
 * Validates if a string is valid JSON
 * @param {string} str - String to validate
 * @returns {boolean} True if valid JSON
 */
export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Safe JSON.parse with error handling
 * @param {string} str - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed object or fallback
 */
export const safeJSONParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

// Export utilities
export default {
  sanitizeString,
  sanitizeObject,
  safeJSONStringify,
  isValidJSON,
  safeJSONParse
};