import { ParenthesesTracker } from "@/utils/misc/ParenthesesTracker";

export class ProgrammerOperations {
  constructor(calculator) {
    this.calculator = calculator;
    this.parenthesesTracker = new ParenthesesTracker();
  }

  handleNumber(num) {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input;

    if (currentInput === "0" || currentInput === "Error") {
      state.input = num;
    } else if (this.isLastCharClosingParenthesis()) {
      state.input += ` × ${num}`;
    } else {
      state.input += num;
    }

    return { input: state.input };
  }

  handleOperator(op) {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input.trim();

    // Don't allow operators at the start except minus
    if (currentInput === "" && op !== "-") {
      return { input: state.input };
    }

    // Process operator normally - division by zero is handled at evaluation time
    return this.processOperator(op, currentInput);
  }

  processOperator(op, currentInput) {
    // Handle shift operators
    if (op === "<<" || op === ">>") {
      return this.handleShiftOperator(op);
    }

    // Update input state
    const state = this.calculator.states[this.calculator.activeBase];
    if (this.isLastCharOperator()) {
      state.input = currentInput.replace(/\s*[+\-×÷<<>>]\s*$/, ` ${op} `);
    } else if (!currentInput.endsWith("(")) {
      state.input = `${currentInput} ${op} `;
    }

    return { input: state.input };
  }

  handleShiftOperator(op) {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();

      // Handle empty or error states
      if (currentInput === "" || currentInput === "Error") {
        return { input: state.input, error: "Invalid operation" };
      }

      // Don't add operator after opening parenthesis
      if (currentInput.endsWith("(")) {
        return { input: state.input, error: null };
      }

      let newInput;
      // Handle different cases
      if (this.isLastCharClosingParenthesis()) {
        // Allow shift after closing parenthesis
        newInput = `${currentInput} ${op} `;
      } else if (this.isLastCharOperator()) {
        // Replace existing operator
        newInput = currentInput.replace(/\s*[+\-×÷<<>>]\s*$/, ` ${op} `);
      } else if (this.isLastCharNumber()) {
        // Add operator after number
        newInput = `${currentInput} ${op} `;
      } else {
        // Invalid case
        return { input: state.input, error: "Invalid operation" };
      }

      state.input = newInput.trim() + " ";
      return { input: state.input, error: null };
    } catch (err) {
      console.error('Error in handleShiftOperator:', err);
      return {
        input: this.calculator.states[this.calculator.activeBase].input,
        error: "Operation error"
      };
    }
  }

  handleBasicOperator(op) {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input.trim();
    
    // Allow operators after closing parenthesis
    if (this.isLastCharClosingParenthesis()) {
      state.input = `${currentInput} ${op} `;
      return { input: state.input };
    }

    // Replace last operator if it exists
    if (this.isLastCharOperator()) {
      state.input = currentInput.replace(/\s*[+\-×÷<<>>]\s*$/, ` ${op} `);
      return { input: state.input };
    }

    // Don't add operator if input ends with opening parenthesis
    if (currentInput.endsWith("(")) {
      return { input: state.input };
    }

    // Add operator with proper spacing
    state.input = `${currentInput} ${op} `;
    return { input: state.input };
  }

  handleParenthesis(parenthesis) {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input.trim();
    const position = currentInput.length;

    if (parenthesis === "(") {
      this.handleOpenParenthesis(currentInput, position);
    } else if (parenthesis === ")" && this.canCloseParenthesis(currentInput)) {
      this.handleCloseParenthesis(currentInput, position);
    }

    return {
      input: state.input,
      error: this.calculator.error
    };
  }

  canCloseParenthesis(expr) {
    if (this.parenthesesTracker.getOpenCount() <= 0) return false;
    if (!expr.trim()) return false;

    // Check for valid content between parentheses
    const lastOpenIndex = expr.lastIndexOf("(");
    if (lastOpenIndex === -1) return false;

    const contentAfterOpen = expr.slice(lastOpenIndex + 1).trim();
    if (!contentAfterOpen) return false;

    // Validate last character
    const lastChar = expr.trim().slice(-1);
    return /[0-9A-Fa-f)]/.test(lastChar);
  }

  handleOpenParenthesis(currentInput, position) {
    if (currentInput === "0" || currentInput === "Error") {
      this.calculator.states[this.calculator.activeBase].input = "(";
      this.parenthesesTracker.open(position);
    } else {
      const lastChar = currentInput.slice(-1);
      const needsMultiplication = /[0-9A-Fa-f)]/.test(lastChar);
      const newInput = `${currentInput}${needsMultiplication ? " × " : " "}(`;
      this.calculator.states[this.calculator.activeBase].input = newInput;
      this.parenthesesTracker.open(position + (needsMultiplication ? 3 : 1));
    }
  }

  handleCloseParenthesis(currentInput, position) {
    this.calculator.states[this.calculator.activeBase].input = `${currentInput})`;
    this.parenthesesTracker.close(position);
  }

  handleBackspace() {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input;
    
    if (currentInput === "0" || currentInput === "Error") {
      return;
    }

    const beforeBackspace = currentInput;

    if (this.handleSpecialBackspace(currentInput)) {
      return;
    }

    this.handleDefaultBackspace(currentInput);

    // Validate result after backspace
    if (state.input === beforeBackspace) {
      console.debug('[ProgrammerOperations] Backspace had no effect');
    }
  }

  handleSpecialBackspace(currentInput) {
    const state = this.calculator.states[this.calculator.activeBase];
    
    // Improved shift operator handling
    if (currentInput.match(/\s*[<>]{2}\s*$/)) {
      // Remove shift operator and all trailing spaces in one go
      state.input = currentInput.replace(/\s*[<>]{2}\s*$/, '');
      return true;
    }

    // Handle other operators
    const operatorMatch = currentInput.match(/(.*?)(\s*[+\-×÷]\s*)$/);
    if (operatorMatch) {
      const [, beforeOperator] = operatorMatch;
      if (beforeOperator.match(/(\d|\w)$/)) {
        state.input = beforeOperator;
        return true;
      }
    }

    return false;
  }

  handleDefaultBackspace(currentInput) {
    if (currentInput.length === 1) {
      this.calculator.states[this.calculator.activeBase].input = "0";
    } else {
      this.calculator.states[this.calculator.activeBase].input = 
        currentInput.trimEnd().slice(0, -1);
    }
  }

  // Add validation helper
  validateStateChange(before, after, operation) {
    if (before === after) {
      console.debug(`[ProgrammerOperations] ${operation} had no effect:`, {
        before,
        after
      });
      return false;
    }
    return true;
  }

  // Reset state tracking
  resetStateTracking() {
    this.lastOperation = null;
    this.pendingUpdate = false;
  }

  // Helper methods
  isLastCharOperator() {
    const input = this.calculator.states[this.calculator.activeBase].input.trim();
    return /[+\-×÷]$|\s*<<\s*$|\s*>>\s*$/.test(input) || 
           /\s*[+\-×÷]\s*$/.test(input) || 
           input.endsWith(" << ") || 
           input.endsWith(" >> ");
  }

  isLastCharNumber() {
    return /[0-9A-Fa-f]$/.test(
      this.calculator.states[this.calculator.activeBase].input
    );
  }

  isLastCharClosingParenthesis() {
    return this.calculator.states[this.calculator.activeBase].input.trim().endsWith(")");
  }

  getParenthesesCount() {
    return this.parenthesesTracker.getOpenCount();
  }

  resetParentheses() {
    this.parenthesesTracker = new ParenthesesTracker();
  }

  handleToggleSign() {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input;

    if (currentInput !== "0" && currentInput !== "Error") {
      // Handle expression parts for proper negation
      const parts = currentInput.split(/([+\-×÷<<>>])/);
      const lastPart = parts[parts.length - 1].trim();
      
      if (lastPart) {
        if (lastPart.startsWith("-")) {
          parts[parts.length - 1] = lastPart.slice(1);
        } else {
          parts[parts.length - 1] = "-" + lastPart;
        }
        state.input = parts.join(" ").trim();
      }
    }
    return { input: state.input };
  }

  handlePercent() {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input;

    if (currentInput !== "0" && currentInput !== "Error") {
      try {
        const parts = currentInput.split(/([+\-×÷<<>>])/);
        const lastPart = parts[parts.length - 1].trim();
        
        if (lastPart) {
          const value = parseInt(lastPart, this.calculator.bases[this.calculator.activeBase]);
          const percentValue = Math.floor(value / 100);
          parts[parts.length - 1] = percentValue.toString(this.calculator.bases[this.calculator.activeBase]);
          state.input = parts.join(" ").trim();
        }
      } catch (err) {
        console.error('Error in handlePercent:', err);
      }
    }
    return { input: state.input };
  }
}