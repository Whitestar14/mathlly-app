// services/display/DisplayFormatter.js
import { useSettingsStore } from "@/stores/settings";
import { CacheManager } from '@/utils/cache/CacheManager';

/**
 * @class DisplayFormatter
 * @description Handles formatting of display values for different calculator modes and bases
 */
export class DisplayFormatter {
  // Cache names
  static CACHE_NAMES = {
    FORMAT: 'display-format',
    DISPLAY: 'display-preview',
    CONTENT: 'display-content'
  };

  /**
   * Format a value based on calculator mode and options
   * @param {string|number} value - The value to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted value
   */
  static format(value, options = {}) {
    if (!value && value !== 0) return "0";
    if (value === 'Error') return value;

    // Generate cache key
    const cacheKey = this.generateCacheKey(value, options);
    
    // Get the format cache
    const formatCache = CacheManager.getCache(this.CACHE_NAMES.FORMAT, 100);
    
    // Check cache first
    if (formatCache.has(cacheKey)) {
      return formatCache.get(cacheKey);
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
    formatCache.set(cacheKey, result);
    
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

    // Generate cache key
    const cacheKey = `${value}-${base}`;
    
    // Get the display cache
    const displayCache = CacheManager.getCache(this.CACHE_NAMES.DISPLAY, 50);
    
    // Check cache first
    if (displayCache.has(cacheKey)) {
      return displayCache.get(cacheKey);
    }

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
      result = result.slice(0, MAX_PREVIEW_LENGTHS[base]) + "…";
    }

    // Cache the result
    displayCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Clear all formatter caches
   */
  static clearCache() {
    CacheManager?.clearAllCaches?.();
  }
}
