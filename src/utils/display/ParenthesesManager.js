export class ParenthesesManager {
  constructor() {
    this.stack = [];
    this.openCount = 0;
  }

  getFormattedExpression(expr) {
    const parts = [];
    let currentIndex = 0;
    let nestLevel = 0;
    
    const isOperator = (char) => /[+\-×÷]/.test(char);
    
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') {
        // Handle text before parenthesis
        if (i > currentIndex) {
          const beforeText = expr.slice(currentIndex, i).trim();
          if (beforeText) parts.push({ type: 'text', content: beforeText });
        }
        
        // Add opening parenthesis
        parts.push({ type: 'open', content: '(', level: nestLevel++ });
        currentIndex = i + 1;
      } else if (expr[i] === ')') {
        // Handle text before closing parenthesis
        if (i > currentIndex) {
          const content = expr.slice(currentIndex, i).trim();
          if (content) parts.push({ type: 'text', content: ` ${content} ` });
        }
        
        // Add closing parenthesis
        parts.push({ type: 'close', content: ')', level: --nestLevel });
        currentIndex = i + 1;
      } else if (isOperator(expr[i])) {
        // Handle operators with proper spacing
        if (i > currentIndex) {
          const beforeOp = expr.slice(currentIndex, i).trim();
          if (beforeOp) parts.push({ type: 'text', content: beforeOp });
        }
        parts.push({ type: 'text', content: ` ${expr[i]} ` });
        currentIndex = i + 1;
      }
    }

    // Add remaining text
    if (currentIndex < expr.length) {
      const remaining = expr.slice(currentIndex).trim();
      if (remaining) parts.push({ type: 'text', content: remaining });
    }

    // Add ghost parentheses
    while (nestLevel > 0) {
      parts.push({ type: 'ghost', content: ')', level: --nestLevel });
    }

    return this.cleanupParts(parts);
  }

  cleanupParts(parts) {
    return parts.reduce((acc, part) => {
      // Skip empty text parts
      if (part.type === 'text' && !part.content.trim()) {
        return acc;
      }
      
      // Handle spacing around operators
      if (part.type === 'text' && /^[+\-×÷]/.test(part.content.trim())) {
        const lastPart = acc[acc.length - 1];
        if (lastPart && lastPart.type === 'text') {
          lastPart.content = lastPart.content.trimEnd();
        }
      }
      
      acc.push(part);
      return acc;
    }, []);
  }
}
