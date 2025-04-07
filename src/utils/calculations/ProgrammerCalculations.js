import { isNegative, isNaN } from 'mathjs';
import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator';
import { CalculatorConstants } from '@/utils/constants/CalculatorConstants';
/**
 * Handles calculations for programmer calculator
 */
export class ProgrammerCalculations {
  /**
   * Create a new programmer calculations instance
   * @param {Object} settings - Calculator settings
   */
  constructor(settings) {
    this.settings = settings;
    this.bases = CalculatorConstants.BASES;
    this.evaluator = ExpressionEvaluator.getInstance();
  }

  /**
   * Evaluate a mathematical expression
   * @param {string} expr - Expression to evaluate
   * @param {string} base - Base for evaluation
   * @returns {Object} Evaluation result
   */
  evaluateExpression(expr, base) {
    try {
      return this.evaluator.evaluate(expr, { base });
    } catch (err) {
      // Preserve specific error messages
      if (
        err.message.includes('Division by zero') ||
        err.message === 'Invalid operation' ||
        err.message === 'Overflow' ||
        err.message === 'Invalid expression format'
      ) {
        throw err;
      }
      throw new Error('Invalid expression: ' + err.message);
    }
  }

  /**
   * Format calculation result for display
   * @param {Object} result - Result to format
   * @param {string} base - Base for formatting
   * @returns {string} Formatted result
   */
  formatResult(result, base) {
    if (!result && result !== 0) return 'Overflow';

    try {
      const absoluteValue = Math.abs(result);
      const converted = absoluteValue.toString(this.bases[base]).toUpperCase();

      return isNegative(result) ? '-' + converted : converted;
    } catch (err) {
      console.error('Error formatting result:', err);
      return 'Overflow';
    }
  }

  /**
   * Convert value between bases
   * @param {string|number} value - Value to convert
   * @param {string} fromBase - Source base
   * @param {string} toBase - Target base
   * @returns {string} Converted value
   */
  convertToBase(value, fromBase, toBase) {
    try {
      if (!value || value === 'Overflow') return '0';

      // Handle negative values
      const isNegative = typeof value === 'string' && value.startsWith('-');
      const absValue = isNegative ? value.substring(1) : value;

      const decimal = parseInt(absValue.toString(), this.bases[fromBase]);
      if (isNaN(decimal)) return '0';
      if (Math.abs(decimal) > this.evaluator.MAX_VALUE) return 'Overflow';

      const result = decimal.toString(this.bases[toBase]).toUpperCase();
      return isNegative ? '-' + result : result;
    } catch (err) {
      console.error('Error converting between bases:', err);
      return '0';
    }
  }
}
