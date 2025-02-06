import { evaluate, bignumber, isNegative } from "mathjs";

export class ProgrammerCalculations {
  static MAX_VALUE = 102410241024; // 63-bit signed integer max

  static bases = {
    BIN: 2,
    OCT: 8,
    DEC: 10,
    HEX: 16
  };

  static evaluateExpression(expr, base) {
    if (!expr || expr.trim() === "") return bignumber(0);

    try {
      const sanitizedExpr = this.sanitizeExpression(expr, base);
      const result = evaluate(sanitizedExpr);
      
      if (Math.abs(result) > this.MAX_VALUE) {
        return null;
      }
      
      return bignumber(Math.floor(result));
    } catch (err) {
      return null;
    }
  }

  static sanitizeExpression(expr, base) {
    let sanitized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/[+\-*/]\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (base !== "DEC") {
      sanitized = this.convertToDecimal(sanitized, base);
    }

    return sanitized;
  }

  static convertToDecimal(expr, fromBase) {
    return expr
      .split(/([+\-*/())]|\s+)/)
      .map(part => {
        part = part.trim();
        if (!part) return "";
        if (/^[0-9A-Fa-f]+$/.test(part)) {
          return parseInt(part, this.bases[fromBase]).toString(10);
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
    const patterns = {
      BIN: /^[01]+$/,
      OCT: /^[0-7]+$/,
      DEC: /^[0-9]+$/,
      HEX: /^[0-9A-Fa-f]+$/
    };
    return patterns[base]?.test(value) ?? false;
  }
}
