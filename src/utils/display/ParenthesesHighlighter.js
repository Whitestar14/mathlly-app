import { ParenthesesManager } from './ParenthesesManager.js';

export class ParenthesesHighlighter {
  static formatWithParentheses(formattedText, parenthesesTracker) {
    if (!formattedText || !parenthesesTracker) {
      return [{ type: 'text', content: formattedText || '0' }];
    }

    const manager = new ParenthesesManager();
    return manager.getFormattedExpression(formattedText);
  }
}
