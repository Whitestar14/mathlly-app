import { evaluate, bignumber, isNegative, isNaN } from "mathjs";

export class ProgrammerCalculations {
  static MAX_VALUE = bignumber('9223372036854775807'); // Using mathjs bignumber instead of literal

  static bases = {
    BIN: 2,
    OCT: 8,
    DEC: 10,
    HEX: 16
  };

  static evaluateExpression(expr, base) {
    if (!expr || expr.trim() === "") return bignumber(0);

    // Check for division by zero before sanitization
    if (expr.includes('÷ 0') || expr.includes('/ 0')) {
      throw new Error("Division by zero is not allowed");
    }

    const sanitizedExpr = this.sanitizeExpression(expr, base);
    
    try {
      const result = evaluate(sanitizedExpr);
      
      // Handle invalid results
      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid operation");
      }
      
      // Check for overflow
      if (Math.abs(result) > this.MAX_VALUE) {
        throw new Error("Overflow");
      }
      
      return bignumber(Math.floor(result));
    } catch (err) {
      // Preserve specific error messages
      if (err.message.includes("Division by zero") || 
          err.message === "Invalid operation" ||
          err.message === "Overflow") {
        throw err;
      }
      throw new Error("Invalid expression");
    }
  }

  static sanitizeExpression(expr, base) {
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

  static convertToDecimal(expr, fromBase) {
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

  static formatResult(result, base) {
    if (!result) return "Overflow";
    
    try {
      const decimalValue = result.toNumber();
      if (Math.abs(decimalValue) > this.MAX_VALUE) return "Overflow";
      
      const absoluteValue = Math.abs(decimalValue);
      const converted = absoluteValue.toString(this.bases[base]).toUpperCase();
      
      return isNegative(decimalValue) ? "-" + converted : converted;
    } catch {
      return "Overflow";
    }
  }

  static convertBetweenBases(value, fromBase, toBase) {
    try {
      if (!value || value === "Overflow") return "0";
      
      const decimal = parseInt(value.toString(), this.bases[fromBase]);
      if (isNaN(decimal)) return "0";
      if (Math.abs(decimal) > this.MAX_VALUE) return "Overflow";
      
      return decimal.toString(this.bases[toBase]).toUpperCase();
    } catch {
      return "0";
    }
  }

  static validateForBase(value, base) {
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

  static handleBitwiseOperation(value, operation) {
    try {
      const num = bignumber(value);
      switch (operation) {
        case '<<': return num.mul(2).toString(); // Left shift is multiply by 2
        case '>>': return num.div(2).floor().toString(); // Right shift is divide by 2 and floor
        default: return value;
      }
    } catch {
      return value;
    }
  }
}
