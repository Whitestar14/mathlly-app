// services/DisplayFormatter.js
import { useSettingsStore } from "@/stores/settings";

export class DisplayFormatter {
  static format(value, options = {}) {
    const settings = useSettingsStore();
    const {
      base = "DEC",
      mode = "Standard",
      useThousandsSeparator = settings.display_formatting_useThousandsSeparator,
      formatBinary = settings.display_formatting_formatBinary,
      formatHexadecimal = settings.display_formatting_formatHexadecimal,
      formatOctal = settings.display_formatting_formatOctal,
    } = options;

    if (!value) return "0";

    if (mode === "Programmer") {
      return this.formatProgrammer(value, base, {
        useThousandsSeparator,
        formatBinary,
        formatHexadecimal,
        formatOctal,
      });
    }

    return this.formatStandard(value, useThousandsSeparator);
  }

  static formatProgrammer(value, base, options) {
    // Split preserving shift operators
    const parts = value.split(/(\s*<<\s*|\s*>>\s*|\s*[+\-×÷()%]\s*)/g);

    const formattedParts = parts
    .map((part) => {
      part = part.trim();
      if (!part) return "";

      // Instead of returning HTML tags, return the part as is
      if (["+", "-", "×", "÷", "(", ")", "<<", ">>", "%"].includes(part)) return part;

         // Remove any decimal points for programmer mode
      part = part.split(".")[0];

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
    
  return formattedParts;
}

  static findMatchingParenthesis(expr, openIndex) {
    if (openIndex === -1) return -1;
    let count = 1;
    for (let i = openIndex + 1; i < expr.length; i++) {
      if (expr[i] === "(") count++;
      if (expr[i] === ")") count--;
      if (count === 0) return i;
    }
    return -1;
  }

  static formatBinaryNumber(value, useFormatting) {
    if (!value || value === "NaN") return "0";

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

  static formatDisplayValue(value, base) {
    if (!value) return "0";

    const MAX_PREVIEW_LENGTHS = {
      BIN: 12,
      OCT: 8,
      DEC: 8,
      HEX: 6,
    };

    let result = value
      .toString()
      .replace(/^(0x|0o|0b)/, "")
      .toUpperCase();

    if (result.length > MAX_PREVIEW_LENGTHS[base]) {
      return result.slice(0, MAX_PREVIEW_LENGTHS[base]) + "…";
    }

    return result;
  }

  static formatDisplayContent = (content) => {
    if (!content) return '';
    
    return content
      // Basic operators
      .replace(/&times;/g, "×")
      .replace(/&divide;/g, "÷")
      .replace(/&minus;/g, "−")
      .replace(/&plusmn;/g, "±")
      .replace(/&sum;/g, "∑")
      .replace(/&prod;/g, "∏")
      // Comparison
      .replace(/&lt;=/g, "≤")
      .replace(/&gt;=/g, "≥")
      .replace(/&ne;/g, "≠")
      .replace(/&equiv;/g, "≡")
      // Greek letters (commonly used in math)
      .replace(/&alpha;/g, "α")
      .replace(/&beta;/g, "β")
      .replace(/&delta;/g, "δ")
      .replace(/&Delta;/g, "Δ")
      .replace(/&pi;/g, "π")
      .replace(/&sigma;/g, "σ")
      // Set notation
      .replace(/&isin;/g, "∈")
      .replace(/&notin;/g, "∉")
      .replace(/&cup;/g, "∪")
      .replace(/&cap;/g, "∩")
      // Other math symbols
      .replace(/&radic;/g, "√")
      .replace(/&infin;/g, "∞")
      .replace(/&int;/g, "∫")
      .replace(/&part;/g, "∂");
  };
  
}