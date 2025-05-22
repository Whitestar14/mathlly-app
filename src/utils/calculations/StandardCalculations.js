import { format, fraction } from "mathjs";
import { ExpressionEvaluator } from "@/utils/core/ExpressionEvaluator";
import { CalculatorUtils } from "@/utils/constants/CalculatorConstants"

/**
 * Handles calculations for the standard calculator mode
 */
export class StandardCalculations {
  /**
   * Creates a new StandardCalculations instance
   * @param {Object} settings - Calculator settings including precision and fraction preferences
   */
  constructor(settings) {
    this.settings = settings;
    this.evaluator = ExpressionEvaluator.getInstance();
  }

  /**
   * Evaluates a mathematical expression
   * @param {string} expr - The expression to evaluate
   * @returns {number} The evaluated result
   * @throws {Error} If the expression is invalid or causes an error
   */
  evaluateExpression(expr) {
    try {
      // Use sanitized expression from CalculatorUtils
      const sanitizedExpr = CalculatorUtils.sanitizeExpression(expr);
      return this.evaluator.evaluate(sanitizedExpr);
    } catch (err) {
      // Use CalculatorUtils.formatError for consistent error handling
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  /**
   * Formats a numeric result according to calculator settings
   * @param {number} result - The numeric result to format
   * @returns {string} The formatted result as a string
   */
  formatResult(result) {
    if (!result && result !== 0) return "Overflow";

    try {
      // Try to display as fraction if enabled in settings
      if (this.settings.display.useFractions) {
        // feature: Add an option to enable mixed fraction conversion
        return fraction(result).toFraction(/** true */);
      }

      // Handle special cases for very large or very small numbers
      if (
        Math.abs(result) >= 1e21 ||
        (Math.abs(result) < 1e-7 && result !== 0)
      ) {
        return format(result, {
          precision: this.settings.display.precision,
          notation: "exponential",
        });
      }

      // For regular numbers
      const isInteger = Number.isInteger(result);
      if (isInteger) {
        return result.toString();
      }

      // For decimal numbers, respect precision but trim unnecessary zeros
      const formattedDecimal = format(result, {
        precision: this.settings.display.precision,
        notation: "fixed",
      });

      return CalculatorUtils.trimUnnecessaryZeros(formattedDecimal);
    } catch (err) {
      console.error("Formatting error:", err);
      return result.toString();
    }
  }
}
