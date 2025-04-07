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
      return this.evaluator.evaluate(expr);
    } catch (err) {
      // Preserve specific error messages
      if (err.message.includes("Division by zero") || 
          err.message === "Invalid operation" ||
          err.message === "Overflow" ||
          err.message === "Invalid expression format") {
        throw err;
      }
      throw new Error("Invalid expression: " + err.message);
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
      if (this.settings.useFractions) {
        const frac = fraction(result);
        if (frac.d <= 10000) {
          return Number(frac.d) === 1 ? `${frac.n}` : `${frac.n}/${frac.d}`;
        }
      }

      // Handle special cases for very large or very small numbers
      if (
        Math.abs(result) >= 1e21 ||
        (Math.abs(result) < 1e-7 && result !== 0)
      ) {
        return format(result, {
          precision: this.settings.precision,
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
        precision: this.settings.precision,
        notation: "fixed",
      });

      // Remove trailing zeros after decimal point, but keep the decimal point if needed
      return CalculatorUtils.trimUnnecessaryZeros(formattedDecimal);
    } catch (err) {
      console.error("Formatting error:", err);
      return result.toString();
    }
  }
}
