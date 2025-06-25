import { bignumber } from 'mathjs'

/**
 * Numeric bases enumeration
 */
export const BASES = {
  BIN: 2,
  OCT: 8,
  DEC: 10,
  HEX: 16
} as const

/**
 * Button categories for calculator operations
 */
export const BUTTON_TYPES = {
  OPERATORS: ['+', '-', '×', '÷', '%'] as const,
  FUNCTIONS: ['AC', 'CE', 'backspace', '=', '±'] as const,
  MEMORY: ['MC', 'MR', 'M+', 'M-', 'MS'] as const,
  PROGRAMMER_OPERATORS: ['<<', '>>', '&', '|', '^', '~'] as const,
  SCIENTIFIC_FUNCTIONS: [
    // Basic trig
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    // Reciprocal trig
    'csc', 'sec', 'cot', 'acsc', 'asec', 'acot',
    // Hyperbolic
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    // Reciprocal hyperbolic
    'csch', 'sech', 'coth', 'acsch', 'asech', 'acoth',
    // Logarithmic
    'log', 'ln', 'log2', 'exp',
    // Power functions
    '10^x', '2^x', 'e^x', 'x^y', 'x²', 'x³',
    // Root functions
    '√', '∛', 'y√x',
    // Other functions
    'abs', 'ceil', 'floor', 'round', 'factorial', '1/x',
    // Utility functions
    'rand', 'gcd', 'lcm', 'mod', 'dms', 'deg'
  ] as const
} as const

/**
 * Regular expressions for input validation and parsing
 */
export const REGEX = {
  OPERATOR: /[+\-×÷%]/,
  NUMBER: /[0-9A-Fa-f.]/,
  VALID_EXPRESSION: /^[0-9A-Fa-f\s+\-*/%()<<>>]*$/,
  LAST_OPERATOR: /\s*[+\-×÷%<<>>]\s*$/,
  DECIMAL_POINT: /\./,
  SHIFT_OPERATOR: /\s*[<>]{2}\s*$/,
  PARENTHESIS: /[()]/,
  SCIENTIFIC_FUNCTION: /^(sin|cos|tan|asin|acos|atan|csc|sec|cot|acsc|asec|acot|sinh|cosh|tanh|asinh|acosh|atanh|csch|sech|coth|acsch|asech|acoth|log|ln|log2|exp|sqrt|cbrt|abs|ceil|floor|round|factorial|gcd|lcm)\(/,
  TRIG_FUNCTION: /^(sin|cos|tan|asin|acos|atan|csc|sec|cot|acsc|asec|acot)\(/,
  HYPERBOLIC_FUNCTION: /^(sinh|cosh|tanh|asinh|acosh|atanh|csch|sech|coth|acsch|asech|acoth)\(/,
  LOG_FUNCTION: /^(log|ln|log2|exp)\(/,
  POWER_FUNCTION: /\^/,
  FACTORIAL: /\d+!/,
  CONSTANT: /π|e/
} as const

/**
 * Error messages for calculator operations
 */
export const ERROR_MESSAGES = {
  OVERFLOW: "Overflow: Evaluated result exceeding max limit",
  DIVISION_BY_ZERO: "Division by zero is not allowed",
  INVALID_EXPRESSION: "Invalid expression format",
  MAX_INPUT_LENGTH: "Maximum input length reached",
  NEGATIVE_SQUARE_ROOT: "Cannot calculate square root of negative number",
  OPERATION_ERROR: "Operation error",
  INVALID_BASE: "Invalid base for conversion",
  DOMAIN_ERROR: "Domain error: Invalid input for function",
  INVALID_ANGLE: "Invalid angle value",
  INVALID_LOGARITHM: "Cannot calculate logarithm of non-positive number"
} as const

/**
 * Function name mappings for display to internal representation
 */
export const FUNCTION_MAPPINGS = {
  'sin⁻¹': 'asin',
  'cos⁻¹': 'acos',
  'tan⁻¹': 'atan',
  'csc⁻¹': 'acsc',
  'sec⁻¹': 'asec',
  'cot⁻¹': 'acot',
  'sinh⁻¹': 'asinh',
  'cosh⁻¹': 'acosh',
  'tanh⁻¹': 'atanh',
  'csch⁻¹': 'acsch',
  'sech⁻¹': 'asech',
  'coth⁻¹': 'acoth',  
  'log₂': 'log2',
  'exp': 'exp',
  '10ˣ': '10^',
  '2ˣ': '2^',
  'eˣ': 'e^',
  'ln': 'ln',    
  '²√x': '√',
  '³√x': '∛',
  'ʸ√x': 'y√x',
  '¹⁄ₓ': '1/x',
  'xʸ': 'x^y',
  '⌈x⌉': 'ceil',
  '⌊x⌋': 'floor',
  '→DMS': 'dms',
  '→DEG': 'deg'
} as const

/**
 * Shared constants for calculator implementations
 */
export const CalculatorConstants = {
  /**
   * Maximum value (63-bit signed integer limit)
   */
  MAX_VALUE: bignumber("9223372036854775807"),
  
  /**
   * Minimum value (63-bit signed integer limit)
   */
  MIN_VALUE: bignumber("-9223372036854775808"),
  
  /**
   * Numeric bases
   */
  BASES,
  
  /**
   * Input length limits
   */
  MAX_INPUT_LENGTH: {
    STANDARD: 100,
    PROGRAMMER: 69
  } as const,
  
  /**
   * Button categories
   */
  BUTTON_TYPES,
  
  /**
   * Regular expressions
   */
  REGEX,
  
  /**
   * Error messages
   */
  ERROR_MESSAGES,

  /**
   * Function mappings
   */
  FUNCTION_MAPPINGS
} as const

// Type definitions
export type BaseType = keyof typeof BASES
export type OperatorType = typeof BUTTON_TYPES.OPERATORS[number]
export type FunctionType = typeof BUTTON_TYPES.FUNCTIONS[number]
export type MemoryType = typeof BUTTON_TYPES.MEMORY[number]
export type ProgrammerOperatorType = typeof BUTTON_TYPES.PROGRAMMER_OPERATORS[number]
export type ErrorMessageType = keyof typeof ERROR_MESSAGES

/**
 * Utility functions for calculator operations
 */
export const CalculatorUtils = {
  /**
   * Check if a character is an operator
   * @param char - Character to check
   * @returns True if character is an operator
   */
  isOperator(char: string): char is OperatorType {
    return BUTTON_TYPES.OPERATORS.includes(char as OperatorType)
  },
  
  /**
   * Check if a value is valid for a specific base
   * @param value - Value to check
   * @param base - Base to check against
   * @returns True if value is valid for base
   */
  isValidForBase(value: string, base: BaseType): boolean {
    if (!value || typeof value !== 'string') return false
    
    const patterns: Record<BaseType, RegExp> = {
      BIN: /^-?[01]+$/,
      OCT: /^-?[0-7]+$/,
      DEC: /^-?[0-9]+$/,
      HEX: /^-?[0-9A-Fa-f]+$/
    }

    const pattern = patterns[base]
    if (!pattern) return false

    // Handle negative numbers
    const testValue = value.startsWith('-') ? value.slice(1) : value
    return pattern.test(testValue)
  },
  
  /**
   * Trim unnecessary zeros from a formatted number
   * @param formattedNumber - Number to trim
   * @returns Trimmed number
   */
  trimUnnecessaryZeros(formattedNumber: string): string {
    if (formattedNumber.includes('e')) return formattedNumber
    
    const [whole, decimal] = formattedNumber.split('.')
    if (!decimal) return whole
    const trimmedDecimal = decimal.replace(/0+$/, '')
    
    return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole
  },

  /**
   * Sanitize an expression for evaluation
   * @param expr - Expression to sanitize
   * @returns Sanitized expression
   */
  sanitizeExpression(expr: string): string {
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, ' ')
      .replace(/[+\-*/]\s*$/, '')
      .trim()
  },

  /**
   * Create a standardized response object
   * @param data - Response data
   * @returns Standardized response
   */
  createResponse<T = any>(data: {
    input?: string
    error?: string
    expression?: string
    result?: T
    displayValues?: Record<string, any>
  }): {
    input: string
    error: string
    expression: string
    result?: T
    displayValues?: Record<string, any>
    success: boolean
  } {
    return {
      input: data.input || '0',
      error: data.error || '',
      expression: data.expression || '',
      result: data.result,
      displayValues: data.displayValues,
      success: !data.error
    }
  },

  /**
   * Handle common error cases
   * @param error - Error object
   * @param defaultMessage - Default error message
   * @returns Formatted error message
   */
  formatError(error: Error | string | null | undefined, defaultMessage: string = "Operation failed"): string {
    if (!error) return defaultMessage
    
    const errorMessage = typeof error === 'string' ? error : error.message

    // Handle specific error types
    if (errorMessage.includes("division by zero")) {
      return ERROR_MESSAGES.DIVISION_BY_ZERO
    }
    
    if (errorMessage.includes("overflow")) {
      return ERROR_MESSAGES.OVERFLOW
    }
    
    if (errorMessage.includes("square root of negative")) {
      return ERROR_MESSAGES.NEGATIVE_SQUARE_ROOT
    }
    
    return errorMessage || defaultMessage
  },
  
  /**
   * Check if input contains a valid number
   * @param input - Input to check
   * @returns True if input contains a valid number
   */
  containsValidNumber(input: string): boolean {
    return /\d/.test(input)
  },
  
  /**
   * Split expression into parts preserving operators
   * @param expr - Expression to split
   * @returns Array of expression parts
   */
  splitExpression(expr: string): string[] {
    return expr.split(/([+\-×÷%]|\s+<<\s+|\s+>>\s+)/)
  },
  
  /**
   * Check if expression ends with an operator
   * @param expr - Expression to check
   * @returns True if expression ends with an operator
   */
  endsWithOperator(expr: string): boolean {
    return REGEX.LAST_OPERATOR.test(expr.trim())
  },
  
  /**
   * Remove last operator from expression
   * @param expr - Expression to modify
   * @returns Expression without last operator
   */
  removeLastOperator(expr: string): string {
    return expr.replace(REGEX.LAST_OPERATOR, '')
  },
  
  /**
   * Check if a string represents a valid number in any base
   * @param str - String to check
   * @param base - Base to check against
   * @returns True if string is a valid number
   */
  isValidNumber(str: string, base: BaseType = 'DEC'): boolean {
    if (!str || typeof str !== 'string') return false
    
    switch(base) {
      case 'BIN': return /^-?[01]+$/.test(str)
      case 'OCT': return /^-?[0-7]+$/.test(str)
      case 'DEC': return /^-?[0-9]+(\.[0-9]*)?$/.test(str)
      case 'HEX': return /^-?[0-9A-Fa-f]+$/.test(str)
      default: return false
    }
  },
  
  /**
   * Format number for display according to base
   * @param num - Number to format
   * @param base - Base for formatting
   * @returns Formatted number
   */
  formatForBase(num: number | string, base: BaseType): string {
    if (num === undefined || num === null) return '0'
    
    try {
      const numValue = typeof num === 'string' ? parseFloat(num) : num
      
      if (isNaN(numValue)) return '0'
      
      const isNegative = numValue < 0
      const absValue = Math.floor(Math.abs(numValue))
      
      let result: string
      switch(base) {
        case 'BIN': result = Math.floor(absValue).toString(2); break
        case 'OCT': result = Math.floor(absValue).toString(8); break
        case 'HEX': result = Math.floor(absValue).toString(16).toUpperCase(); break
        case 'DEC': 
        default:
          result = absValue.toString()
      }
      
      return isNegative ? '-' + result : result
    } catch (err) {
      console.error('Error formatting number:', err)
      return '0'
    }
  },
  
  /**
   * Check if expression has balanced parentheses
   * @param expr - Expression to check
   * @returns True if parentheses are balanced
   */
  hasBalancedParentheses(expr: string): boolean {
    let count = 0
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') count++
      else if (expr[i] === ')') {
        count--
        if (count < 0) return false
      }
    }
    return count === 0
  },
  
  /**
   * Check if expression ends with a shift operator
   * @param expr - Expression to check
   * @returns True if expression ends with a shift operator
   */
  endsWithShiftOperator(expr: string): boolean {
    return REGEX.SHIFT_OPERATOR.test(expr.trim())
  },
  
  /**
   * Remove shift operator from expression
   * @param expr - Expression to modify
   * @returns Expression without shift operator
   */
  removeShiftOperator(expr: string): string {
    return expr.replace(REGEX.SHIFT_OPERATOR, '')
  },
  
  /**
   * Convert between bases with error handling
   * @param value - Value to convert
   * @param fromBase - Source base
   * @param toBase - Target base
   * @returns Converted value or error message
   */
  convertBetweenBases(value: string | number, fromBase: BaseType, toBase: BaseType): string {
    try {
      if (!value || value === 'Overflow') return '0'
      
      // Handle negative values
      const isNegative = typeof value === 'string' && value.startsWith('-')
      const absValue = isNegative ? value.substring(1) : value
      
      // Convert from source base to decimal first
      let decimalValue: number
      
      if (fromBase === 'DEC') {
        decimalValue = typeof absValue === 'string' ? parseFloat(absValue) : absValue
      } else {
        decimalValue = parseInt(absValue.toString(), BASES[fromBase])
      }
      
      if (isNaN(decimalValue)) return '0'
      
      // Convert from decimal to target base
      let result: string
      if (toBase === 'DEC') {
        result = Math.floor(decimalValue).toString()
      } else {
        result = Math.floor(decimalValue).toString(BASES[toBase])
        if (toBase === 'HEX') result = result.toUpperCase()
      }
      
      return isNegative ? '-' + result : result
    } catch (err) {
      console.error('Base conversion error:', err)
      return '0'
    }
  },

  /**
   * Check if a string represents a scientific function
   * @param str - String to check
   * @returns True if string is a scientific function
   */
  isScientificFunction(str: string): boolean {
    return REGEX.SCIENTIFIC_FUNCTION.test(str)
  },

  /**
   * Check if a string represents a trigonometric function
   * @param str - String to check
   * @returns True if string is a trigonometric function
   */
  isTrigFunction(str: string): boolean {
    return REGEX.TRIG_FUNCTION.test(str)
  },

  /**
   * Check if a string represents a hyperbolic function
   * @param str - String to check
   * @returns True if string is a hyperbolic function
   */
  isHyperbolicFunction(str: string): boolean {
    return REGEX.HYPERBOLIC_FUNCTION.test(str)
  },

  /**
   * Check if a string represents a logarithmic function
   * @param str - String to check
   * @returns True if string is a logarithmic function
   */
  isLogFunction(str: string): boolean {
    return REGEX.LOG_FUNCTION.test(str)
  },

  /**
   * Validate angle input based on mode
   * @param angle - Angle value
   * @param mode - Angle mode (RAD, DEG, GRAD)
   * @returns True if angle is valid
   */
  isValidAngle(angle: number, mode: 'RAD' | 'DEG' | 'GRAD'): boolean {
    if (!isFinite(angle)) return false
    
    switch (mode) {
      case 'DEG':
        return angle >= -360 && angle <= 360
      case 'GRAD':
        return angle >= -400 && angle <= 400
      case 'RAD':
      default:
        return angle >= -2 * Math.PI && angle <= 2 * Math.PI
    }
  },

  /**
   * Format error message for scientific functions
   * @param error - Error object
   * @param functionName - Name of the function that caused the error
   * @returns Formatted error message
   */
  formatScientificError(error: Error | string | null | undefined, functionName?: string): string {
    if (!error) return ERROR_MESSAGES.OPERATION_ERROR
    
    const errorMessage = typeof error === 'string' ? error : error.message
    
    // Handle specific scientific function errors
    if (errorMessage.includes("domain") || errorMessage.includes("Domain")) {
      return ERROR_MESSAGES.DOMAIN_ERROR
    }
    
    if (errorMessage.includes("logarithm") && errorMessage.includes("negative")) {
      return ERROR_MESSAGES.INVALID_LOGARITHM
    }
    
    if (functionName && this.isTrigFunction(functionName) && errorMessage.includes("invalid")) {
      return ERROR_MESSAGES.INVALID_ANGLE
    }
    
    return this.formatError(error, ERROR_MESSAGES.OPERATION_ERROR)
  },

  /**
   * Map display function names to actual function names
   * @param func - Function name to map
   * @returns Mapped function name
   */
  mapFunctionName(func: string): string {
    return FUNCTION_MAPPINGS[func as keyof typeof FUNCTION_MAPPINGS] || func
  },

  /**
   * Handle special backspace cases for functions and operators
   * @param currentInput - Current input string
   * @returns Object with handled flag and updated input
   */
  handleSpecialBackspace(currentInput: string): { handled: boolean; input: string } {
    // Check for function names to remove completely
    const functionMatches = currentInput.match(/(\w+)\($/) || currentInput.match(/(\w+)\($/)
    if (functionMatches) {
      return {
        handled: true,
        input: currentInput.slice(0, -functionMatches[1].length - 1)
      }
    }
    
    // Check for operators with spaces
    if (/ [+\-×÷] $/.test(currentInput)) {
      return {
        handled: true,
        input: currentInput.slice(0, -3)
      }
    }
    
    return { handled: false, input: currentInput }
  }
} as const
