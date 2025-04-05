import { evaluate, bignumber, isNegative, isNaN } from "mathjs";

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
    // 63-bit signed integer limits
    this.MAX_VALUE = bignumber("9223372036854775807");
    this.MIN_VALUE = bignumber("-9223372036854775808"); 
    this.bases = {
      BIN: 2,
      OCT: 8,
      DEC: 10,
      HEX: 16
    };
  }

  /**
   * Evaluate a mathematical expression
   * @param {string} expr - Expression to evaluate
   * @param {string} base - Base for evaluation
   * @returns {Object} Evaluation result
   */
  evaluateExpression(expr, base) {
    if (!expr || expr.trim() === "") return bignumber(0);

    // Check for division by zero before sanitization
    if (expr.includes('÷ 0') || expr.includes('/ 0')) {
      throw new Error("Division by zero is not allowed");
    }

    const sanitizedExpr = this.sanitizeExpression(expr, base);
    
    if (!sanitizedExpr) {
      throw new Error("Invalid expression format");
    }
    
    try {
      const result = evaluate(sanitizedExpr);
      
      // Handle invalid results
      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid operation");
      }
      
      // Check for overflow against 63-bit limits
      if (result > this.MAX_VALUE || result < this.MIN_VALUE) {
        throw new Error("Overflow");
      }
      
      return bignumber(Math.floor(result));
    } catch (err) {
      // Preserve specific error messages
      if (err.message.includes("Division by zero") || 
          err.message === "Invalid operation" ||
          err.message === "Overflow" ||
          err.message === "Invalid expression format") {
        throw err;
      }
      throw new Error("Invalid expression");
    }
  }

  /**
   * Sanitize expression for evaluation
   * @param {string} expr - Expression to sanitize
   * @param {string} base - Base for evaluation
   * @returns {string} Sanitized expression
   */
  sanitizeExpression(expr, base) {
    // First pass: basic cleanup
    let sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\s+/g, " ")
      .replace(/[+\-*/]\s*$/, "")
      .trim();

    // Handle shift operators specially
    sanitized = sanitized
      .replace(/<<|>>/g, match => ` ${match} `)
      .replace(/\s+/g, " ")
      .trim();

    // Second pass: validate operations
    if (!/^[0-9A-Fa-f\s+\-*/%()<<>>]*$/.test(sanitized)) return null;

    if (base !== "DEC") {
      sanitized = this.convertToDecimal(sanitized, base);
    }

    return sanitized;
  }

  /**
   * Convert expression from specified base to decimal
   * @param {string} expr - Expression to convert
   * @param {string} fromBase - Source base
   * @returns {string} Converted expression
   */
  convertToDecimal(expr, fromBase) {
    // Split expression keeping operators intact
    const parts = expr.split(/(\s*<<\s*|\s*>>\s*|\s*%\s*|\s*[+\-*/()]\s*)/);
    return parts
      .map(part => {
        part = part.trim();
        if (!part) return "";
        // Keep operators as is
        if (/^(<<|>>|[+\-*/%()]|\s+)$/.test(part)) return part;
        if (this.validateForBase(part, fromBase)) {
          const decimal = parseInt(part, this.bases[fromBase]);
          return isNaN(decimal) ? part : decimal.toString(10);
        }
        return part;
      })
      .join("");
  }

  /**
   * Format calculation result for display
   * @param {Object} result - Result to format
   * @param {string} base - Base for formatting
   * @returns {string} Formatted result
   */
  formatResult(result, base) {
    if (!result && result !== 0) return "Overflow";
    
    try {
      const decimalValue = result.toNumber();
      if (decimalValue > this.MAX_VALUE || decimalValue < this.MIN_VALUE) return "Overflow";
      
      const absoluteValue = Math.abs(decimalValue);
      const converted = absoluteValue.toString(this.bases[base]).toUpperCase();
      
      return isNegative(decimalValue) ? "-" + converted : converted;
    } catch (err) {
      console.error('Error formatting result:', err);
      return "Overflow";
    }
  }

  /**
   * Convert value between bases
   * @param {string|number} value - Value to convert
   * @param {string} fromBase - Source base
   * @param {string} toBase - Target base
   * @returns {string} Converted value
   */
  convertBetweenBases(value, fromBase, toBase) {
    try {
      if (!value || value === "Overflow") return "0";
      
      // Handle negative values
      const isNegative = typeof value === 'string' && value.startsWith('-');
      const absValue = isNegative ? value.substring(1) : value;
      
      const decimal = parseInt(absValue.toString(), this.bases[fromBase]);
      if (isNaN(decimal)) return "0";
      if (Math.abs(decimal) > this.MAX_VALUE) return "Overflow";
      
      const result = decimal.toString(this.bases[toBase]).toUpperCase();
      return isNegative ? "-" + result : result;
    } catch (err) {
      console.error('Error converting between bases:', err);
      return "0";
    }
  }

  /**
   * Validate value for specified base
   * @param {string} value - Value to validate
   * @param {string} base - Base to validate against
   * @returns {boolean} Whether value is valid for base
   */
  validateForBase(value, base) {
    if (!value || typeof value !== 'string') return false;
    
    const patterns = {
      BIN: /^-?[01]+$/,
      OCT: /^-?[0-7]+$/,
      DEC: /^-?[0-9]+$/,
      HEX: /^-?[0-9A-Fa-f]+$/
    };

    const pattern = patterns[base];
    if (!pattern) return false;

    // Handle negative numbers
    const testValue = value.startsWith('-') ? value.slice(1) : value;
    return pattern.test(testValue);
  }
}
