import { CalculatorConstants } from '../constants/CalculatorConstants';

/**
 * @class SyntaxHighlighter
 * @description Utility class for tokenizing and classifying mathematical expressions for syntax highlighting
 */
export class SyntaxHighlighter {
  /**
   * Breaks down a mathematical expression string into classified tokens
   * @param {string} text - The input mathematical expression to tokenize
   * @returns {Array<{type: string, content: string}>} Array of token objects with type and content properties
   */
  static tokenize(text) {
    if (!text) return [];
    const tokens = [];
    let currentToken = '';

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

      // Handle shift operators
      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
        pushToken();
        tokens.push({ type: 'programmer-operator', content: char + nextChar });
        i++;
        continue;
      }

      // Handle operators
      if (
        CalculatorConstants.BUTTON_TYPES.OPERATORS.includes(char) ||
        CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(char)
      ) {
        pushToken();
        tokens.push(this.classifyToken(char));
        continue;
      }

      // Handle parentheses
      if (CalculatorConstants.REGEX.PARENTHESIS.test(char)) {
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
   * Determines the type of a token based on predefined patterns and constants
   * @param {string} token - The token to classify
   * @returns {{type: string, content: string}} Object containing the token type and content
   * @property {string} type - One of: 'number', 'operator', 'programmer-operator', 'function', 'text'
   * @property {string} content - The original token content
   */
  static classifyToken(token) {
    const { REGEX, BUTTON_TYPES } = CalculatorConstants;
    if (REGEX.NUMBER.test(token)) return { type: 'number', content: token };
    if (BUTTON_TYPES.OPERATORS.includes(token)) return { type: 'operator', content: token };
    if (BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(token)) return { type: 'programmer-operator', content: token };
    if (BUTTON_TYPES.FUNCTIONS.includes(token)) return { type: 'function', content: token };
    return { type: 'text', content: token };
  }
}
