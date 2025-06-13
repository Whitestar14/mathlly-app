/**
 * Handles standard calculator operations
 */
export class StandardOperations {
  calculator: any;

  /**
   * Creates a new StandardOperations instance
   * @param {Object} calculator - The calculator instance to operate on
   */
  constructor(calculator: any) {
    this.calculator = calculator;
  }

  /**
   * Handles numeric input including decimal point
   * @param {string} num - The number or decimal point to add
   * @returns {Object} Updated input state and error message
   */
  handleNumber(num: string): Record<string, any> {
    if (this.calculator.input === "0" && num !== ".") {
      this.calculator.input = num;
      return this.createResponse();
    }
    if (!this.validateNumberInput(num)) {
      return this.createResponse();
    }
    this.calculator.input += num;
    return this.createResponse();
  }

  /**
   * Handles arithmetic operator input
   * @param {string} op - The operator to add (+, -, ×, ÷)
   * @returns {Object} Updated input state and error message
   */
  handleOperator(op: string): Record<string, any> {
    const lastChar = this.calculator.input.trim().slice(-1);
    const isLastCharOperator = this.isOperator(lastChar);
    if (
      op === "-" &&
      isLastCharOperator &&
      ["×", "÷", "+"].includes(lastChar)
    ) {
      this.calculator.input += ` ${op} `;
      return this.createResponse();
    }
    this.calculator.input = isLastCharOperator
      ? this.calculator.input.slice(0, -3) + ` ${op} `
      : this.calculator.input + ` ${op} `;
    return this.createResponse();
  }

  /**
   * Handles backspace operation
   * @returns {Object} Updated input state and error message
   */
  handleBackspace(): Record<string, any> {
    if (
      this.calculator.input === "0" ||
      this.calculator.input === "Error" ||
      this.calculator.input === "Overflow"
    ) {
      return this.createResponse();
    }
    const operatorMatch = this.calculator.input.match(
      /(.*?)(\s*[+\-×÷]\s*)(\d)$/
    );
    this.calculator.input = operatorMatch
      ? operatorMatch[1]
      : this.calculator.input.length === 1
      ? "0"
      : this.calculator.input.slice(0, -1);
    return this.createResponse();
  }

  /**
   * Toggles the sign of the current number
   * @returns {Object} Updated input state and error message
   */
  handleToggleSign(): Record<string, any> {
    const currentInput = this.calculator.input;
    if (currentInput !== "0" && currentInput !== "Error") {
      const parts = currentInput.split(/([+×÷])/);
      const lastPart = parts[parts.length - 1].trim();
      if (lastPart) {
        if (lastPart.startsWith("-")) parts[parts.length - 1] = lastPart.slice(1);
        else parts[parts.length - 1] = "- " + lastPart;
        this.calculator.input = parts.join(" ").trim();
      }
    }
    return this.createResponse(this.calculator.error);
  }

  /**
   * Squares the current value
   * @returns {Object} Updated input state and error message
   */
  handleSquare(): Record<string, any> {
    return this.handleOperation((value: number) => {
      if (!Number.isFinite(value)) throw new Error("Overflow");
      return Math.pow(value, 2);
    });
  }

  /**
   * Calculates the square root of the current value
   * @returns {Object} Updated input state and error message
   */
  handleSquareRoot(): Record<string, any> {
    return this.handleOperation((value: number) => {
      if (value < 0)
        throw new Error("Cannot calculate square root of negative number");
      return Math.sqrt(value);
    });
  }

  /**
   * Calculates the reciprocal (1/x) of the current value
   * @returns {Object} Updated input state and error message
   */
  handleReciprocal(): Record<string, any> {
    return this.handleOperation((value: number) => {
      if (value === 0) throw new Error("Cannot divide by zero");
      return 1 / value;
    });
  }

  /**
   * Converts the current value to a percentage
   * @returns {Object} Updated input state and error message
   */
  handlePercentage(): Record<string, any> {
    return this.handleOperation((value: number) => value / 100);
  }

  /**
   * Generic handler for operations that transform the current value
   * @param {Function} operation - Function that takes a number and returns a transformed number
   * @returns {Object} Updated input state and error message
   */
  handleOperation(operation: (value: number) => number): Record<string, any> {
    try {
      const value = this.calculator.evaluateExpression(this.calculator.input);
      const result = operation(value);
      if (!Number.isFinite(result)) {
        throw new Error("Overflow");
      }
      this.calculator.input = this.calculator.formatResult(result);
      return this.createResponse();
    } catch (err: any) {
      if (err.message === "Overflow")
        return {
          input: this.calculator.input,
          error: "Overflow: Evaluated result exceeding max limit",
        };
      return { input: "Error", error: err.message };
    }
  }

  /**
   * Validates if a number can be added to the current input
   * @param {string} num - The number to validate
   * @returns {boolean} Whether the number can be added
   */
  validateNumberInput(num: string): boolean {
    if (num === ".") {
      const parts = this.calculator.input.split(/[+\-×÷]+/);
      return !parts[parts.length - 1].includes(".");
    }
    return true;
  }

  /**
   * Checks if a character is an operator
   * @param {string} char - Character to check
   * @returns {boolean} Whether the character is an operator
   */
  isOperator(char: string): boolean {
    // Import from CalculatorUtils
    return ["+", "-", "×", "÷"].includes(char);
  }

  /**
   * Creates a standardized response object
   * @param {string} [error=""] - Optional error message
   * @returns {Object} Standardized response with input and error
   */
  createResponse(error: string = ""): Record<string, any> {
    return { 
      input: this.calculator.input, 
      error: error 
    };
  }
}
