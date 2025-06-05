import { ICalculator } from "@/utils/core/ICalculator.ts";
import { StandardOperations } from "@/utils/operations/StandardOperations";
import { StandardCalculations } from "@/utils/calculations/StandardCalculations";
import { CalculatorConstants } from "@/utils/constants/CalculatorConstants.ts";

/**
 * Calculator implementation for standard mode
 * 
 * @class StandardCalculator
 * @extends ICalculator
 */
export class StandardCalculator extends ICalculator {
  /**
   * Create a new standard calculator
   * 
   * @param {Object} settings - Calculator settings
   */
  constructor(settings) {
    super(settings);
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.STANDARD;
    
    // Use composition for calculations and operations
    this.calculations = new StandardCalculations(settings);
    this.operations = new StandardOperations(this);
  }

  /**
   * Format a result for display
   * 
   * @param {*} result - Result to format
   * @returns {string} Formatted result
   */
  formatResult(result) {
    return this.calculations.formatResult(result);
  }

  /**
   * Handle equals operation
   * 
   * @returns {Object} Calculation result
   */
  handleEquals() {
    try {
      this.currentExpression = this.input;
      const result = this.evaluateExpression(this.currentExpression);
      this.input = this.formatResult(result);

      return this.normalizeResponse({
        expression: this.currentExpression,
        result: this.input,
        input: this.input
      });
    } catch (err) {
      return this.createErrorResponse(err, this.input);
    }
  }

  /**
   * Handle operator input
   * 
   * @param {string} op - Operator symbol
   * @returns {Object} Updated state
   */
  handleOperator(op) {
    return this.normalizeResponse(this.operations.handleOperator(op));
  }

  /**
   * Handle number input
   * 
   * @param {string} num - Number or digit
   * @returns {Object} Updated state
   */
  handleNumber(num) {
    return this.normalizeResponse(this.operations.handleNumber(num));
  }

  /**
   * Handle backspace operation
   * 
   * @returns {Object} Updated state
   */
  handleBackspace() {
    return this.normalizeResponse(this.operations.handleBackspace());
  }

  /**
   * Handle square operation
   * 
   * @returns {Object} Updated state
   */
  handleSquare() {
    return this.normalizeResponse(this.operations.handleSquare());
  }

  /**
   * Handle square root operation
   * 
   * @returns {Object} Updated state
   */
  handleSquareRoot() {
    return this.normalizeResponse(this.operations.handleSquareRoot());
  }

  /**
   * Handle reciprocal operation
   * 
   * @returns {Object} Updated state
   */
  handleReciprocal() {
    return this.normalizeResponse(this.operations.handleReciprocal());
  }

  /**
   * Handle percentage operation
   * 
   * @returns {Object} Updated state
   */
  handlePercentage() {
    return this.normalizeResponse(this.operations.handlePercentage());
  }
}
