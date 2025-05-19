import { CalculatorConstants } from '../../utils/constants/CalculatorConstants.js';
import { CacheManager } from '@/utils/cache/CacheManager';

/**
 * @class ExpressionFormatter
 * @description Class for syntax highlighting of mathematical expressions
 */
export class ExpressionFormatter {
  static CACHE_NAMES = {
    FORMAT: 'expression-format',
    PARENTHESES: 'expression-parentheses',
    TOKENS: 'expression-tokens'
  };
  
  /**
   * Format an expression with both parentheses and syntax highlighting
   * @param {string} expr - The expression to format
   * @param {Object} parenthesesTracker - Tracker for parentheses state
   * @param {boolean} syntaxHighlightingEnabled - Whether syntax highlighting is enabled
   * @returns {Array} Formatted tokens for rendering
   */
  static format(expr, parenthesesTracker, syntaxHighlightingEnabled = true) {
    if (!expr) {
      return [{ type: 'text', content: '0' }];
    }
    
    const cacheKey = `${expr}-${parenthesesTracker?.openCount || 0}-${syntaxHighlightingEnabled}`;
    
    const formatCache = CacheManager.getCache(this.CACHE_NAMES.FORMAT, 100);

    if (formatCache.has(cacheKey)) {
      return formatCache.get(cacheKey);
    }

    const parts = this.formatParentheses(expr, parenthesesTracker);

    const result = syntaxHighlightingEnabled 
      ? this.applySyntaxHighlighting(parts)
      : parts;
    
    formatCache.set(cacheKey, result);
    
    return result;
  }
  
  /**
   * Apply syntax highlighting to formatted parts
   * @param {Array} parts - Formatted parts from parentheses formatting
   * @returns {Array} Parts with syntax highlighting applied to text parts
   */
  static applySyntaxHighlighting(parts) {
    const tokensCache = CacheManager.getCache(this.CACHE_NAMES.TOKENS, 50);
    
    const result = [];
    
    for (const part of parts) {
      if (part.type === 'text') {
        const cacheKey = part.content;
        
        let tokens;
        if (tokensCache.has(cacheKey)) {
          tokens = tokensCache.get(cacheKey);
        } else {
          tokens = this.tokenize(part.content);
          tokensCache.set(cacheKey, tokens);
        }
        
        for (const token of tokens) {
          result.push({
            ...token,
            parentLevel: part.level
          });
        }
      } else {
        result.push(part);
      }
    }
    
    return result;
  }
  
  /**
   * Format an expression with parentheses
   * @param {string} expr - The expression to format
   * @returns {Array} Formatted parts
   */
  static formatParentheses(expr) {
    const parenthesesCache = CacheManager.getCache(this.CACHE_NAMES.PARENTHESES, 50);
    
    if (parenthesesCache.has(expr)) {
      return parenthesesCache.get(expr);
    }
    
    const parts = [];
    let currentIndex = 0;
    let nestLevel = 0;
    
    const { REGEX } = CalculatorConstants;
    
    const isOperator = (char, nextChar) => {
      if (REGEX.OPERATOR.test(char)) return true;
      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) return true;
      return false;
    };
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      const nextChar = expr[i+1];

      if (char === '(') {
        if (i > currentIndex) {
          const beforeText = expr.slice(currentIndex, i).trim();
          if (beforeText) parts.push({ type: 'text', content: beforeText, level: nestLevel });
        }
        
        parts.push({ type: 'open', content: '(', level: nestLevel });
        currentIndex = i + 1;
        nestLevel++;
      } else if (char === ')') {
        if (i > currentIndex) {
          const content = expr.slice(currentIndex, i).trim();
          if (content) parts.push({ type: 'text', content: content, level: nestLevel });
        }
        
        parts.push({ type: 'close', content: ')', level: --nestLevel });
        currentIndex = i + 1;
              } else if (isOperator(char, nextChar)) {
        if (i > currentIndex) {
          const beforeOp = expr.slice(currentIndex, i).trim();
          if (beforeOp) parts.push({ type: 'text', content: beforeOp, level: nestLevel });
        }
        
        if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
          parts.push({ type: 'text', content: ` ${expr.slice(i, i+2)} `, level: nestLevel });
          i++;
        } else {
          parts.push({ type: 'text', content: ` ${char} `, level: nestLevel });
        }
        currentIndex = i + 1;
      }
    }
  
    if (currentIndex < expr.length) {
      const remaining = expr.slice(currentIndex).trim();
      if (remaining) parts.push({ type: 'text', content: remaining, level: nestLevel });
    }
  
    while (nestLevel > 0) {
      parts.push({ type: 'ghost', content: ')', level: --nestLevel });
    }
  
    const result = this.cleanupParts(parts);
    
    parenthesesCache.set(expr, result);
    
    return result;
  }
  
  /**
   * Clean up formatted parts
   * @param {Array} parts - The parts to clean up
   * @returns {Array} Cleaned up parts
   */
  static cleanupParts(parts) {
    const result = [];
    const { REGEX } = CalculatorConstants;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const prevPart = result[result.length - 1];
      
      if (part.type === 'text' && !part.content.trim()) {
        if ((prevPart?.type === 'open') || (nextPart?.type === 'close')) {
          result.push(part);
        }
        continue;
      }
      
      if (part.type === 'text' && 
          (REGEX.OPERATOR.test(part.content.trim()[0]) || /^<<|^>>/.test(part.content.trim()))) {
        if (prevPart?.type === 'text') {
          prevPart.content = prevPart.content.trimEnd();
        }
      }
      
      result.push(part);
    }
    
    return result;
  }
  
  /**
   * Tokenize a text string for syntax highlighting
   * @param {string} text - The text to tokenize
   * @returns {Array} Array of token objects
   */
  static tokenize(text) {
    if (!text) return [];
    
    const tokens = [];
    let currentToken = '';
    const { REGEX, BUTTON_TYPES } = CalculatorConstants;

    const pushToken = () => {
      if (currentToken) {
        tokens.push(this.classifyToken(currentToken));
        currentToken = '';
      }
    };

    for (let i = 0; i < text.length; i++) {
      const char = text[i], nextChar = text[i + 1];

      if (char === '.') {
        pushToken();
        tokens.push({ type: 'decimal', content: '.' });
        continue;
      }

      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
        pushToken();
        tokens.push({ type: 'programmer-operator', content: char + nextChar });
        i++;
        continue;
      }

      if (
        BUTTON_TYPES.OPERATORS.includes(char) ||
        BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(char)
      ) {
        pushToken();
        tokens.push(this.classifyToken(char));
        continue;
      }

      if (REGEX.PARENTHESIS.test(char)) {
        pushToken();
        tokens.push({ type: 'parenthesis', content: char });
        continue;
      }

      currentToken += char;
    }
    pushToken();
    
    return tokens;
  }
  
  /**
   * Classify a token based on its content
   * @param {string} token - The token to classify
   * @returns {Object} Classified token object
   */
  static classifyToken(token) {
    const { REGEX, BUTTON_TYPES } = CalculatorConstants;
    
    if (token === ' ') return { type: 'space', content: token };
    if (token === '.') return { type: 'decimal', content: token };
    if (REGEX.NUMBER.test(token)) return { type: 'number', content: token };
    if (BUTTON_TYPES.OPERATORS.includes(token)) return { type: 'operator', content: token };
    if (BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(token)) return { type: 'programmer-operator', content: token };
    if (BUTTON_TYPES.FUNCTIONS.includes(token)) return { type: 'function', content: token };
    
    return { type: 'text', content: token };
  }
  
  /**
   * Clear all expression formatter caches
   */
  static clearCache() {
    CacheManager?.clearAllCaches?.();
  }
}
