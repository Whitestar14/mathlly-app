import { isNegative, isNaN } from 'mathjs';
import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator.ts';
import { CalculatorConstants, CalculatorUtils } from '@/utils/constants/CalculatorConstants.ts';

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
      // Use CalculatorUtils.sanitizeExpression for consistent sanitization
      const sanitizedExpr = CalculatorUtils.sanitizeExpression(expr);
      return this.evaluator.evaluate(sanitizedExpr, { base });
    } catch (err) {
      // Use CalculatorUtils.formatError for consistent error handling
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
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
      // Use CalculatorUtils.formatForBase for consistent formatting
      return CalculatorUtils.formatForBase(
        isNegative(result) ? -Math.abs(result) : Math.abs(result),
        base
      );
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

      // Use CalculatorUtils.isValidForBase for consistent validation
      if (!CalculatorUtils.isValidForBase(absValue, fromBase)) {
        return '0';
      }

      const decimal = parseInt(absValue.toString(), this.bases[fromBase]);
      if (isNaN(decimal)) return '0';
      
      // Check for overflow
      if (Math.abs(decimal) > CalculatorConstants.MAX_VALUE) return 'Overflow';

      // Use CalculatorUtils.formatForBase for consistent formatting
      const result = CalculatorUtils.formatForBase(decimal, toBase);
      return isNegative ? '-' + result : result;
    } catch (err) {
      console.error('Error converting between bases:', err);
      return '0';
    }
  }
}
