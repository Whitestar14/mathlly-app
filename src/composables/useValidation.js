import { markRaw } from 'vue';

/**
 * Regular expression patterns for different number bases
 * @type {Object}
 */
const BASE_PATTERNS = markRaw({
  BIN: /^[0-1]$/,
  OCT: /^[0-7]$/,
  DEC: /^[0-9]$/,
  HEX: /^[0-9a-fA-F]$/,
});

/**
 * Keys that are always allowed regardless of base
 * @type {string[]}
 */
const ALLOWED_KEYS = markRaw([
  'AC',
  'backspace',
  '=',
  '+',
  '-',
  '×',
  '÷',
  '(',
  ')',
  '>>',
  '<<',
  '%',
  '±',
]);

/**
 * Composable for validating input based on number base
 * 
 * @returns {Object} Input validation API
 */
export const useInputValidation = () => {
  /**
   * Checks if a value is valid for a specific number base
   * 
   * @param {string} value - The value to validate
   * @param {string} base - The number base ('BIN', 'OCT', 'DEC', 'HEX')
   * @returns {boolean} Whether the value is valid for the base
   */
  const isValidForBase = (value, base) => {
    // Always allow special keys
    if (ALLOWED_KEYS.includes(value)) {
      return true;
    }
    
    // Check against the pattern for the specified base
    const pattern = BASE_PATTERNS[base];
    if (!pattern) {
      console.warn(`Invalid base: ${base}. Valid options are: BIN, OCT, DEC, HEX`);
      return false;
    }
    
    return pattern.test(value);
  };

  /**
   * Get the maximum value for a given base and bit width
   * 
   * @param {string} base - The number base ('BIN', 'OCT', 'DEC', 'HEX')
   * @param {number} bits - The bit width (8, 16, 32, 64)
   * @returns {string} The maximum value in the specified base
   */
  const getMaxValueForBase = (base, bits = 32) => {
    const maxDecimal = Math.pow(2, bits) - 1;
    
    switch (base) {
      case 'BIN':
        return maxDecimal.toString(2);
      case 'OCT':
        return maxDecimal.toString(8);
      case 'DEC':
        return maxDecimal.toString(10);
      case 'HEX':
        return maxDecimal.toString(16).toUpperCase();
      default:
        console.warn(`Invalid base: ${base}`);
        return '';
    }
  };

  /**
   * Validate a complete expression for a given base
   * 
   * @param {string} expression - The expression to validate
   * @param {string} base - The number base ('BIN', 'OCT', 'DEC', 'HEX')
   * @returns {boolean} Whether the expression is valid
   */
  const isValidExpression = (expression, base) => {
    // Remove operators and parentheses for validation
    const sanitized = expression.replace(/[+\-×÷()%±\s]/g, ' ');
    const tokens = sanitized.split(' ').filter(Boolean);
    
    // Check each token against the base pattern
    const pattern = BASE_PATTERNS[base];
    if (!pattern) return false;
    
    return tokens.every(token => {
      // Skip empty tokens
      if (!token) return true;
      
      // Check if every character in the token matches the pattern
      return [...token].every(char => pattern.test(char));
    });
  };

  return {
    isValidForBase,
    getMaxValueForBase,
    isValidExpression,
    BASE_PATTERNS,
  };
};
