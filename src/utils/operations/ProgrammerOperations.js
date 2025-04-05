import { ParenthesesTracker } from "@/utils/core/ParenthesesTracker";

export class ProgrammerOperations {
  constructor(calculator) {
    this.calculator = calculator;
    this.parenthesesTracker = new ParenthesesTracker();
  }

  /**
   * Handle numeric input
   * @param {string} num - Number to add
   * @returns {Object} Updated state
   */
  handleNumber(num) {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;

      if (currentInput === "0" || currentInput === "Error") {
        state.input = num;
      } else if (this.isLastCharClosingParenthesis()) {
        state.input += ` × ${num}`;
      } else {
        state.input += num;
      }

      return this.createResponse(state.input);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle operator input
   * @param {string} op - Operator to add
   * @returns {Object} Updated state
   */
  handleOperator(op) {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();

      // Allow minus sign after operators or at start
      if ((currentInput === "" || this.isLastCharOperator()) && op === "-") {
        state.input = currentInput ? `${currentInput} ${op}` : op;
        return this.createResponse(state.input);
      }

      // Don't allow other operators at the start
      if (currentInput === "" && op !== "-") {
        return this.createResponse(state.input);
      }

      // Handle shift operators specially
      if (op === "<<" || op === ">>") {
        return this.handleShiftOperator(op);
      }

      // Use handleBasicOperator for all other arithmetic operators
      return this.handleBasicOperator(op);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle shift operators (<< and >>)
   * @param {string} op - Shift operator
   * @returns {Object} Updated state
   */
  handleShiftOperator(op) {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
  
      // Handle empty or error states
      if (!currentInput || currentInput === "Error") {
        return this.createErrorResponse(new Error("Invalid operation"));
      }
  
      // Don't add operator after opening parenthesis
      if (currentInput.endsWith("(")) {
        return this.createResponse(state.input);
      }
  
      // Don't add shift operator if last part is incomplete
      const parts = currentInput.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart || /[+\-×÷]$/.test(lastPart)) {
        return this.createResponse(state.input);
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
        return this.createErrorResponse(new Error("Invalid operation"));
      }
  
      state.input = newInput;
      return this.createResponse(state.input);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }
  
  /**
   * Handle basic arithmetic operators (+, -, ×, ÷, %)
   * @param {string} op - Operator to add
   * @returns {Object} Updated state
   */
  handleBasicOperator(op) {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      
      // Allow operators after closing parenthesis
      if (this.isLastCharClosingParenthesis()) {
        state.input = `${currentInput} ${op} `;
        return this.createResponse(state.input);
      }

      // Replace last operator if it exists
      if (this.isLastCharOperator()) {
        state.input = currentInput.replace(/\s*[+\-×÷<<>>%]\s*$/, ` ${op} `);
        return this.createResponse(state.input);
      }

      // Don't add operator if input ends with opening parenthesis
      if (currentInput.endsWith("(")) {
        return this.createResponse(state.input);
      }

      // Add operator with proper spacing
      state.input = `${currentInput} ${op} `;
      return this.createResponse(state.input);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle parenthesis input
   * @param {string} parenthesis - Opening or closing parenthesis
   * @returns {Object} Updated state
   */
  handleParenthesis(parenthesis) {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      const position = currentInput.length;

      if (parenthesis === "(") {
        this.handleOpenParenthesis(currentInput, position);
      } else if (parenthesis === ")" && this.canCloseParenthesis(currentInput)) {
        this.handleCloseParenthesis(currentInput, position);
      }

      return this.createResponse(state.input);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Check if a closing parenthesis can be added
   * @param {string} expr - Current expression
   * @returns {boolean} Whether closing parenthesis can be added
   */
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

  /**
   * Handle opening parenthesis
   * @param {string} currentInput - Current input
   * @param {number} position - Current cursor position
   */
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

  /**
   * Handle closing parenthesis
   * @param {string} currentInput - Current input
   * @param {number} position - Current cursor position
   */
  handleCloseParenthesis(currentInput, position) {
    this.calculator.states[this.calculator.activeBase].input = `${currentInput})`;
    this.parenthesesTracker.close(position);
  }

  /**
   * Handle backspace operation
   * @returns {Object} Updated state
   */
  handleBackspace() {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;
      
      if (currentInput === "0" || currentInput === "Error") {
        return this.createResponse(state.input);
      }

      const beforeBackspace = currentInput;

      if (this.handleSpecialBackspace(currentInput)) {
        return this.createResponse(state.input);
      }

      this.handleDefaultBackspace(currentInput);

      // Validate result after backspace
      if (state.input === beforeBackspace) {
        console.debug('[ProgrammerOperations] Backspace had no effect');
      }
      
      return this.createResponse(state.input);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle special backspace cases (operators, shift operators)
   * @param {string} currentInput - Current input
   * @returns {boolean} Whether special case was handled
   */
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

  /**
   * Handle default backspace behavior
   * @param {string} currentInput - Current input
   */
  handleDefaultBackspace(currentInput) {
    if (currentInput.length === 1) {
      this.calculator.states[this.calculator.activeBase].input = "0";
    } else {
      this.calculator.states[this.calculator.activeBase].input = 
        currentInput.trimEnd().slice(0, -1);
    }
  }

  /**
   * Handle sign toggle operation
   * @returns {Object} Updated state
   */
  handleToggleSign() {
    try {
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
      return this.createResponse(state.input);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle modulo operator
   * @returns {Object} Updated state
   */
  handleModuloSign() {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      
      // Don't add modulo if input is empty or error
      if (!currentInput || currentInput === "0" || currentInput === "Error") {
        return this.createResponse(state.input);
      }

      // Don't add operator if input ends with opening parenthesis
      if (currentInput.endsWith("(")) {
        return this.createResponse(state.input);
      }

      // Allow modulo after closing parenthesis or numbers
      if (this.isLastCharClosingParenthesis() || this.isLastCharNumber()) {
        state.input = `${currentInput} % `;
        return this.createResponse(state.input);
      }

      // Replace last operator if it exists
      if (this.isLastCharOperator()) {
        state.input = currentInput.replace(/\s*[+\-×÷%<<>>]\s*$/, " % ");
        return this.createResponse(state.input);
      }

      return this.createResponse(state.input);
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  // Helper methods
  
  /**
   * Check if last character is an operator
   * @returns {boolean} Whether last character is an operator
   */
  isLastCharOperator() {
    const input = this.calculator.states[this.calculator.activeBase].input.trim();
    return /[+\-×÷%]$|\s*<<\s*$|\s*>>\s*$/.test(input) || 
           /\s*[+\-×÷%]\s*$/.test(input) || 
           (/-$/.test(input) && !/-\d+$/.test(input)) ||
           input.endsWith(" << ") || 
           input.endsWith(" >> ") || 
           input.endsWith(" % ");
  }

  /**
   * Check if last character is a number or hex digit
   * @returns {boolean} Whether last character is a number
   */
  isLastCharNumber() {
    return /[0-9A-Fa-f]$/.test(
      this.calculator.states[this.calculator.activeBase].input
    );
  }

  /**
   * Check if last character is a closing parenthesis
   * @returns {boolean} Whether last character is a closing parenthesis
   */
  isLastCharClosingParenthesis() {
    return this.calculator.states[this.calculator.activeBase].input.trim().endsWith(")");
  }

  /**
   * Get count of open parentheses
   * @returns {number} Count of open parentheses
   */
  getParenthesesCount() {
    return this.parenthesesTracker.getOpenCount();
  }

  /**
   * Reset parentheses tracker
   */
  resetParentheses() {
    this.parenthesesTracker = new ParenthesesTracker();
  }

  /**
   * Create standardized response object
   * @param {string} input - Current input
   * @param {string} [error=null] - Error message if any
   * @returns {Object} Standardized response
   */
  createResponse(input, error = null) {
    return {
      input: input,
      error: error,
      expression: this.calculator.currentExpression
    };
  }

  /**
   * Create standardized error response
   * @param {Error} err - Error object
   * @returns {Object} Standardized error response
   */
  createErrorResponse(err) {
    console.error('[ProgrammerOperations] Error:', err);
    return {
      input: this.calculator.states[this.calculator.activeBase].input,
      error: err.message || "Operation error",
      expression: this.calculator.currentExpression
    };
  }
}
