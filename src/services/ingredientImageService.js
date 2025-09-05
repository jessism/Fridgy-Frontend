import { getItemIconIcons8 } from '../assets/inventory_emojis/iconHelpers';

/**
 * Service for managing ingredient images with fallback hierarchy
 */
class IngredientImageService {
  constructor() {
    // Cache for image URLs to reduce API calls
    this.imageCache = new Map();
    this.cacheExpiry = 1000 * 60 * 60; // 1 hour cache
    
    // Default placeholder image
    this.defaultImage = '/assets/images/placeholder-ingredient.png';
    
    // API base URL
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Get image URL for an ingredient with fallback logic
   * @param {Object} item - The inventory item object
   * @param {string} item.itemName - Name of the ingredient
   * @param {string} item.category - Category of the ingredient
   * @param {string} item.imageUrl - Direct image URL if available
   * @param {Object} options - Additional options
   * @returns {Promise<string|JSX.Element>} - Image URL or React component
   */
  async getIngredientImage(item, options = {}) {
    const { preferThumbnail = false, returnComponent = false } = options;
    
    // Priority 1: Use provided image URL
    if (item.imageUrl) {
      return item.imageUrl;
    }
    
    if (item.thumbnailUrl && preferThumbnail) {
      return item.thumbnailUrl;
    }
    
    // Priority 2: Check cache
    const cacheKey = `${item.itemName}-${preferThumbnail}`;
    const cached = this.getCachedImage(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Priority 3: Fetch from API
    try {
      const imageUrl = await this.fetchImageFromAPI(item.itemName);
      if (imageUrl) {
        this.setCachedImage(cacheKey, imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.warn('Failed to fetch ingredient image from API:', error);
    }
    
    // Priority 4: Return Icons8 SVG component if component is requested
    if (returnComponent) {
      return getItemIconIcons8(item.category, item.itemName, { size: 48 });
    }
    
    // Priority 5: Generate Icons8 fallback URL
    const fallbackUrl = this.getIcons8FallbackUrl(item.category, item.itemName);
    if (fallbackUrl) {
      return fallbackUrl;
    }
    
    // Priority 6: Return default placeholder
    return this.defaultImage;
  }
  
  /**
   * Batch fetch images for multiple ingredients
   * @param {Array} items - Array of inventory items
   * @returns {Promise<Map>} - Map of item IDs to image URLs
   */
  async batchGetImages(items) {
    const imageMap = new Map();
    
    // First, use provided URLs and cached images
    const itemsNeedingFetch = [];
    
    for (const item of items) {
      if (item.imageUrl) {
        imageMap.set(item.id, item.imageUrl);
      } else {
        const cached = this.getCachedImage(item.itemName);
        if (cached) {
          imageMap.set(item.id, cached);
        } else {
          itemsNeedingFetch.push(item);
        }
      }
    }
    
    // Batch fetch remaining items
    if (itemsNeedingFetch.length > 0) {
      try {
        const batchResults = await this.batchFetchFromAPI(
          itemsNeedingFetch.map(item => item.itemName)
        );
        
        for (const item of itemsNeedingFetch) {
          const result = batchResults.find(r => r.ingredient === item.itemName);
          if (result && result.image_url) {
            imageMap.set(item.id, result.image_url);
            this.setCachedImage(item.itemName, result.image_url);
          } else {
            // Use fallback for items without matches
            const fallback = this.getIcons8FallbackUrl(item.category, item.itemName);
            imageMap.set(item.id, fallback || this.defaultImage);
          }
        }
      } catch (error) {
        console.error('Batch fetch failed:', error);
        // Use fallbacks for all failed items
        for (const item of itemsNeedingFetch) {
          const fallback = this.getIcons8FallbackUrl(item.category, item.itemName);
          imageMap.set(item.id, fallback || this.defaultImage);
        }
      }
    }
    
    return imageMap;
  }
  
  /**
   * Fetch image URL from API for a single ingredient
   * @private
   */
  async fetchImageFromAPI(ingredientName) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/ingredient-images/match/${encodeURIComponent(ingredientName)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.image_url;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching ingredient image:', error);
      return null;
    }
  }
  
  /**
   * Batch fetch images from API
   * @private
   */
  async batchFetchFromAPI(ingredientNames) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/ingredient-images/batch-match`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ingredients: ingredientNames })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error batch fetching ingredient images:', error);
      return [];
    }
  }
  
  /**
   * Get Icons8 fallback URL based on category/name
   * @private
   */
  getIcons8FallbackUrl(category, itemName) {
    // Map common ingredients to Icons8 image names
    const icons8Mapping = {
      // Fruits
      'apple': 'apple',
      'banana': 'banana',
      'orange': 'citrus',
      'lemon': 'citrus',
      'strawberry': 'strawberry',
      'grapes': 'grapes',
      'watermelon': 'watermelon',
      'pineapple': 'pineapple',
      
      // Vegetables
      'carrot': 'carrot',
      'tomato': 'tomato',
      'lettuce': 'lettuce',
      'onion': 'onion',
      'garlic': 'garlic',
      'potato': 'potato',
      'broccoli': 'broccoli',
      'corn': 'corn',
      
      // Dairy
      'milk': 'milk',
      'cheese': 'cheese',
      'eggs': 'eggs',
      'egg': 'eggs',
      
      // Protein
      'meat': 'steak',
      'chicken': 'steak',
      'beef': 'steak',
      'pork': 'bacon',
      'fish': 'sushi',
      
      // Other
      'bread': 'bread',
      'rice': 'rice-bowl',
      'pasta': 'spaghetti',
      'noodles': 'noodles'
    };
    
    // Try to find a matching icon
    const lowerName = itemName?.toLowerCase() || '';
    for (const [key, iconName] of Object.entries(icons8Mapping)) {
      if (lowerName.includes(key)) {
        // Return path to local Icons8 SVG (these would need to be converted to PNG)
        return `/assets/icons/icons8/${iconName}.png`;
      }
    }
    
    // Category-based fallback
    const categoryFallbacks = {
      'Fruits': 'apple',
      'Vegetables': 'carrot',
      'Dairy': 'milk',
      'Protein': 'steak',
      'Grains': 'bread',
      'Beverages': 'cup'
    };
    
    const fallbackIcon = categoryFallbacks[category];
    if (fallbackIcon) {
      return `/assets/icons/icons8/${fallbackIcon}.png`;
    }
    
    return null;
  }
  
  /**
   * Get cached image
   * @private
   */
  getCachedImage(key) {
    const cached = this.imageCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.url;
    }
    this.imageCache.delete(key);
    return null;
  }
  
  /**
   * Set cached image
   * @private
   */
  setCachedImage(key, url) {
    this.imageCache.set(key, {
      url,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (this.imageCache.size > 100) {
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }
  }
  
  /**
   * Preload images for better performance
   */
  preloadImages(urls) {
    urls.forEach(url => {
      if (url && typeof url === 'string') {
        const img = new Image();
        img.src = url;
      }
    });
  }
  
  /**
   * Clear the image cache
   */
  clearCache() {
    this.imageCache.clear();
  }
}

// Export singleton instance
const ingredientImageService = new IngredientImageService();
export default ingredientImageService;