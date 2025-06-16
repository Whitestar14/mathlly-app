import { ICalculator } from "@/utils/core/ICalculator.ts";
import { StandardOperations } from "@/utils/operations/StandardOperations.ts";
import { StandardCalculations } from "@/utils/calculations/StandardCalculations.ts";
import { CalculatorConstants } from "@/utils/constants/CalculatorConstants.ts";

/**
 * Calculator implementation for standard mode
 * 
 * @class StandardCalculator
 * @extends ICalculator
 */
export class StandardCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number;
  calculations: StandardCalculations;
  operations: StandardOperations;

  /**
   * Create a new standard calculator
   * 
   * @param {Object} settings - Calculator settings
   */
  constructor(settings: any) {
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
  formatResult(result: any): string {
    return this.calculations.formatResult(result);
  }

  /**
   * Handle equals operation
   * 
   * @returns {Object} Calculation result
   */
  handleEquals(): Record<string, any> {
    try {
      this.currentExpression = this.input;
      const result = this.evaluateExpression(this.currentExpression);
      this.input = this.formatResult(result);
      return this.normalizeResponse({
        expression: this.currentExpression,
        result: this.input,
        input: this.input
      });
    } catch (err: any) {
      return this.createErrorResponse(err, this.input);
    }
  }

  /**
   * Handle operator input
   * 
   * @param {string} op - Operator symbol
   * @returns {Object} Updated state
   */
  handleOperator(op: string): Record<string, any> {
    return this.normalizeResponse(this.operations.handleOperator(op));
  }

  /**
   * Handle number input
   * 
   * @param {string} num - Number or digit
   * @returns {Object} Updated state
   */
  handleNumber(num: string): Record<string, any> {
    return this.normalizeResponse(this.operations.handleNumber(num));
  }

  /**
   * Handle backspace operation
   * 
   * @returns {Object} Updated state
   */
  handleBackspace(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleBackspace());
  }

  /**
   * Handle square operation
   * 
   * @returns {Object} Updated state
   */
  handleSquare(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleSquare());
  }

  /**
   * Handle square root operation
   * 
   * @returns {Object} Updated state
   */
  handleSquareRoot(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleSquareRoot());
  }

  /**
   * Handle reciprocal operation
   * 
   * @returns {Object} Updated state
   */
  handleReciprocal(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleReciprocal());
  }

  /**
   * Handle percentage operation
   * 
   * @returns {Object} Updated state
   */
  handlePercentage(): Record<string, any> {
    return this.normalizeResponse(this.operations.handlePercentage());
  }

  /**
   * Handle sign toggle operation
   * 
   * @returns {Object} Updated state
   */
  handleToggleSign(): Record<string, any> {
    return this.normalizeResponse(this.operations.handleToggleSign());
  }
}
