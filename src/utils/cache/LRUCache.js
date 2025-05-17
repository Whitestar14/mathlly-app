/**
 * @class LRUCache
 * @description A Least Recently Used (LRU) cache implementation
 */
export class LRUCache {
  /**
   * Create a new LRU Cache
   * @param {number} capacity - Maximum number of items to store in the cache
   */
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {*} The cached value or undefined if not found
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move the accessed item to the end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  /**
   * Set a value in the cache
   * @param {string} key - The cache key
   * @param {*} value - The value to cache
   * @returns {LRUCache} The cache instance for chaining
   */
  set(key, value) {
    // If key exists, refresh its position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // If at capacity, remove the oldest item (first item in Map)
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // Add new item at the end (most recently used)
    this.cache.set(key, value);
    
    return this;
  }

  /**
   * Check if a key exists in the cache
   * @param {string} key - The cache key
   * @returns {boolean} True if the key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   * @param {string} key - The cache key
   * @returns {boolean} True if the key was deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache
   * @returns {number} The number of items in the cache
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache
   * @returns {Iterator} Iterator of cache keys
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Get all values in the cache
   * @returns {Iterator} Iterator of cache values
   */
  values() {
    return this.cache.values();
  }

  /**
   * Get all entries in the cache
   * @returns {Iterator} Iterator of [key, value] pairs
   */
  entries() {
    return this.cache.entries();
  }
}
