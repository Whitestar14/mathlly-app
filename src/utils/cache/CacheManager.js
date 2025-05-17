import { LRUCache } from './LRUCache';

/**
 * @class CacheManager
 * @description Centralized manager for application caches
 */
export class CacheManager {
  static caches = new Map();
  
  /**
   * Get or create a cache with the specified name and capacity
   * @param {string} name - The name of the cache
   * @param {number} capacity - The capacity of the cache
   * @returns {LRUCache} The requested cache
   */
  static getCache(name, capacity = 100) {
    if (!this.caches.has(name)) {
      this.caches.set(name, new LRUCache(capacity));
    }
    return this.caches.get(name);
  }
  
  /**
   * Clear a specific cache by name
   * @param {string} name - The name of the cache to clear
   * @returns {boolean} True if the cache was found and cleared
   */
  static clearCache(name) {
    if (this.caches.has(name)) {
      this.caches.get(name).clear();
      return true;
    }
    return false;
  }
  
  /**
   * Clear all caches
   */
  static clearAllCaches() {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }
  
  /**
   * Get the size of a specific cache
   * @param {string} name - The name of the cache
   * @returns {number} The size of the cache, or 0 if not found
   */
  static getCacheSize(name) {
    if (this.caches.has(name)) {
      return this.caches.get(name).size;
    }
    return 0;
  }
  
  /**
   * Get statistics about all caches
   * @returns {Object} Object with cache statistics
   */
  static getCacheStats() {
    const stats = {};
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = {
        size: cache.size,
        capacity: cache.capacity
      };
    }
    return stats;
  }
}
