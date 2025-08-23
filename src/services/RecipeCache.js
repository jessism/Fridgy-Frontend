/**
 * RecipeCache Service
 * 
 * Manages client-side caching of recipe suggestions to minimize API calls.
 * Features:
 * - localStorage with automatic fallback to sessionStorage/memory
 * - Cross-tab synchronization
 * - Storage limit management with LRU eviction
 * - Compression for efficient storage
 * - Robust error handling
 */

class RecipeCache {
  constructor() {
    // Singleton pattern
    if (RecipeCache.instance) {
      return RecipeCache.instance;
    }
    
    this.STORAGE_KEY_PREFIX = 'fridgy_recipe_cache_';
    this.METADATA_KEY = 'fridgy_cache_metadata';
    this.MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB limit
    this.MAX_CACHE_ENTRIES = 10; // Maximum number of cache entries per user
    
    // Try to use localStorage, fall back to sessionStorage, then memory
    this.storage = this._initStorage();
    this.memoryCache = new Map();
    
    // Listen for storage events (cross-tab sync)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this._handleStorageChange.bind(this));
    }
    
    RecipeCache.instance = this;
  }
  
  /**
   * Initialize storage with fallback chain
   */
  _initStorage() {
    // Test localStorage availability
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return localStorage;
    } catch (e) {
      console.warn('localStorage not available, falling back to sessionStorage');
      
      // Try sessionStorage
      try {
        const testKey = '__test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        return sessionStorage;
      } catch (e) {
        console.warn('sessionStorage not available, using memory cache only');
        return null;
      }
    }
  }
  
  /**
   * Handle storage changes from other tabs
   */
  _handleStorageChange(event) {
    // Clear memory cache if storage changed in another tab
    if (event.key && event.key.startsWith(this.STORAGE_KEY_PREFIX)) {
      const cacheKey = event.key.replace(this.STORAGE_KEY_PREFIX, '');
      this.memoryCache.delete(cacheKey);
      console.log('Cache invalidated from another tab:', cacheKey);
    }
  }
  
  /**
   * Compress data for storage efficiency
   */
  _compress(data) {
    // Simple compression: remove whitespace from JSON
    const json = JSON.stringify(data);
    // In production, you might use LZ-string or similar library
    return json.replace(/\s+/g, ' ');
  }
  
  /**
   * Decompress stored data
   */
  _decompress(compressed) {
    try {
      return JSON.parse(compressed);
    } catch (e) {
      console.error('Failed to decompress cache data:', e);
      return null;
    }
  }
  
  /**
   * Get current storage size in bytes
   */
  _getStorageSize() {
    if (!this.storage) return 0;
    
    let size = 0;
    for (let key in this.storage) {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        size += this.storage[key].length * 2; // UTF-16 characters
      }
    }
    return size;
  }
  
  /**
   * Clean up old cache entries (LRU eviction)
   */
  _evictOldEntries(userId) {
    if (!this.storage) return;
    
    try {
      // Get metadata
      const metadata = this._getMetadata();
      const userEntries = metadata[userId] || [];
      
      // Sort by last accessed time
      userEntries.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      // Remove oldest entries if exceeding limit
      while (userEntries.length > this.MAX_CACHE_ENTRIES) {
        const oldest = userEntries.shift();
        const storageKey = this.STORAGE_KEY_PREFIX + oldest.key;
        this.storage.removeItem(storageKey);
        console.log('Evicted old cache entry:', oldest.key);
      }
      
      // Update metadata
      metadata[userId] = userEntries;
      this._saveMetadata(metadata);
      
    } catch (error) {
      console.error('Error evicting old entries:', error);
    }
  }
  
  /**
   * Get cache metadata
   */
  _getMetadata() {
    if (!this.storage) return {};
    
    try {
      const metadata = this.storage.getItem(this.METADATA_KEY);
      return metadata ? JSON.parse(metadata) : {};
    } catch (e) {
      return {};
    }
  }
  
  /**
   * Save cache metadata
   */
  _saveMetadata(metadata) {
    if (!this.storage) return;
    
    try {
      this.storage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (e) {
      console.error('Failed to save cache metadata:', e);
    }
  }
  
  /**
   * Store recipes in cache
   * @param {string} cacheKey - Unique cache key (userId + fingerprint)
   * @param {Array} recipes - Recipe data to cache
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} Success status
   */
  set(cacheKey, recipes, metadata = {}) {
    if (!cacheKey || !recipes) return false;
    
    const cacheData = {
      recipes,
      timestamp: Date.now(),
      ...metadata
    };
    
    // Always update memory cache
    this.memoryCache.set(cacheKey, cacheData);
    
    // Try to persist to storage
    if (this.storage) {
      try {
        const compressed = this._compress(cacheData);
        const storageKey = this.STORAGE_KEY_PREFIX + cacheKey;
        
        // Check storage size
        if (this._getStorageSize() + compressed.length * 2 > this.MAX_CACHE_SIZE) {
          // Extract userId from cacheKey (format: recipes_userId_fingerprint)
          const userId = cacheKey.split('_')[1];
          this._evictOldEntries(userId);
        }
        
        // Store data
        this.storage.setItem(storageKey, compressed);
        
        // Update metadata
        const allMetadata = this._getMetadata();
        const userId = cacheKey.split('_')[1];
        if (!allMetadata[userId]) {
          allMetadata[userId] = [];
        }
        
        // Update or add entry
        const entryIndex = allMetadata[userId].findIndex(e => e.key === cacheKey);
        const entry = {
          key: cacheKey,
          lastAccessed: Date.now(),
          size: compressed.length * 2
        };
        
        if (entryIndex >= 0) {
          allMetadata[userId][entryIndex] = entry;
        } else {
          allMetadata[userId].push(entry);
        }
        
        this._saveMetadata(allMetadata);
        
        console.log(`✅ Cached ${recipes.length} recipes with key: ${cacheKey}`);
        return true;
        
      } catch (error) {
        console.error('Failed to persist cache to storage:', error);
        // Memory cache is still valid
        return true;
      }
    }
    
    return true;
  }
  
  /**
   * Retrieve recipes from cache
   * @param {string} cacheKey - Cache key to retrieve
   * @returns {Object|null} Cached data or null if not found/expired
   */
  get(cacheKey) {
    if (!cacheKey) return null;
    
    // Check memory cache first
    if (this.memoryCache.has(cacheKey)) {
      const cached = this.memoryCache.get(cacheKey);
      console.log(`⚡ Retrieved ${cached.recipes.length} recipes from memory cache`);
      return cached;
    }
    
    // Check persistent storage
    if (this.storage) {
      try {
        const storageKey = this.STORAGE_KEY_PREFIX + cacheKey;
        const compressed = this.storage.getItem(storageKey);
        
        if (compressed) {
          const cached = this._decompress(compressed);
          
          if (cached && cached.recipes) {
            // Update memory cache
            this.memoryCache.set(cacheKey, cached);
            
            // Update last accessed time in metadata
            const metadata = this._getMetadata();
            const userId = cacheKey.split('_')[1];
            if (metadata[userId]) {
              const entry = metadata[userId].find(e => e.key === cacheKey);
              if (entry) {
                entry.lastAccessed = Date.now();
                this._saveMetadata(metadata);
              }
            }
            
            console.log(`💾 Retrieved ${cached.recipes.length} recipes from storage cache`);
            return cached;
          }
        }
      } catch (error) {
        console.error('Failed to retrieve from storage:', error);
      }
    }
    
    return null;
  }
  
  /**
   * Invalidate specific cache entry
   * @param {string} cacheKey - Cache key to invalidate
   */
  invalidate(cacheKey) {
    if (!cacheKey) return;
    
    // Clear from memory cache
    this.memoryCache.delete(cacheKey);
    
    // Clear from storage
    if (this.storage) {
      try {
        const storageKey = this.STORAGE_KEY_PREFIX + cacheKey;
        this.storage.removeItem(storageKey);
        
        // Update metadata
        const metadata = this._getMetadata();
        const userId = cacheKey.split('_')[1];
        if (metadata[userId]) {
          metadata[userId] = metadata[userId].filter(e => e.key !== cacheKey);
          this._saveMetadata(metadata);
        }
        
        console.log(`🗑️ Invalidated cache: ${cacheKey}`);
      } catch (error) {
        console.error('Failed to invalidate storage cache:', error);
      }
    }
  }
  
  /**
   * Invalidate all cache entries for a user
   * @param {string} userId - User ID to clear cache for
   */
  invalidateUser(userId) {
    if (!userId) return;
    
    // Clear memory cache entries for user
    for (const [key] of this.memoryCache) {
      if (key.includes(`_${userId}_`)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear storage entries for user
    if (this.storage) {
      try {
        const metadata = this._getMetadata();
        const userEntries = metadata[userId] || [];
        
        // Remove all user's cache entries
        for (const entry of userEntries) {
          const storageKey = this.STORAGE_KEY_PREFIX + entry.key;
          this.storage.removeItem(storageKey);
        }
        
        // Clear user metadata
        delete metadata[userId];
        this._saveMetadata(metadata);
        
        console.log(`🗑️ Invalidated all cache for user: ${userId}`);
      } catch (error) {
        console.error('Failed to invalidate user cache:', error);
      }
    }
  }
  
  /**
   * Clear all cache
   */
  clearAll() {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear storage
    if (this.storage) {
      try {
        // Get all cache keys
        const keysToRemove = [];
        for (let key in this.storage) {
          if (key.startsWith(this.STORAGE_KEY_PREFIX) || key === this.METADATA_KEY) {
            keysToRemove.push(key);
          }
        }
        
        // Remove all cache entries
        for (const key of keysToRemove) {
          this.storage.removeItem(key);
        }
        
        console.log('🗑️ Cleared all cache');
      } catch (error) {
        console.error('Failed to clear storage cache:', error);
      }
    }
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const stats = {
      memoryCacheSize: this.memoryCache.size,
      storageType: this.storage ? (this.storage === localStorage ? 'localStorage' : 'sessionStorage') : 'none',
      storageSizeBytes: this._getStorageSize(),
      storageSizeMB: (this._getStorageSize() / (1024 * 1024)).toFixed(2)
    };
    
    if (this.storage) {
      const metadata = this._getMetadata();
      stats.totalUsers = Object.keys(metadata).length;
      stats.totalEntries = Object.values(metadata).reduce((sum, entries) => sum + entries.length, 0);
    }
    
    return stats;
  }
}

// Export singleton instance
const recipeCache = new RecipeCache();
export default recipeCache;