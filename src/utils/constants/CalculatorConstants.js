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
    OPERATORS: ['+', '-', '×', '÷', '%'],
    FUNCTIONS: ['AC', 'CE', 'backspace', '=', '±'],
    MEMORY: ['MC', 'MR', 'M+', 'M-', 'MS'],
    PROGRAMMER_OPERATORS: ['<<', '>>', '&', '|', '^', '~']
  },
  
  /**
   * Regular expressions
   * @type {Object}
   */
  REGEX: {
    OPERATOR: /[+\-×÷%]/,
    NUMBER: /[0-9A-Fa-f.]/,
    VALID_EXPRESSION: /^[0-9A-Fa-f\s+\-*/%()<<>>]*$/,
    LAST_OPERATOR: /\s*[+\-×÷%<<>>]\s*$/,
    DECIMAL_POINT: /\./,
    SHIFT_OPERATOR: /\s*[<>]{2}\s*$/,
    PARENTHESIS: /[()]/
  },
  
  /**
   * Error messages
   * @type {Object}
   */
  ERROR_MESSAGES: {
    OVERFLOW: "Overflow: Evaluated result exceeding max limit",
    DIVISION_BY_ZERO: "Division by zero is not allowed",
    INVALID_EXPRESSION: "Invalid expression format",
    MAX_INPUT_LENGTH: "Maximum input length reached",
    NEGATIVE_SQUARE_ROOT: "Cannot calculate square root of negative number",
    OPERATION_ERROR: "Operation error",
    INVALID_BASE: "Invalid base for conversion"
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
      return CalculatorConstants.ERROR_MESSAGES.DIVISION_BY_ZERO;
    }
    
    if (error.message.includes("overflow")) {
      return CalculatorConstants.ERROR_MESSAGES.OVERFLOW;
    }
    
    if (error.message.includes("square root of negative")) {
      return CalculatorConstants.ERROR_MESSAGES.NEGATIVE_SQUARE_ROOT;
    }
    
    return error.message || defaultMessage;
  },
  
  /**
   * Check if input contains a valid number
   * 
   * @param {string} input - Input to check
   * @returns {boolean} True if input contains a valid number
   */
  containsValidNumber(input) {
    return /\d/.test(input);
  },
  
  /**
   * Split expression into parts preserving operators
   * 
   * @param {string} expr - Expression to split
   * @returns {Array} Array of expression parts
   */
  splitExpression(expr) {
    return expr.split(/([+\-×÷%]|\s+<<\s+|\s+>>\s+)/);
  },
  
  /**
   * Get last part of an expression
   * 
   * @param {string} expr - Expression to analyze
   * @returns {string} Last part of expression
   */
  getLastExpressionPart(expr) {
    const parts = this.splitExpression(expr);
    return parts[parts.length - 1].trim();
  },
  
  /**
   * Check if expression ends with an operator
   * 
   * @param {string} expr - Expression to check
   * @returns {boolean} True if expression ends with an operator
   */
  endsWithOperator(expr) {
    return CalculatorConstants.REGEX.LAST_OPERATOR.test(expr.trim());
  },
  
  /**
   * Remove last operator from expression
   * 
   * @param {string} expr - Expression to modify
   * @returns {string} Expression without last operator
   */
  removeLastOperator(expr) {
    return expr.replace(CalculatorConstants.REGEX.LAST_OPERATOR, '');
  },
  
  /**
   * Check if a string represents a valid number in any base
   * 
   * @param {string} str - String to check
   * @param {string} [base='DEC'] - Base to check against
   * @returns {boolean} True if string is a valid number
   */
  isValidNumber(str, base = 'DEC') {
    if (!str || typeof str !== 'string') return false;
    
    switch(base) {
      case 'BIN': return /^-?[01]+$/.test(str);
      case 'OCT': return /^-?[0-7]+$/.test(str);
      case 'DEC': return /^-?[0-9]+(\.[0-9]*)?$/.test(str);
      case 'HEX': return /^-?[0-9A-Fa-f]+$/.test(str);
      default: return false;
    }
  },
  
  /**
   * Format number for display according to base
   * 
   * @param {number|string} num - Number to format
   * @param {string} base - Base for formatting
   * @returns {string} Formatted number
   */
  formatForBase(num, base) {
    if (num === undefined || num === null) return '0';
    
    try {
      const numValue = typeof num === 'string' ? parseFloat(num) : num;
      
      if (isNaN(numValue)) return '0';
      
      const isNegative = numValue < 0;
      const absValue = Math.floor(Math.abs(numValue));
      
      let result;
      switch(base) {
        case 'BIN': result = Math.floor(absValue).toString(2); break;
        case 'OCT': result = Math.floor(absValue).toString(8); break;
        case 'HEX': result = Math.floor(absValue).toString(16).toUpperCase(); break;
        case 'DEC': 
        default:
          result = absValue.toString();
      }
      
      return isNegative ? '-' + result : result;
    } catch (err) {
      console.error('Error formatting number:', err);
      return '0';
    }
  },
  
  /**
   * Check if expression has balanced parentheses
   * 
   * @param {string} expr - Expression to check
   * @returns {boolean} True if parentheses are balanced
   */
  hasBalancedParentheses(expr) {
    let count = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') count++;
      else if (expr[i] === ')') {
        count--;
        if (count < 0) return false;
      }
    }
    return count === 0;
  },
  
  /**
   * Check if expression ends with a shift operator
   * 
   * @param {string} expr - Expression to check
   * @returns {boolean} True if expression ends with a shift operator
   */
  endsWithShiftOperator(expr) {
    return CalculatorConstants.REGEX.SHIFT_OPERATOR.test(expr.trim());
  },
  
  /**
   * Remove shift operator from expression
   * 
   * @param {string} expr - Expression to modify
   * @returns {string} Expression without shift operator
   */
  removeShiftOperator(expr) {
    return expr.replace(CalculatorConstants.REGEX.SHIFT_OPERATOR, '');
  },
  
  /**
   * Convert between bases with error handling
   * 
   * @param {string|number} value - Value to convert
   * @param {string} fromBase - Source base
   * @param {string} toBase - Target base
   * @returns {string} Converted value or error message
   */
  convertBetweenBases(value, fromBase, toBase) {
    try {
      if (!value || value === 'Overflow') return '0';
      
      // Handle negative values
      const isNegative = typeof value === 'string' && value.startsWith('-');
      const absValue = isNegative ? value.substring(1) : value;
      
      // Validate input for source base
      if (!this.isValidForBase(absValue, fromBase)) {
        return '0';
      }
      
      // Convert to decimal first
      const decimal = parseInt(absValue.toString(), CalculatorConstants.BASES[fromBase]);
      if (isNaN(decimal)) return '0';
      
      // Check for overflow
      if (Math.abs(decimal) > CalculatorConstants.MAX_VALUE) {
        return 'Overflow';
      }
      
      // Convert to target base
      const result = decimal.toString(CalculatorConstants.BASES[toBase]).toUpperCase();
      return isNegative ? '-' + result : result;
    } catch (err) {
      console.error('Error converting between bases:', err);
      return '0';
    }
  },
  
  /**
   * Add proper spacing to an expression
   * 
   * @param {string} expr - Expression to format
   * @returns {string} Formatted expression with proper spacing
   */
  formatExpression(expr) {
    return expr
      .replace(/([+\-×÷%])/g, ' $1 ')
      .replace(/\s{2,}/g, ' ')
      .replace(/(\d)\s*\(\s*/g, '$1 × (')
      .replace(/\)\s*(\d)/g, ') × $1')
      .trim();
  },
  
  /**
   * Check if an expression is complete and can be evaluated
   * 
   * @param {string} expr - Expression to check
   * @returns {boolean} True if expression is complete
   */
  isCompleteExpression(expr) {
    if (!expr || expr === '0' || expr === 'Error') return false;
    
    // Check for balanced parentheses
    if (!this.hasBalancedParentheses(expr)) return false;
    
    // Check if expression ends with an operator
    if (this.endsWithOperator(expr)) return false;
    
    // Check if expression ends with a shift operator
    if (this.endsWithShiftOperator(expr)) return false;
    
    return true;
  },
  
  /**
   * Complete an expression by adding missing closing parentheses
   * 
   * @param {string} expr - Expression to complete
   * @returns {string} Completed expression
   */
  completeExpression(expr) {
    let openCount = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') openCount++;
      else if (expr[i] === ')') openCount--;
    }
    
    if (openCount > 0) {
      return expr + ')'.repeat(openCount);
    }
    
    return expr;
  }
};
