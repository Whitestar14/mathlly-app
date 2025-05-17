// services/display/DisplayFormatter.js
import { useSettingsStore } from "@/stores/settings";

/**
 * @class DisplayFormatter
 * @description Handles formatting of display values for different calculator modes and bases
 */
export class DisplayFormatter {
  // Cache for formatted values to avoid redundant calculations
  static formattedCache = new Map();
  static MAX_CACHE_SIZE = 100;

  /**
   * Format a value based on calculator mode and options
   * @param {string|number} value - The value to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted value
   */
  static format(value, options = {}) {
    if (!value && value !== 0) return "0";

    // Generate cache key
    const cacheKey = this.generateCacheKey(value, options);
    
    // Check cache first
    if (this.formattedCache.has(cacheKey)) {
      return this.formattedCache.get(cacheKey);
    }

    const settings = useSettingsStore();
    const {
      base = "DEC",
      mode = "Standard",
      useThousandsSeparator = settings.display_formatting_useThousandsSeparator,
      formatBinary = settings.display_formatting_formatBinary,
      formatHexadecimal = settings.display_formatting_formatHexadecimal,
      formatOctal = settings.display_formatting_formatOctal,
    } = options;

    let result;
    if (mode === "Programmer") {
      result = this.formatProgrammer(value, base, {
        useThousandsSeparator,
        formatBinary,
        formatHexadecimal,
        formatOctal,
      });
    } else {
      result = this.formatStandard(value, useThousandsSeparator);
    }

    // Cache the result
    this.cacheResult(cacheKey, result);
    
    return result;
  }

  /**
   * Generate a cache key for the given value and options
   * @private
   */
  static generateCacheKey(value, options) {
    const {
      base = "DEC",
      mode = "Standard",
      useThousandsSeparator = true,
      formatBinary = true,
      formatHexadecimal = true,
      formatOctal = true,
    } = options;

    return `${value}-${base}-${mode}-${useThousandsSeparator}-${formatBinary}-${formatHexadecimal}-${formatOctal}`;
  }

  /**
   * Cache a formatted result
   * @private
   */
  static cacheResult(key, value) {
    // Limit cache size
    if (this.formattedCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.formattedCache.keys().next().value;
      this.formattedCache.delete(firstKey);
    }
    
    this.formattedCache.set(key, value);
  }

  /**
   * Format a value for Programmer mode
   * @param {string|number} value - The value to format
   * @param {string} base - The number base (BIN, OCT, DEC, HEX)
   * @param {Object} options - Formatting options
   * @returns {string} Formatted value
   */
  static formatProgrammer(value, base, options) {
    // Split preserving shift operators
    const parts = String(value).split(/(\s*<<\s*|\s*>>\s*|\s*[+\-×÷()%]\s*)/g);

    const formattedParts = parts
      .map((part) => {
        part = part.trim();
        if (!part) return "";

        // Return operators as is
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

  /**
   * Format a binary number with optional grouping
   * @param {string} value - Binary number to format
   * @param {boolean} useFormatting - Whether to apply formatting
   * @returns {string} Formatted binary number
   */
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

  /**
   * Format a hexadecimal number with optional grouping
   * @param {string} value - Hex number to format
   * @param {boolean} useFormatting - Whether to apply formatting
   * @returns {string} Formatted hex number
   */
  static formatHexNumber(value, useFormatting) {
    const hexValue = String(value).toUpperCase();
    if (!useFormatting) return hexValue;
    // Group hex digits in pairs
    return hexValue.replace(/\B(?=(\w{2})+(?!\w))/g, " ");
  }

  /**
   * Format an octal number with optional grouping
   * @param {string} value - Octal number to format
   * @param {boolean} useFormatting - Whether to apply formatting
   * @returns {string} Formatted octal number
   */
  static formatOctNumber(value, useFormatting) {
    if (!useFormatting) return value;
    // Group octal digits in threes
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  /**
   * Format a decimal number with optional thousands separator
   * @param {string|number} value - Decimal number to format
   * @param {boolean} useFormatting - Whether to apply formatting
   * @returns {string} Formatted decimal number
   */
  static formatDecimalNumber(value, useFormatting) {
    if (!useFormatting) return String(value);

    const parts = String(value).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  /**
   * Format a value for Standard mode
   * @param {string|number} value - The value to format
   * @param {boolean} useFormatting - Whether to apply formatting
   * @returns {string} Formatted value
   */
  static formatStandard(value, useFormatting) {
    return this.formatDecimalNumber(value, useFormatting);
  }

  /**
   * Format a display value for preview
   * @param {string|number} value - The value to format
   * @param {string} base - The number base
   * @returns {string} Formatted preview value
   */
  static formatDisplayValue(value, base) {
    if (!value && value !== 0) return "0";

    const MAX_PREVIEW_LENGTHS = {
      BIN: 12,
      OCT: 8,
      DEC: 8,
      HEX: 6,
    };

    let result = String(value)
      .replace(/^(0x|0o|0b)/, "")
      .toUpperCase();

    if (result.length > MAX_PREVIEW_LENGTHS[base]) {
      return result.slice(0, MAX_PREVIEW_LENGTHS[base]) + "…";
    }

    return result;
  }

  /**
   * Format display content by replacing HTML entities with symbols
   * @param {string} content - Content to format
   * @returns {string} Formatted content
   */
  static formatDisplayContent(content) {
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
  }
  
  /**
   * Clear the formatter cache
   */
  static clearCache() {
    this.formattedCache.clear();
  }
}
