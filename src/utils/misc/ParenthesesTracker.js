export class ParenthesesTracker {
  constructor() {
    this.count = 0;
    this.groups = [];
  }

  open(position) {
    this.count++;
    this.groups.push({
      start: position,
      content: ""
    });
  }

  close(position) {
    if (this.count > 0) {
      this.count--;
      const group = this.groups[this.groups.length - 1];
      if (group) {
        group.end = position;
      }
      return true;
    }
    return false;
  }

  updateLastGroupContent(expr) {
    if (this.groups.length > 0) {
      const lastGroup = this.groups[this.groups.length - 1];
      const contentAfterOpen = expr.slice(lastGroup.start + 1);
      lastGroup.content = contentAfterOpen.split(')')[0];
    }
  }

  handleBackspace(position, expr) {
    if (expr[position] === '(') {
      this.count--;
      this.groups = this.groups.filter(g => g.start !== position);
    } else if (expr[position] === ')') {
      this.count++;
      this.groups = this.groups.filter(g => g.end !== position);
    }
    this.updateLastGroupContent(expr);
  }

  canClose(expr) {
    if (this.count <= 0) return false;
    const lastGroup = this.groups[this.groups.length - 1];
    if (!lastGroup) return false;
    
    const contentAfterOpen = expr.slice(lastGroup.start + 1);
    return contentAfterOpen.trim().length > 0;
  }

  getOpenCount() {
    return this.count;
  }

  getGhostParentheses() {
    return ")".repeat(this.count);
  }

  getMatchedPairs(expr) {
    console.log('Getting matched pairs for:', expr);
    const pairs = [];
    const stack = [];
    
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') {
        console.log('Found opening paren at:', i);
        stack.push(i);
      } else if (expr[i] === ')' && stack.length > 0) {
        const openPos = stack.pop();
        console.log('Found matching pair:', { open: openPos, close: i });
        pairs.push({ open: openPos, close: i });
      }
    }

    // Handle unclosed parentheses
    if (stack.length > 0) {
      console.log('Unclosed parentheses at positions:', stack);
      stack.forEach(openPos => {
        pairs.push({ open: openPos, ghost: true });
      });
    }

    console.log('Final pairs:', pairs);
    return pairs;
  }
}
