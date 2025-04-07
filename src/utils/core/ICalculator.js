import { useSettingsStore } from '@/stores/settings';
import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator';
import {
  CalculatorConstants,
  CalculatorUtils,
} from '@/utils/constants/CalculatorConstants';

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
    // Use CalculatorUtils.formatError for consistent error handling
    const errorMessage = CalculatorUtils.formatError(
      error instanceof Error ? error : new Error(error || 'Operation failed')
    );

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

    // Use CalculatorUtils.createResponse for standardized response format
    return CalculatorUtils.createResponse({
      input: result.input ?? this.input,
      error: result.error ?? '',
      expression: result.expression ?? this.currentExpression,
      displayValues: result.displayValues ?? undefined,
      result: result.result,
    });
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
        minValue: CalculatorConstants.MIN_VALUE,
      });
    } catch (err) {
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'));
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
    // eslint-disable-next-line no-unused-vars
    throw new Error('formatResult must be implemented in derived class');
  }

  /**
   * Process button input and route to appropriate handler
   * @param {string} btn - Button value
   * @returns {Object} Processing result
   */
  processButton(btn) {
    try {
      this.error = '';

      // Handle basic calculator operations
      switch (btn) {
        // Equals operation
        case '=':
          return this.handleEquals();

        // Clear operations
        case 'AC':
          return this.handleClear();
        case 'CE':
          return this.handleClearEntry
            ? this.handleClearEntry()
            : this.handleClear();

        // Delete operation
        case 'backspace':
          return this.handleBackspace();

        // Basic arithmetic operators
        case '+':
        case '-':
        case '×':
        case '÷':
          return this.handleOperator(btn);

        // Scientific operations
        case 'x²':
          return this.handleSquare
            ? this.handleSquare()
            : this.createErrorResponse(new Error('Operation not supported'));
        case 'x³':
          return this.handleCube
            ? this.handleCube()
            : this.createErrorResponse(new Error('Operation not supported'));
        case '√':
          return this.handleSquareRoot
            ? this.handleSquareRoot()
            : this.createErrorResponse(new Error('Operation not supported'));
        case '∛':
          return this.handleCubeRoot
            ? this.handleCubeRoot()
            : this.createErrorResponse(new Error('Operation not supported'));
        case '1/x':
          return this.handleReciprocal
            ? this.handleReciprocal()
            : this.createErrorResponse(new Error('Operation not supported'));
        case '%':
          return this.handlePercentage
            ? this.handlePercentage()
            : this.createErrorResponse(new Error('Operation not supported'));
        case '±':
          return this.handleToggleSign
            ? this.handleToggleSign()
            : this.createErrorResponse(new Error('Operation not supported'));
        // Default case - handle as number or other input
        default:
          return this.handleNumber(btn);
      }
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle button click - main entry point for button processing
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
        new Error('Maximum input length reached'),
        this.input
      );
    }

    try {
      // Use the standardized processButton method
      return this.normalizeResponse(this.processButton(btn));
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
   * Handle clear entry operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleClearEntry() {
    return this.handleClear();
  }

  /**
   * Handle square operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleSquare() {
    return this.createErrorResponse(new Error('Operation not supported'));
  }

  /**
   * Handle cube operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleCube() {
    return this.createErrorResponse(new Error('Operation not supported'));
  }

  /**
   * Handle square root operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleSquareRoot() {
    return this.createErrorResponse(new Error('Operation not supported'));
  }

  /**
   * Handle cube root operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleCubeRoot() {
    return this.createErrorResponse(new Error('Operation not supported'));
  }

  /**
   * Handle reciprocal operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleReciprocal() {
    return this.createErrorResponse(new Error('Operation not supported'));
  }

  /**
   * Handle percentage operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handlePercentage() {
    return this.createErrorResponse(new Error('Operation not supported'));
  }

  /**
   * Handle sign toggle operation - may be implemented by derived classes
   * @returns {Object} Updated state
   */
  handleToggleSign() {
    return this.createErrorResponse(new Error('Operation not supported'));
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
      ...CalculatorConstants.BUTTON_TYPES.MEMORY,
      'CE',
    ];
    return (
      this.input.length >= this.MAX_INPUT_LENGTH &&
      !excludedButtons.includes(btn)
    );
  }
}
