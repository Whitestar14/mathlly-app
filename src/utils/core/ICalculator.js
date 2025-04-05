import { useSettingsStore } from '@/stores/settings';

/**
 * Interface for calculator implementations.
 * All calculator types should implement these methods
 */
export class ICalculator {
  /**
   * Create a calculator core instance
   * @param {Object} settings - Calculator settings
   */
  constructor(settings) {
    // Fallback to settings store if not provided
    this.settings = settings || useSettingsStore();
    this.input = '0';
    this.error = '';
    this.currentExpression = '';
    this.activeBase = 'DEC';
    this.MAX_INPUT_LENGTH = 50;

    // Operations will be injected by derived classes
    this.operations = null;
    this.calculations = null;
  }

  /**
   * Creates a standardized error response object
   *
   * @param {Error|string} error - The error object or message
   * @param {string} [fallbackInput="Error"] - Fallback input value to display
   * @returns {Object} Standardized error response object
   */
  createErrorResponse(error, fallbackInput = 'Error') {
    // Extract message from Error object or use the string directly
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Operation failed';

    // Update calculator state
    this.error = errorMessage;
    this.input = fallbackInput;

    // Return standardized error response
    return {
      input: this.input,
      error: this.error,
      expression: this.currentExpression,
      success: false,
    };
  }

  /**
   * Normalizes operation results to a standard response format
   *
   * @param {Object} result - The operation result object
   * @returns {Object} Normalized response object with consistent properties
   */
  normalizeResponse(result) {
    // Handle null or undefined result
    if (!result) {
      return this.createErrorResponse('Invalid operation result');
    }

    // Create standardized response with defaults for missing properties
    return {
      input: result.input ?? this.input,
      error: result.error ?? '',
      expression: result.expression ?? this.currentExpression,
      displayValues: result.displayValues ?? undefined,
      result: result.result,
      success: !result.error,
    };
  }

/**
 * Evaluate a mathematical expression - must be implemented by derived classes
 * @param {string} expr - Expression to evaluate
 * @param {string} [base] - Base for programmer mode
 * @returns {*} Evaluation result
 */
evaluateExpression(expr, base) {
  // eslint-disable-next-line no-unused-vars
  throw new Error("evaluateExpression must be implemented in derived class");
}

  /**
   * Format a result for display
   * @param {*} result - Result to format
   * @param {string} [base] - Base for programmer mode
   * @returns {string} Formatted result
   */
  formatResult(result, base) {
    // Add eslint-disable-next-line to suppress the warning
    // eslint-disable-next-line no-unused-vars
    return result.toString();
  }
  /**
   * Handle button click
   * @param {string} btn - Button value
   * @returns {Object} Updated state
   */
  handleButtonClick(btn) {
    // Check for error state first
    if (this.input === 'Error' && !['AC', 'CE'].includes(btn)) {
      this.handleClear();
    }

    // Check input length
    if (this.isInputTooLong(btn)) {
      this.error = 'Maximum input length reached';
      return {
        input: this.input,
        error: this.error,
      };
    }

    try {
      // Process button based on type
      if (btn === '=') {
        return this.handleEquals();
      } else if (['AC', 'CE'].includes(btn)) {
        return this.handleClear();
      } else if (btn === 'backspace') {
        return this.handleBackspace();
      } else if (['+', '-', '×', '÷'].includes(btn)) {
        return this.handleOperator(btn);
      } else {
        return this.handleNumber(btn);
      }
    } catch (err) {
      this.error = err.message || 'Operation failed';
      return {
        input: 'Error',
        error: this.error,
      };
    }
  }

  /**
   * Handle equals operation - must be implemented by derived classes
   * @returns {Object} Calculation result
   */
  handleEquals() {
    throw new Error('handleEquals must be implemented in derived class');
  }

  /**
   * Handle operator input - must be implemented by derived classes
   * @param {string} operator - Operator symbol
   * @returns {Object} Updated state
   */
  handleOperator(operator) {
    // eslint-disable-next-line no-unused-vars
    throw new Error('handleOperator must be implemented in derived class');
  }

  /**
   * Handle number input - must be implemented by derived classes
   * @param {string} num - Number or digit
   * @returns {Object} Updated state
   */
  handleNumber(num) {
    // eslint-disable-next-line no-unused-vars
    throw new Error('handleNumber must be implemented in derived class');
  }

  /**
   * Handle backspace operation - must be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleBackspace() {
    throw new Error('handleBackspace must be implemented in derived class');
  }

  /**
   * Clear calculator state
   * @returns {Object} Updated state
   */
  handleClear() {
    this.input = '0';
    this.error = '';
    this.currentExpression = '';
    return {
      input: this.input,
      error: this.error,
    };
  }

  /**
   * Check if input is too long
   * @param {string} btn - Button being pressed
   * @returns {boolean} True if input would be too long
   */
  isInputTooLong(btn) {
    const excludedButtons = [
      '=',
      'AC',
      'backspace',
      'MC',
      'MR',
      'M+',
      'M-',
      'MS',
      'CE',
    ];
    return (
      this.input.length >= this.MAX_INPUT_LENGTH &&
      !excludedButtons.includes(btn)
    );
  }
}
