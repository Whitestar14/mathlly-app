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

    // Allow minus sign after operators or at start
    if ((currentInput === "" || this.isLastCharOperator()) && op === "-") {
      state.input = currentInput ? `${currentInput} ${op}` : op;
      return { input: state.input };
    }

    // Don't allow other operators at the start
    if (currentInput === "" && op !== "-") {
      return { input: state.input };
    }

    // Handle shift operators specially
    if (op === "<<" || op === ">>") {
      return this.handleShiftOperator(op);
    }

    // Use handleBasicOperator for all other arithmetic operators
    return this.handleBasicOperator(op);
  }

  handleShiftOperator(op) {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
  
      // Handle empty or error states
      if (!currentInput || currentInput === "Error") {
        return { input: state.input, error: "Invalid operation" };
      }
  
      // Don't add operator after opening parenthesis
      if (currentInput.endsWith("(")) {
        return { input: state.input, error: null };
      }
  
      // Don't add shift operator if last part is incomplete
      const parts = currentInput.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart || /[+\-×÷]$/.test(lastPart)) {
        return { input: state.input, error: null };
      }
  
      // Ensure proper spacing for all cases
      let newInput;
      
      // Explicitly check for closing parenthesis
      if (currentInput.trim().endsWith(")")) {
        newInput = `${currentInput.trim()} ${op} `;
      } 
      // Replace existing shift operator
      else if (/>>\s*$|<<\s*$/.test(currentInput)) {
        newInput = currentInput.replace(/\s*(?:<<|>>)\s*$/, ` ${op} `);
      } 
      // Add after number
      else if (this.isLastCharNumber()) {
        newInput = `${currentInput.trim()} ${op} `;
      } 
      else {
        return { input: state.input, error: "Invalid operation" };
      }
  
      state.input = newInput;
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
      state.input = currentInput.replace(/\s*[+\-×÷<<>>%]\s*$/, ` ${op} `);
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

    // Validate last character - now including shift operators
    const lastContent = contentAfterOpen.trim();
    if (lastContent.endsWith('<<') || lastContent.endsWith('>>')) return false;

    // Check if content is a complete expression
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
    const operatorMatch = currentInput.match(/(.*?)(\s*[+\-×÷%]\s*)$/);
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

  // Helper methods
  isLastCharOperator() {
    const input = this.calculator.states[this.calculator.activeBase].input.trim();
    return /[+\-×÷%]$|\s*<<\s*$|\s*>>\s*$/.test(input) || 
           /\s*[+\-×÷%]\s*$/.test(input) || 
           (/-$/.test(input) && !/-\d+$/.test(input)) ||
           input.endsWith(" << ") || 
           input.endsWith(" >> ") || 
           input.endsWith(" % ");
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
      const parts = currentInput.split(/([+×÷<<>>%])/);
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

  handleModuloSign() {
    const state = this.calculator.states[this.calculator.activeBase];
    const currentInput = state.input.trim();
    
    // Don't add modulo if input is empty or error
    if (!currentInput || currentInput === "0" || currentInput === "Error") {
      return { input: state.input };
    }

    // Don't add operator if input ends with opening parenthesis
    if (currentInput.endsWith("(")) {
      return { input: state.input };
    }

    // Allow modulo after closing parenthesis or numbers
    if (this.isLastCharClosingParenthesis() || this.isLastCharNumber()) {
      state.input = `${currentInput} % `;
      return { input: state.input };
    }

    // Replace last operator if it exists
    if (this.isLastCharOperator()) {
      state.input = currentInput.replace(/\s*[+\-×÷%<<>>]\s*$/, " % ");
      return { input: state.input };
    }

    return { input: state.input };
  }
}