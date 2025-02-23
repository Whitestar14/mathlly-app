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

  static trimUnnecessaryZeros(formattedNumber) {
    // Don't trim if in scientific notation
    if (formattedNumber.includes('e')) return formattedNumber;
    
    // Split into whole and decimal parts
    const [whole, decimal] = formattedNumber.split('.');
    
    // No decimal part, return as is
    if (!decimal) return whole;
    
    // Trim trailing zeros from decimal
    const trimmedDecimal = decimal.replace(/0+$/, '');
    
    // If all decimal digits were zeros, return whole number
    return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole;
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

      // Handle special cases first
      if (Math.abs(result) >= 1e21 || (Math.abs(result) < 1e-7 && result !== 0)) {
        return format(result, {
          precision: this.settings.precision,
          notation: 'exponential'
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
        notation: 'fixed'
      });

      // Remove trailing zeros after decimal point, but keep the decimal point if needed
      const parts = formattedDecimal.split('.');
      if (parts.length === 2) {
        const trimmedDecimal = parts[1].replace(/0+$/, '');
        return trimmedDecimal ? `${parts[0]}.${trimmedDecimal}` : parts[0];
      }

      // Use DisplayFormatter for thousands separator
      return DisplayFormatter.formatStandard(
        formattedDecimal,
        this.settings.useThousandsSeparator
      );
    } catch (err) {
      console.error("Formatting error:", err);
      return result.toString();
    }
  }
}
