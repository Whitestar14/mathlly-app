import { evaluate, bignumber } from 'mathjs';
import { CalculatorConstants, CalculatorUtils } from '@/utils/constants/CalculatorConstants';

/**
 * Singleton expression evaluator with memoization
 * 
 * @class ExpressionEvaluator
 */
export class ExpressionEvaluator {
  /** @type {ExpressionEvaluator} Singleton instance */
  static instance = null;

  /**
   * Get singleton instance
   * 
   * @returns {ExpressionEvaluator} Singleton instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new ExpressionEvaluator();
    }
    return this.instance;
  }

  /**
   * Create a new expression evaluator
   */
  constructor() {
    /** @type {Map<string, any>} Evaluation cache */
    this.cache = new Map();
    
    /** @type {number} Maximum cache size */
    this.MAX_CACHE_SIZE = 100;
  }

  /**
   * Evaluate expression with caching
   * 
   * @param {string} expr - Expression to evaluate
   * @param {Object} options - Evaluation options
   * @param {string} [options.base] - Numeric base
   * @param {Object} [options.maxValue] - Maximum allowed value
   * @param {Object} [options.minValue] - Minimum allowed value
   * @returns {*} Evaluation result
   * @throws {Error} If expression is invalid or result exceeds bounds
   */
  evaluate(expr, options = {}) {
    const cacheKey = this.getCacheKey(expr, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Perform actual evaluation
    const result = this.performEvaluation(expr, options);

    // Cache result
    this.cacheResult(cacheKey, result);

    return result;
  }

  /**
   * Generate cache key from expression and options
   * 
   * @param {string} expr - Expression
   * @param {Object} options - Options
   * @returns {string} Cache key
   */
  getCacheKey(expr, options) {
    return `${expr}|${JSON.stringify(options)}`;
  }

  /**
   * Perform actual expression evaluation
   * 
   * @param {string} expr - Expression to evaluate
   * @param {Object} options - Evaluation options
   * @returns {*} Evaluation result
   * @throws {Error} If expression is invalid or result exceeds bounds
   */
  performEvaluation(expr, options) {
    const {
      base,
      maxValue = CalculatorConstants.MAX_VALUE,
      minValue = CalculatorConstants.MIN_VALUE,
    } = options;

    if (!expr || expr.trim() === '') return bignumber(0);

    // Check for division by zero before sanitization
    if (expr.includes('÷ 0') || expr.includes('/ 0')) {
      throw new Error(CalculatorConstants.ERROR_MESSAGES.DIVISION_BY_ZERO);
    }

    // Use CalculatorUtils.sanitizeExpression instead of custom implementation
    const sanitizedExpr = base && base !== 'DEC' 
      ? this.convertToDecimal(CalculatorUtils.sanitizeExpression(expr), base)
      : CalculatorUtils.sanitizeExpression(expr);

    // Evaluate using mathjs
    try {
      const result = evaluate(sanitizedExpr);

      // Check bounds
      if (result > maxValue || result < minValue) {
        throw new Error(CalculatorConstants.ERROR_MESSAGES.OVERFLOW);
      }

      return result;
    } catch (err) {
      // Use CalculatorUtils.formatError for consistent error handling
      throw new Error(CalculatorUtils.formatError(err));
    }
  }

  /**
   * Convert expression from given base to decimal
   * 
   * @param {string} expr - Expression to convert
   * @param {string} fromBase - Source base
   * @returns {string} Converted expression
   */
  convertToDecimal(expr, fromBase) {
    const bases = CalculatorConstants.BASES;
    // Split expression keeping operators intact
    const parts = expr.split(/(\s*<<\s*|\s*>>\s*|\s*%\s*|\s*[+\-*/()]\s*)/);
    return parts
      .map((part) => {
        part = part.trim();
        if (!part) return '';
        // Keep operators as is
        if (/^(<<|>>|[+\-*/%()]|\s+)$/.test(part)) return part;

        // Convert numbers to decimal
        try {
          // Use CalculatorUtils.isValidForBase to check validity
          if (CalculatorUtils.isValidForBase(part, fromBase)) {
            const decimal = parseInt(part, bases[fromBase]);
            return isNaN(decimal) ? part : decimal.toString(10);
          }
          return part;
        } catch {
          return part;
        }
      })
      .join('');
  }

  /**
   * Cache evaluation result
   * 
   * @param {string} key - Cache key
   * @param {*} result - Result to cache
   */
  cacheResult(key, result) {
    // Manage cache size with LRU strategy
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, result);
  }

  /**
   * Clear evaluation cache
   */
  clearCache() {
    this.cache.clear();
  }
}
