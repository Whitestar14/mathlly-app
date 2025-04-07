import { useSettingsStore } from '@/stores/settings';
import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator';
import { CalculatorConstants } from '@/utils/constants/CalculatorConstants';

/**
 * Interface for calculator implementations.
 * All calculator types should implement these methods.
 * 
 * @class ICalculator
 */
export class ICalculator {
  /**
   * Create a calculator instance
   * 
   * @param {Object} settings - Calculator settings
   */
  constructor(settings) {
    // Fallback to settings store if not provided
    this.settings = settings || useSettingsStore();
    this.input = '0';
    this.error = '';
    this.currentExpression = '';
    this.activeBase = 'DEC';
    
    // Use shared evaluator instance
    this.evaluator = ExpressionEvaluator.getInstance();
    
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
   * Evaluate a mathematical expression
   * 
   * @param {string} expr - Expression to evaluate
   * @param {string} [base] - Base for programmer mode
   * @returns {*} Evaluation result
   * @throws {Error} If expression is invalid
   */
  evaluateExpression(expr, base) {
    try {
      return this.evaluator.evaluate(expr, {
        base,
        maxValue: CalculatorConstants.MAX_VALUE,
        minValue: CalculatorConstants.MIN_VALUE
      });
    } catch (err) {
      throw new Error(`Invalid expression: ${err.message}`);
    }
  }

  /**
   * Format a result for display
   * 
   * @param {*} result - Result to format
   * @param {string} [base] - Base for programmer mode
   * @returns {string} Formatted result
   */
  formatResult(result, base) {
    // Add eslint-disable-next-line to suppress the warning
    // eslint-disable-next-line no-unused-vars
    throw new Error('formatResult must be implemented in derived class');
  }

  /**
   * Handle button click
   * 
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
      return this.createErrorResponse(
        'Maximum input length reached',
        this.input
      );
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
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle equals operation
   * 
   * @returns {Object} Calculation result
   */
  handleEquals() {
    throw new Error('handleEquals must be implemented in derived class');
  }

  /**
   * Handle operator input
   * 
   * @param {string} operator - Operator symbol
   * @returns {Object} Updated state
   */
  handleOperator(operator) {
    throw new Error('handleOperator must be implemented in derived class');
  }

  /**
   * Handle number input
   * 
   * @param {string} num - Number or digit
   * @returns {Object} Updated state
   */
  handleNumber(num) {
    throw new Error('handleNumber must be implemented in derived class');
  }

  /**
   * Handle backspace operation
   * 
   * @returns {Object} Updated state
   */
  handleBackspace() {
    throw new Error('handleBackspace must be implemented in derived class');
  }

  /**
   * Clear calculator state
   * 
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
   * 
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
