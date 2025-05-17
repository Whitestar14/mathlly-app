import { CalculatorConstants } from '../constants/CalculatorConstants';

/**
 * @class SyntaxHighlighter
 * @description Utility class for tokenizing and classifying mathematical expressions for syntax highlighting
 */
export class SyntaxHighlighter {
  static tokenCache = new Map();
  
  static MAX_CACHE_SIZE = 100;

  /**
   * Breaks down a mathematical expression string into classified tokens
   * @param {string} text - The input mathematical expression to tokenize
   * @returns {Array<{type: string, content: string}>} Array of token objects with type and content properties
   */
  static tokenize(text) {
    if (!text) return [];
    
    // Check cache first
    const cachedResult = this.tokenCache.get(text);
    if (cachedResult) return cachedResult;
    
    const tokens = [];
    let currentToken = '';
    const { REGEX, BUTTON_TYPES } = CalculatorConstants;

    /**
     * Adds the current token to the tokens array and resets it
     * @private
     */
    const pushToken = () => {
      if (currentToken) {
        tokens.push(this.classifyToken(currentToken));
        currentToken = '';
      }
    };

    for (let i = 0; i < text.length; i++) {
      const char = text[i], nextChar = text[i + 1];

      // Handle decimal point
      if (char === '.') {
        pushToken();
        tokens.push({ type: 'decimal', content: '.' });
        continue;
      }

      // Handle shift operators
      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
        pushToken();
        tokens.push({ type: 'programmer-operator', content: char + nextChar });
        i++;
        continue;
      }

      // Handle operators
      if (
        BUTTON_TYPES.OPERATORS.includes(char) ||
        BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(char)
      ) {
        pushToken();
        tokens.push(this.classifyToken(char));
        continue;
      }

      // Handle parentheses
      if (REGEX.PARENTHESIS.test(char)) {
        pushToken();
        tokens.push({ type: 'parenthesis', content: char });
        continue;
      }

      currentToken += char;
    }
    pushToken();
    
    // Store in cache
    if (this.tokenCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry if cache is full
      const firstKey = this.tokenCache.keys().next().value;
      this.tokenCache.delete(firstKey);
    }
    this.tokenCache.set(text, tokens);
    
    return tokens;
  }

  /**
   * Determines the type of a token based on predefined patterns and constants
   * @param {string} token - The token to classify
   * @returns {{type: string, content: string}} Object containing the token type and content
   * @property {string} type - One of: 'number', 'operator', 'programmer-operator', 'function', 'decimal', 'text'
   * @property {string} content - The original token content
   */
  static classifyToken(token) {
    const { REGEX, BUTTON_TYPES } = CalculatorConstants;
    
    if (token === '.') return { type: 'decimal', content: token };
    if (REGEX.NUMBER.test(token)) return { type: 'number', content: token };
    if (BUTTON_TYPES.OPERATORS.includes(token)) return { type: 'operator', content: token };
    if (BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(token)) return { type: 'programmer-operator', content: token };
    if (BUTTON_TYPES.FUNCTIONS.includes(token)) return { type: 'function', content: token };
    
    return { type: 'text', content: token };
  }
  
  /**
   * Clears the token cache
   * Useful when calculator mode changes or when memory needs to be freed
   */
  static clearCache() {
    this.tokenCache.clear();
  }
}
