import { ParenthesesManager } from './ParenthesesManager.js';

export class ParenthesesHighlighter {
  static manager = new ParenthesesManager();
  
  static formattedCache = new Map();
  static MAX_CACHE_SIZE = 50;
  
  /**
   * Format text with parentheses highlighting
   * @param {string} formattedText - The text to format
   * @param {Object} parenthesesTracker - Tracker for parentheses state
   * @returns {Array} Formatted parts for rendering
   */
  static formatWithParentheses(formattedText, parenthesesTracker) {
    if (!formattedText) {
      return [{ type: 'text', content: '0' }];
    }
    
    if (!parenthesesTracker) {
      return [{ type: 'text', content: formattedText }];
    }

    const cacheKey = `${formattedText}-${parenthesesTracker.openCount || 0}`;
    
    // Check cache first
    if (this.formattedCache.has(cacheKey)) {
      return this.formattedCache.get(cacheKey);
    }
    
    // Format the expression
    const result = this.manager.getFormattedExpression(formattedText);
    
    // Cache the result
    if (this.formattedCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.formattedCache.keys().next().value;
      this.formattedCache.delete(firstKey);
    }
    this.formattedCache.set(cacheKey, result);
    
    return result;
  }
  
  /**
   * Clear the formatting cache
   */
  static clearCache() {
    this.formattedCache.clear();
    this.manager.clearCache();
  }
}
