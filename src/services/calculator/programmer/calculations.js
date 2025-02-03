import { evaluate, bignumber } from "mathjs";

export class ProgrammerCalculations {
  static MAX_VALUE = 0x7FFFFFFFFFFFFFFF;

  static bases = {
    BIN: 2,
    OCT: 8,
    DEC: 10,
    HEX: 16
  };

  static evaluateExpression(expr, base) {
    try {
      const sanitizedExpr = this.sanitizeExpression(expr, base);
      const result = evaluate(sanitizedExpr);
      
      if (Math.abs(result) > this.MAX_VALUE) {
        return null;
      }
      
      return bignumber(Math.floor(result));
    } catch (err) {
      console.error("Evaluation error:", err);
      return null;
    }
  }

  static sanitizeExpression(expr, base) {
    if (!expr?.trim()) return "0";

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
    return expr.split(/([+\-*/())]|\s+)/)
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
    if (result === null) return "Overflow";
    try {
      const decimalValue = result.toNumber();
      if (Math.abs(decimalValue) > this.MAX_VALUE) return "Overflow";
      
      return Math.abs(decimalValue)
        .toString(this.bases[base])
        .toUpperCase();
    } catch {
      return "Overflow";
    }
  }
}
