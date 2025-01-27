import { evaluate, bignumber } from 'mathjs';
import { useSettingsStore } from '@/stores/settings';
// Base class for calculator functionality
export class EngineCalculator {
  constructor() {
    this.input = "0";
    this.error = "";
    this.currentExpression = "";
    this.memoryValue = 0;
    this.activeBase = "DEC";
    this.settings = useSettingsStore();
    this.parenthesesStack = [];
    this.MAX_INPUT_LENGTH = 50;
  }

  // Core evaluation method using Math.js
  evaluateExpression(expr) {
    try {
      if (!expr || expr.trim() === "") return bignumber(0);

      // Sanitize expression
      let sanitizedExpr = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[+\-*/]\s*$/, "")  // Remove trailing operators
        .replace(/\s+/g, " ")
        .trim();

      // Validate balanced parentheses
      if (!this.hasBalancedParentheses(sanitizedExpr)) {
        throw new Error("Unbalanced parentheses");
      }

      const result = evaluate(sanitizedExpr);
      return bignumber(result);
    } catch (err) {
      console.error("Evaluation error:", err);
      throw new Error("Invalid expression");
    }
  }

  // Parentheses handling
  hasBalancedParentheses(expr) {
    const stack = [];
    for (let char of expr) {
      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        if (stack.length === 0) return false;
        stack.pop();
      }
    }
    return stack.length === 0;
  }

  handleMemoryClear() {
    this.memoryValue = 0;
    return { input: this.input, error: this.error };
  }
  
  handleMemoryRecall() {
    if (this.memoryValue !== null) {
      this.input = this.formatResult(this.memoryValue);
    }
    return { input: this.input, error: this.error };
  }
  
  handleMemoryAdd() {
    try {
      const currentValue = this.evaluateExpression(this.input);
      this.memoryValue = evaluate(`${this.memoryValue} + ${currentValue}`);
      return { input: this.input, error: this.error };
    } catch (err) {
      this.error = "Memory operation failed";
      return { input: this.input, error: this.error };
    }
  }
  
  handleMemorySubtract() {
    try {
      const currentValue = this.evaluateExpression(this.input);
      this.memoryValue = evaluate(`${this.memoryValue} - ${currentValue}`);
      return { input: this.input, error: this.error };
    } catch (err) {
      this.error = "Memory operation failed";
      return { input: this.input, error: this.error };
    }
  }
  
  handleMemoryStore() {
    try {
      this.memoryValue = this.evaluateExpression(this.input);
      return { input: this.input, error: this.error };
    } catch (err) {
      this.error = "Cannot store in memory";
      return { input: this.input, error: this.error };
    }
  }  

  // Utility methods
  isLastCharOperator() {
    return /[+\-×÷]\s*$/.test(this.input);
  }

  isLastCharNumber() {
    return /[0-9A-Fa-f]$/.test(this.input);
  }

  handleParenthesis(type) {
    if (type === '(') {
      this.parenthesesStack.push(this.input.length);
      this.input = this.input === "0" ? "(" : `${this.input}(`;
    } else if (type === ')' && this.parenthesesStack.length > 0) {
      this.parenthesesStack.pop();
      this.input += ")";
    }
  }

  handleUnaryOperation(operation) {
    try {
      const parts = this.input.split(/([+\-×÷])/);
      const lastValue = parts[parts.length - 1].trim();
      const value = this.evaluateExpression(lastValue);
      const result = evaluate(operation(value));
  
      parts[parts.length - 1] = ` ${this.formatResult(result)}`;
      this.input = parts.join("");
      return { input: this.input, error: this.error };
    } catch (err) {
      this.input = "Error";
      this.error = err.message;
      return { input: this.input, error: this.error };
    }
  }
  
  handlePercentage() {
    if (this.input !== "Error" && !this.isLastCharOperator()) {
      try {
        const result = parseFloat(this.input) / 100;
        if (!isFinite(result)) {
          throw new Error("Invalid percentage calculation");
        }
        this.input = this.formatResult(result);
      } catch (err) {
        this.error = err.message;
      }
    }
    return { input: this.input, error: this.error };
  }
  
  handleReciprocal() {
    return this.handleUnaryOperation((value) => `1/${value}`);
  }
  
  handleSquare() {
    return this.handleUnaryOperation((value) => `${value}^2`);
  }
  
  handleSquareRoot() {
    return this.handleUnaryOperation((value) => `sqrt(${value})`);
  }

  // Abstract methods to be implemented by child classes
  formatResult() {
    throw new Error("formatResult must be implemented by child class");
  }

  handleEquals() {
    throw new Error("handleEquals must be implemented by child class");
  }

  handleOperator() {
    throw new Error("handleOperator must be implemented by child class");
  }

  handleNumber() {
    throw new Error("handleNumber must be implemented by child class");
  }
}