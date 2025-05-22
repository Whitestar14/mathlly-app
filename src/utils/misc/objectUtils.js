/**
 * Utility functions for object manipulation
 */

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    const clone = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = cloneDeep(obj[key]);
      }
    }
    
    return clone;
  }
  
  /**
   * Deep merge objects
   * @param {Object} target - Target object
   * @param {...Object} sources - Source objects
   * @returns {Object} Merged object
   */
  export function merge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return merge(target, ...sources);
  }
  
  /**
   * Check if value is an object
   * @param {*} item - Value to check
   * @returns {boolean} True if object
   */
  export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  /**
   * Get a value from an object by path
   * @param {Object} obj - Object to get value from
   * @param {string} path - Path to value (e.g. 'a.b.c')
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Value at path or default value
   */
  export function get(obj, path, defaultValue = undefined) {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }
    
    const keys = Array.isArray(path) ? path : path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result === undefined ? defaultValue : result;
  }
  
  /**
   * Set a value in an object by path
   * @param {Object} obj - Object to set value in
   * @param {string} path - Path to set value at (e.g. 'a.b.c')
   * @param {*} value - Value to set
   * @returns {Object} Modified object
   */
  export function set(obj, path, value) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const keys = Array.isArray(path) ? path : path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === undefined) {
        current[key] = {};
      } else if (typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  }
  
  /**
   * Flattens a nested object structure with path-based keys
   * @param {Object} obj - The nested object to flatten
   * @param {string} separator - The separator to use in keys (default: '_')
   * @returns {Object} Flattened object with path-based keys
   */
  export function flattenObject(obj, separator = '_') {
    const result = {};
    
    function flatten(current, prefix = '') {
      for (const key in current) {
        // Skip prototype properties
        if (!Object.prototype.hasOwnProperty.call(current, key)) continue;
        
        // Special case for ID
        if (key === 'id' && prefix === '') {
          result[key] = current[key];
          continue;
        }
        
        const newKey = prefix ? `${prefix}${separator}${key}` : key;
        
        if (isObject(current[key]) && !Array.isArray(current[key])) {
          flatten(current[key], newKey);
        } else {
          result[newKey] = current[key];
        }
      }
    }
    
    flatten(obj);
    return result;
  }
  
  /**
   * Unflatten an object with path-based keys into a nested structure
   * @param {Object} obj - The flattened object
   * @param {string} separator - The separator used in keys (default: '_')
   * @returns {Object} Nested object
   */
  export function unflattenObject(obj, separator = '_') {
    const result = {};
    
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      
      // Special case for ID
      if (key === 'id') {
        result.id = obj.id;
        continue;
      }
      
      const keys = key.split(separator);
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i];
        if (!current[currentKey]) {
          current[currentKey] = {};
        }
        current = current[currentKey];
      }
      
      current[keys[keys.length - 1]] = obj[key];
    }
    
    return result;
  }
  
/**
 * Determines if the given object contains at least one nested object (excluding arrays).
 *
 * @param {Object} obj - The object to check for nested structures.
 * @returns {boolean} Returns true if the object has at least one nested object property, otherwise false.
 */
export function isNestedStructure(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return Object.keys(obj).some(key => 
    obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])
  );
}