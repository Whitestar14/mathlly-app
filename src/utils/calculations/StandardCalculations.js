import { evaluate, format, bignumber, fraction } from "mathjs";
import { DisplayFormatter } from "@/services/display/DisplayFormatter";

export class StandardCalculations {
  constructor(settings) {
    this.settings = settings;
    this.MAX_VALUE = bignumber("9223372036854775807");
    this.MAX_INPUT_LENGTH = 100;
  }

  sanitizeInput(expr) {
    // Allow e/E for scientific notation along with other characters
    const allowedChars = /[^0-9+\-×÷.()%e/]/g;
    return expr.replace(allowedChars, "").slice(0, this.MAX_INPUT_LENGTH);
  }

  evaluateExpression(expr) {
    try {
      let sanitizedExpr = this.sanitizeInput(expr)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[+\-*/]\s*$/, "")
        .replace(/\s+/g, " ")
        .replace(/([0-9])([e])([-+]?)([0-9]+)/g, "$1 * 10^($3$4)")
        .trim();

      if (sanitizedExpr.includes("/0")) {
        throw new Error("Division by zero is not allowed");
      }

      const result = evaluate(sanitizedExpr);

      if (typeof result !== "number" && !result.isBigNumber) {
        throw new Error("Invalid result");
      }

      return result;
    } catch (err) {
      throw new Error("Invalid expression: " + err.message);
    }
  }

  formatResult(result) {
    if (result === undefined) return "";

    try {
      if (this.settings.useFractions) {
        const frac = fraction(result);
        if (frac.d <= 10000) {
          return frac.d === 1 ? `${frac.n}` : `${frac.n}/${frac.d}`;
        }
      }
      const precision = Math.abs(result) > 1e10 ?
        Math.min(this.settings.precision + 4, 12) :
         this.settings.precision;

      const formattedResult = format(result, {
        precision: precision,
        notation:
          Math.abs(result) >= 1e21 || (Math.abs(result) < 1e-7 && result !== 0)
            ? "exponential"
            : "fixed",
      });
  
      // Use DisplayFormatter for thousands separator
      return DisplayFormatter.formatStandard(
        formattedResult,
        this.settings.useThousandsSeparator
      );
    } catch (err) {
      console.error("Formatting error:", err);
      return result.toString();
    }
  }
}
