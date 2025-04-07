import { bignumber } from 'mathjs';

/**
 * Shared constants for calculator implementations
 * 
 * @namespace CalculatorConstants
 */
export const CalculatorConstants = {
  /**
   * Maximum value (63-bit signed integer limit)
   * @type {Object}
   */
  MAX_VALUE: bignumber("9223372036854775807"),
  
  /**
   * Minimum value (63-bit signed integer limit)
   * @type {Object}
   */
  MIN_VALUE: bignumber("-9223372036854775808"),
  
  /**
   * Numeric bases
   * @type {Object}
   */
  BASES: {
    BIN: 2,
    OCT: 8,
    DEC: 10,
    HEX: 16
  },
  
  /**
   * Input length limits
   * @type {Object}
   */
  MAX_INPUT_LENGTH: {
    STANDARD: 100,
    PROGRAMMER: 69
  },
  
  /**
   * Button categories
   * @type {Object}
   */
  BUTTON_TYPES: {
    OPERATORS: ['+', '-', '×', '÷'],
    FUNCTIONS: ['AC', 'CE', 'backspace', '=', '±', '%'],
    MEMORY: ['MC', 'MR', 'M+', 'M-', 'MS'],
    PROGRAMMER_OPERATORS: ['<<', '>>', '&', '|', '^', '~']
  },
  
  /**
   * Regular expressions
   * @type {Object}
   */
  REGEX: {
    OPERATOR: /[+\-×÷]/,
    NUMBER: /[0-9A-Fa-f.]/,
    VALID_EXPRESSION: /^[0-9A-Fa-f\s+\-*/%()<<>>]*$/
  }
};

/**
 * Utility functions for calculator operations
 * 
 * @namespace CalculatorUtils
 */
export const CalculatorUtils = {
  /**
   * Check if a character is an operator
   * 
   * @param {string} char - Character to check
   * @returns {boolean} True if character is an operator
   */
  isOperator(char) {
    return CalculatorConstants.BUTTON_TYPES.OPERATORS.includes(char);
  },
  
  /**
   * Check if a value is valid for a specific base
   * 
   * @param {string} value - Value to check
   * @param {string} base - Base to check against
   * @returns {boolean} True if value is valid for base
   */
  isValidForBase(value, base) {
    if (!value || typeof value !== 'string') return false;
    
    const patterns = {
      BIN: /^-?[01]+$/,
      OCT: /^-?[0-7]+$/,
      DEC: /^-?[0-9]+$/,
      HEX: /^-?[0-9A-Fa-f]+$/
    };

    const pattern = patterns[base];
    if (!pattern) return false;

    // Handle negative numbers
    const testValue = value.startsWith('-') ? value.slice(1) : value;
    return pattern.test(testValue);
  },
  
  /**
   * Trim unnecessary zeros from a formatted number
   * 
   * @param {string} formattedNumber - Number to trim
   * @returns {string} Trimmed number
   */
  trimUnnecessaryZeros(formattedNumber) {
    if (formattedNumber.includes('e')) return formattedNumber;
    
    const [whole, decimal] = formattedNumber.split('.');
    if (!decimal) return whole;
    const trimmedDecimal = decimal.replace(/0+$/, '');
    
    return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole;
  },

  /**
   * Sanitize an expression for evaluation
   * 
   * @param {string} expr - Expression to sanitize
   * @returns {string} Sanitized expression
   */
  sanitizeExpression(expr) {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, ' ')
      .replace(/[+\-*/]\s*$/, '')
      .trim();
  },

  /**
   * Create a standardized response object
   * 
   * @param {Object} data - Response data
   * @returns {Object} Standardized response
   */
  createResponse(data) {
    return {
      input: data.input || '0',
      error: data.error || '',
      expression: data.expression || '',
      result: data.result,
      displayValues: data.displayValues,
      success: !data.error
    };

  },

  /**
 * Handle common error cases
 * 
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @returns {string} Formatted error message
 */
  formatError(error, defaultMessage = "Operation failed") {
    if (!error) return defaultMessage;
    
    // Handle specific error types
    if (error.message.includes("division by zero")) {
      return "Division by zero is not allowed";
    }
    
    if (error.message.includes("overflow")) {
      return "Overflow: Result exceeds maximum value";
    }
    
    return error.message || defaultMessage;
  }
}