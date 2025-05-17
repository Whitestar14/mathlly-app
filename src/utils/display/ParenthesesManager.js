import { CalculatorConstants } from '../constants/CalculatorConstants.js';
const { REGEX } = CalculatorConstants;
    
export class ParenthesesManager {
  constructor() {
    this.stack = [];
    this.openCount = 0;
    this.expressionCache = new Map();
    this.MAX_CACHE_SIZE = 50;
  }

  getFormattedExpression(expr) {
    // Check cache first for better performance
    if (this.expressionCache.has(expr)) {
      return this.expressionCache.get(expr);
    }

    const parts = [];
    let currentIndex = 0;
    let nestLevel = 0;
    
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
          if (beforeText) parts.push({ type: 'text', content: beforeText });
        }
        
        parts.push({ type: 'open', content: '(' });
        currentIndex = i + 1;
        nestLevel++;
      } else if (char === ')') {
        if (i > currentIndex) {
          const content = expr.slice(currentIndex, i).trim();
          if (content) parts.push({ type: 'text', content: content });
        }
        
        parts.push({ type: 'close', content: ')', level: --nestLevel });
        currentIndex = i + 1;
      } else if (isOperator(char, nextChar)) {
        if (i > currentIndex) {
          const beforeOp = expr.slice(currentIndex, i).trim();
          if (beforeOp) parts.push({ type: 'text', content: beforeOp });
        }
        
        if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
          parts.push({ type: 'text', content: ` ${expr.slice(i, i+2)} ` });
          i++; // Skip the next character since we've already processed it
        } else {
          parts.push({ type: 'text', content: ` ${char} ` });
        }
        currentIndex = i + 1;
      }
    }
  
    if (currentIndex < expr.length) {
      const remaining = expr.slice(currentIndex).trim();
      if (remaining) parts.push({ type: 'text', content: remaining });
    }
  
    while (nestLevel > 0) {
      parts.push({ type: 'ghost', content: ')', level: --nestLevel });
    }
  
    const result = this.cleanupParts(parts);
    
    if (this.expressionCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.expressionCache.keys().next().value;
      this.expressionCache.delete(firstKey);
    }
    this.expressionCache.set(expr, result);
    
    return result;
  }
  
  cleanupParts(parts) {
    const result = [];

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

  clearCache() {
    this.expressionCache.clear();
  }
}
