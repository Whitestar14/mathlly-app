// services/DisplayFormatter.js
export class DisplayFormatter {
  static format(value, options = {}) {
    const {
      base = "DEC",
      useThousandsSeparator = true,
      mode = "Standard",
    } = options;

    if (!value) return "0";
  
    if (mode === "Programmer") {
      return this.formatProgrammer(value, base, useThousandsSeparator);
    }
  
    return this.formatStandard(value, useThousandsSeparator);
  }

  static formatProgrammer(value, base, useThousandsSeparator) {
    const parts = value.split(/([+\-×÷()\s])/g);
    let highlightIndex = value.lastIndexOf('(');
    let matchingIndex = this.findMatchingParenthesis(value, highlightIndex);
    
    return parts
      .map((part, index) => {
        part = part.trim();
        if (!part) return "";
        
        if (part === '(' && index === highlightIndex) {
          return '<span class="highlight-paren">(</span>';
        }
        if (part === ')' && index === matchingIndex) {
          return '<span class="highlight-paren">)</span>';
        }
        if (["+", "-", "×", "÷", "(", ")"].includes(part)) return part;
        
        // Apply thousands separator based on the base
        switch (base) {
          case "BIN":
            return this.formatBinaryNumber(part, useThousandsSeparator);
          case "HEX":
            return this.formatHexNumber(part, useThousandsSeparator);
          case "OCT":
            return this.formatOctNumber(part, useThousandsSeparator);
          default:
            return this.formatDecimalNumber(part, useThousandsSeparator);
        }
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  static findMatchingParenthesis(expr, openIndex) {
    if (openIndex === -1) return -1;
    let count = 1;
    for (let i = openIndex + 1; i < expr.length; i++) {
      if (expr[i] === '(') count++;
      if (expr[i] === ')') count--;
      if (count === 0) return i;
    }
    return -1;
  }
  
  static formatBinaryNumber(value, useThousandsSeparator) {
    let binString = /^[01]+$/.test(value) 
      ? value 
      : parseInt(value).toString(2);
  
    const padding = 4 - (binString.length % 4);
    if (padding < 4) {
      binString = "0".repeat(padding) + binString;
    }
  
    // Only group if thousands separator is enabled
    if (useThousandsSeparator) {
      const chunks = binString.match(/.{1,4}/g) || ["0"];
      return chunks.join(" ");
    }
    return binString;
  }
  
  static formatHexNumber(value, useThousandsSeparator) {
    const hexValue = value.toUpperCase();
    if (!useThousandsSeparator) return hexValue;
    // Group hex digits in pairs
    return hexValue.replace(/\B(?=(\w{2})+(?!\w))/g, " ");
  }
  
  static formatOctNumber(value, useThousandsSeparator) {
    if (!useThousandsSeparator) return value;
    // Group octal digits in threes
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  static formatDecimalNumber(value, useThousandsSeparator) {
    if (!useThousandsSeparator) return value;
    
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  static formatStandard(value, useThousandsSeparator) {
    if (!useThousandsSeparator) return value;
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
}
