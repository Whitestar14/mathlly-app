// services/DisplayFormatter.js
import { useSettingsStore } from "@/stores/settings";

export class DisplayFormatter {
  static format(value, options = {}) {
    const settings = useSettingsStore();
    const {
      base = "DEC",
      mode = "Standard",
      useThousandsSeparator = settings.useThousandsSeparator,
      formatBinary = settings.formatBinary,
      formatHexadecimal = settings.formatHexadecimal,
      formatOctal = settings.formatOctal,
    } = options;

    if (!value) return "0";
  
    if (mode === "Programmer") {
      return this.formatProgrammer(value, base, {
        useThousandsSeparator,
        formatBinary,
        formatHexadecimal,
        formatOctal
      });
    }
  
    return this.formatStandard(value, useThousandsSeparator);
  }

  static formatProgrammer(value, base, options) {
    // Split preserving shift operators
    const parts = value.split(/(\s*<<\s*|\s*>>\s*|\s*[+\-×÷()]\s*)/g);
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
        if (["+", "-", "×", "÷", "(", ")", "<<", ">>"].includes(part)) return part;
        
        // Remove any decimal points for programmer mode
        part = part.split('.')[0];
        
        switch (base) {
          case "BIN":
            return this.formatBinaryNumber(part, options.formatBinary);
          case "HEX":
            return this.formatHexNumber(part, options.formatHexadecimal);
          case "OCT":
            return this.formatOctNumber(part, options.formatOctal);
          default:
            return this.formatDecimalNumber(part, options.useThousandsSeparator);
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
  
  static formatBinaryNumber(value, useFormatting) {
    if (!value || value === 'NaN') return '0';
    
    let binString = value;

    const padding = 4 - (binString.length % 4);
    if (padding < 4) {
      binString = "0".repeat(padding) + binString;
    }
  
    if (useFormatting) {
      const chunks = binString.match(/.{1,4}/g) || ["0"];
      return chunks.join(" ");
    }
    return binString;
  }
  
  static formatHexNumber(value, useFormatting) {
    const hexValue = value.toUpperCase();
    if (!useFormatting) return hexValue;
    // Group hex digits in pairs
    return hexValue.replace(/\B(?=(\w{2})+(?!\w))/g, " ");
  }
  
  static formatOctNumber(value, useFormatting) {
    if (!useFormatting) return value;
    // Group octal digits in threes
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  static formatDecimalNumber(value, useFormatting) {
    if (!useFormatting) return value;
    
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  static formatStandard(value, useFormatting) {
    return this.formatDecimalNumber(value, useFormatting);
  }
}
