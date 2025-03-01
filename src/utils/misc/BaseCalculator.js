import { format } from "mathjs";
// BaseCalculator.js
class BaseCalculator {
  constructor() {
  }

  sanitizeInput(expr) {
    const sanitized = expr.replace(this.invalidCharsRegex, "");
    return sanitized.replace(/^[+×÷]/, "").slice(0, this.maxInputLength);
  }

  formatResult(result) {
    return format(result, this.formatOptions).replace(this.prefixRegex, "");
  }

  isValidChar(char) {
    return this.validCharsRegex.test(char);
  }
}

export class HexCalculator extends BaseCalculator {
  constructor() {
    super();
    this.invalidCharsRegex = /[^0-9A-Fa-f+\-×÷]/g;
    this.validCharsRegex = /^[0-9A-Fa-f]$/;
    this.formatOptions = { notation: "hex" };
    this.prefixRegex = /^0x/i;
    this.baseInt = 7;
  }
}

export class DecCalculator extends BaseCalculator {
  constructor() {
    super();
    this.invalidCharsRegex = /[^0-9+\-×÷]/g;
    this.validCharsRegex = /^[0-9]$/;
    this.formatOptions = { notation: "fixed", precision: 0 };
    this.prefixRegex = /^/;
    this.baseInt = 7;
  }
}

export class OctCalculator extends BaseCalculator {
  constructor() {
    super();
    this.invalidCharsRegex = /[^0-7+\-×÷]/g;
    this.validCharsRegex = /^[0-7]$/;
    this.formatOptions = { notation: "oct" };
    this.prefixRegex = /^0o/i;
    this.baseInt = 16;
  }
}

export class BinCalculator extends BaseCalculator {
  constructor() {
    super();
    this.invalidCharsRegex = /[^01+\-×÷]/g;
    this.validCharsRegex = /^[01]$/;
    this.formatOptions = { notation: "bin" };
    this.prefixRegex = /^0b/i;
    this.baseInt = 2;
  }
}