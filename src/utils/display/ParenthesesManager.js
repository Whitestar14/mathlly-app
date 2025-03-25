export class ParenthesesManager {
  constructor() {
    this.stack = [];
    this.openCount = 0;
  }

  getFormattedExpression(expr) {
    const parts = [];
    let currentIndex = 0;
    let nestLevel = 0;
    
    // Updated to include shift operators
    const isOperator = (char, nextChar) => {
      if (/[+\-×÷%]/.test(char)) return true;
      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) return true;
      return false;
    };
    
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') {
        // Handle text before parenthesis
        if (i > currentIndex) {
          const beforeText = expr.slice(currentIndex, i).trim();
          if (beforeText) parts.push({ type: 'text', content: beforeText });
        }
        
        // Add opening parenthesis
        parts.push({ type: 'open', content: '(' });
        currentIndex = i + 1;
        nestLevel++;
      } else if (expr[i] === ')') {
        // Handle text before closing parenthesis
        if (i > currentIndex) {
          const content = expr.slice(currentIndex, i).trim();
          if (content) parts.push({ type: 'text', content: content });
        }
        
        // Add closing parenthesis
        parts.push({ type: 'close', content: ')', level: --nestLevel });
        currentIndex = i + 1;
      } else if (isOperator(expr[i], expr[i+1])) {
        // Handle operators with proper spacing
        if (i > currentIndex) {
          const beforeOp = expr.slice(currentIndex, i).trim();
          if (beforeOp) parts.push({ type: 'text', content: beforeOp });
        }
        
        // Special handling for shift operators
        if ((expr[i] === '<' && expr[i+1] === '<') || (expr[i] === '>' && expr[i+1] === '>')) {
          parts.push({ type: 'text', content: ` ${expr.slice(i, i+2)} ` });
          i++; // Skip the next character since we've already processed it
        } else {
          parts.push({ type: 'text', content: ` ${expr[i]} ` });
        }
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
    // Clean up double spaces and ensure proper spacing
    return parts.reduce((acc, part, index) => {
      if (part.type === 'text' && !part.content.trim()) {
        // Only keep spaces after opening parenthesis or before closing
        const prevPart = acc[acc.length - 1];
        const nextPart = parts[index + 1];
        
        if ((prevPart?.type === 'open') || 
            (nextPart?.type === 'close')) {
          acc.push(part);
        }
        return acc;
      }
      
      // Handle spacing around operators, including shift operators
      if (part.type === 'text' && 
          (/^[+\-×÷%]/.test(part.content.trim()) || 
           /^<<|^>>/.test(part.content.trim()))) {
        const lastPart = acc[acc.length - 1];
        if (lastPart?.type === 'text') {
          lastPart.content = lastPart.content.trimEnd();
        }
      }
      
      acc.push(part);
      return acc;
    }, []);
  }
}
