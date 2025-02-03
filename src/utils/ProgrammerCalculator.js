import { evaluate, bignumber, isNaN, isNegative } from "mathjs";
import {
  BinCalculator,
  DecCalculator,
  HexCalculator,
  OctCalculator,
} from "./BaseCalculator";
import { EngineCalculator } from "./EngineCalculator";
import { ParenthesesTracker } from "./ParenthesesTracker";

export class ProgrammerCalculator extends EngineCalculator {
  constructor(settings) {
    super(settings);
    this.MAX_INPUT_LENGTH = 29;
    this.states = {
      DEC: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
      HEX: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
    };
    this.calculators = {
      DEC: new DecCalculator(),
      BIN: new BinCalculator(),
      HEX: new HexCalculator(),
      OCT: new OctCalculator(),
    };
    this.parenthesesTracker = new ParenthesesTracker();
  }

  get activeCalculator() {
    return this.calculators[this.activeBase];
  }

  evaluateExpression(expr, base = this.activeBase) {
    try {
      if (!expr || expr.trim() === "") return bignumber(0);

      // Handle base conversion for numbers within parentheses
      let sanitizedExpr = expr.replace(/\(([^)]+)\)/g, (match, group) => {
        if (base !== "DEC") {
          return "(" + this.convertNumbersInGroup(group, base) + ")";
        }
        return match;
      });

      // Convert operators
      sanitizedExpr = sanitizedExpr.replace(/×/g, "*").replace(/÷/g, "/");

      // Remove trailing operators
      sanitizedExpr = sanitizedExpr.replace(/[+\-*/]\s*$/, "");

      // Handle base conversion and maintain parentheses structure
      if (base !== "DEC") {
        sanitizedExpr = sanitizedExpr
          .split(/([+\-*/())]|\s+)/)
          .map((part) => {
            part = part.trim();
            if (!part) return "";
            // Only convert numbers, leave operators and parentheses intact
            if (/^[0-9A-Fa-f]+$/.test(part)) {
              return parseInt(part, this.getBaseInt(base)).toString(10);
            }
            return part;
          })
          .join("");
      }

      // Remove extra spaces
      sanitizedExpr = sanitizedExpr.replace(/\s+/g, " ").trim();

      // Validate balanced parentheses
      if (!this.hasBalancedParentheses(sanitizedExpr)) {
        throw new Error("Unbalanced parentheses");
      }

      const result = evaluate(sanitizedExpr);
      // Round the result to handle division
      return bignumber(Math.floor(result));
    } catch (err) {
      console.error("Error in evaluateExpression:", err, { expr });
      return null;
    }
  }

  convertNumbersInGroup(group, fromBase) {
    return group
      .split(/([+\-×÷]|\s+)/)
      .map((part) => {
        part = part.trim();
        if (!part) return "";
        if (/^[0-9A-Fa-f]+$/.test(part)) {
          return parseInt(part, this.getBaseInt(fromBase)).toString(10);
        }
        return part;
      })
      .join("");
  }

  getBaseInt(base) {
    const bases = {
      BIN: 2,
      OCT: 8,
      DEC: 10,
      HEX: 16
    };
    return bases[base] || 10;
  }

  formatResult(result, base = this.activeBase) {
    if (result === null) return "";
    
    // Convert the result to decimal first
    const decimalValue = result.toNumber();
    
    // Handle negative numbers
    const absoluteValue = Math.abs(decimalValue);
    
    // Convert to target base
    let converted = absoluteValue.toString(this.getBaseInt(base));
    
    // Add negative sign back if needed
    return isNegative(decimalValue) ? "-" + converted : converted;
  }

  convertToBase(value, fromBase, toBase) {
    try {
      // First convert to decimal
      const decimal = parseInt(value.toString(), this.getBaseInt(fromBase));
      if (isNaN(decimal)) return "0";
      
      // Then convert to target base
      return decimal.toString(this.getBaseInt(toBase));
    } catch (err) {
      console.error("Error in convertToBase:", err);
      return "0";
    }
  }

  handleBaseChange(newBase) {
    try {
      const currentExpression = this.states[this.activeBase].input;
      
      // Only evaluate if there's a valid expression
      if (currentExpression && currentExpression !== "0") {
        // Convert from current base to decimal first
        const decimalValue = parseInt(currentExpression, this.getBaseInt(this.activeBase));
        
        if (!isNaN(decimalValue)) {
          // Update the states for all bases
          Object.keys(this.states).forEach((base) => {
            const convertedValue = decimalValue.toString(this.getBaseInt(base));
            this.states[base] = {
              input: convertedValue.toUpperCase(),
              display: convertedValue.toUpperCase()
            };
          });
        }
      }
      
      // Update active base after conversion
      this.activeBase = newBase;
      
      return {
        input: this.states[newBase].input,
        error: this.error,
        displayValues: this.states,
      };
    } catch (err) {
      console.error("Error in handleBaseChange:", err);
      return {
        input: this.states[this.activeBase].input,
        error: "Invalid conversion",
        displayValues: this.states,
      };
    }
  }

  updateDisplayValues() {
    try {
      const currentValue = this.evaluateExpression(
        this.states[this.activeBase].input,
        this.activeBase
      );
      
      if (currentValue !== null) {
        const decimalValue = currentValue.toNumber();
        
        Object.keys(this.states).forEach((base) => {
          const convertedValue = decimalValue.toString(this.getBaseInt(base));
          this.states[base].display = convertedValue;
        });
      }
      return this.states;
    } catch (err) {
      console.error("Error in updateDisplayValues:", err);
      return this.states;
    }
  }

  handleButtonClick(btn) {
    if (this.states[this.activeBase].input === "Error") {
      this.handleClear();
    }

    // Check input length before any operation
    if (
      this.states[this.activeBase].input.length >= this.MAX_INPUT_LENGTH &&
      !["=", "AC", "backspace", "C", "<<", ">>", "±"].includes(btn)
    ) {
      this.error = "Maximum input length reached";
      setTimeout(() => {
        this.error = "";
      }, 2000);
      return {
        input: this.states[this.activeBase].input,
        error: this.error,
        displayValues: this.states
      };
    }

    try {
      switch (btn) {
        case "=":
          return this.handleEquals();
        case "AC":
        case "C":
          this.handleClear();
          break;
        case "CE":
          this.handleClearEntry();
          break;
        case "backspace":
          this.handleBackspace();
          break;
        case "+":
        case "-":
        case "×":
        case "÷":
        case "<<":
        case ">>":
          this.handleOperator(btn);
          break;
        case "±":
          this.handleToggleSign();
          break;
        case "(":
        case ")":
          this.handleParenthesis(btn);
          break;
        case "%":
          this.handlePercent();
          break;
        default:
          this.handleNumber(btn);
      }
    } catch (err) {
      this.error = err.message;
      this.states[this.activeBase].input = "Error";
    }

    this.updateDisplayValues();
    return {
      input: this.states[this.activeBase].input,
      error: this.error,
      expression: this.currentExpression,
    };
  }

// Update ProgrammerCalculator's handleEquals method
handleEquals() {
  try {
    let expression = this.states[this.activeBase].input;

    // Add missing closing parentheses
    const openCount = this.parenthesesTracker.getOpenCount();
    if (openCount > 0) {
      expression += " )".repeat(openCount);
    }

    this.currentExpression = expression;
    const result = this.evaluateExpression(expression);

    if (result === null) throw new Error("Invalid expression");

    const formattedResult = this.formatResult(result);
    
    // Update all base states with the result
    Object.keys(this.states).forEach((base) => {
      const convertedValue = this.convertToBase(formattedResult, this.activeBase, base);
      this.states[base] = {
        input: convertedValue,
        display: convertedValue
      };
    });

    // Reset parentheses tracking after successful evaluation
    this.parenthesesTracker = new ParenthesesTracker();

    // Important: Set the current base's input to the formatted result
    this.states[this.activeBase].input = formattedResult;

    return {
      input: this.states[this.activeBase].input,
      expression: this.currentExpression,
      result: formattedResult,
      displayValues: { ...this.states } // Create a new object to ensure reactivity
    };
  } catch (err) {
    this.error = err.message;
    this.states[this.activeBase].input = "Error";
    return {
      input: "Error",
      expression: this.currentExpression,
      result: "Error",
      error: err.message
    };
  }
}

  handleClear() {
    this.states[this.activeBase].input = "0";
    this.parenthesesTracker = new ParenthesesTracker();
    this.error = "";
  }

  handleClearEntry() {
    if (
      this.states[this.activeBase].input !== "0" &&
      this.states[this.activeBase].input !== "Error"
    ) {
      const parts = this.states[this.activeBase].input.split(" ");
      parts.pop();
      this.states[this.activeBase].input = parts.join(" ") || "0";
    } else {
      this.handleClear();
    }
  }

  handleBackspace() {
    if (
      this.states[this.activeBase].input === "0" ||
      this.states[this.activeBase].input === "Error"
    ) {
      return;
    }

    let currentInput = this.states[this.activeBase].input;

    // Check for shift operators first
    if (currentInput.endsWith(" >> ") || currentInput.endsWith(" << ")) {
      // Remove the entire shift operator including spaces
      this.states[this.activeBase].input = currentInput.slice(0, -4);
      return;
    }

    // Check if we're about to delete a number followed by an operator
    const operatorMatch = currentInput.match(/(.*?)(\s*[+\-×÷]\s*)$/);
    if (operatorMatch) {
      const [, beforeOperator] = operatorMatch;

      // If the number before the operator is a single digit
      if (beforeOperator.match(/(\d|\w)$/)) {
        // Remove both the number and the operator group
        this.states[this.activeBase].input = beforeOperator.slice(0, -1);
        return;
      }
    }

    // Check if we're about to delete a single number/character followed by a space
    const singleNumberWithSpaceMatch = currentInput.match(
      /(.*?)(\s*[0-9A-Fa-f]\s+)$/
    );
    if (singleNumberWithSpaceMatch) {
      const [, beforeNumber] = singleNumberWithSpaceMatch;
      // Remove both the number and the following space
      this.states[this.activeBase].input = beforeNumber;
      return;
    }

    // Handle parentheses
    const position = currentInput.length - 1;
    const currentChar = currentInput[position];

    if (currentChar === "(" || currentChar === ")") {
      this.parenthesesTracker.handleBackspace(position, currentInput);
    }

    // Default case: remove one character
    if (currentInput.length === 1) {
      this.states[this.activeBase].input = "0";
    } else {
      // Remove trailing spaces if present
      if (currentInput.endsWith(" ")) {
        currentInput = currentInput.trimEnd();
      }
      this.states[this.activeBase].input = currentInput.slice(0, -1);
    }

    // Clean up any trailing spaces after operators
    this.states[this.activeBase].input = this.states[
      this.activeBase
    ].input.replace(/\s+$/, "");
  }

  handleLeftShift() {
    this.handleOperator("<<");
  }

  handleRightShift() {
    this.handleOperator(">>");
  }

  handleOperator(op) {
    this.error = "";

    // Special handling for shift operators
    if (op === "<<" || op === ">>") {
      if (this.isLastCharOperator()) {
        // Replace the last operator with the shift operator
        this.states[this.activeBase].input = this.states[
          this.activeBase
        ].input.replace(/\s*[+\-×÷<<>>]\s*$/, ` ${op} `);
      } else if (!this.states[this.activeBase].input.endsWith("(")) {
        this.states[this.activeBase].input += ` ${op} `;
      }
      return;
    }

    // Regular operator handling
    if (
      !this.isLastCharOperator() &&
      !this.states[this.activeBase].input.endsWith("(")
    ) {
      this.states[this.activeBase].input += ` ${op} `;
    } else if (this.isLastCharOperator()) {
      this.states[this.activeBase].input = this.states[
        this.activeBase
      ].input.replace(/\s*[+\-×÷<<>>]\s*$/, ` ${op} `);
    }
  }

  handleNumber(num) {
    this.error = "";

    const currentInput = this.states[this.activeBase].input;

    // Handle special cases where input is '0' or 'Error'
    if (currentInput === "0" || currentInput === "Error") {
      // Allow zero input if we're in binary mode
      if (this.activeBase === "BIN" && num === "0") {
        this.states[this.activeBase].input = num;
        return;
      }
      // For other bases, replace initial zero with the number
      this.states[this.activeBase].input = num;
      return;
    }

    // Handle the case where the last character is a closing parenthesis
    if (this.isLastCharClosingParenthesis()) {
      this.states[this.activeBase].input += ` × ${num}`;
      return;
    }

    // Remove restriction on leading zeros after operators
    // This was preventing valid zero inputs
    
    // Default case: append the number to the current input
    this.states[this.activeBase].input += num;
  }

  handleToggleSign() {
    if (this.states[this.activeBase].input !== "0") {
      if (this.states[this.activeBase].input.startsWith("-")) {
        this.states[this.activeBase].input =
          this.states[this.activeBase].input.slice(1);
      } else {
        this.states[this.activeBase].input =
          "-" + this.states[this.activeBase].input;
      }
    }
  }

  handleParenthesis(parenthesis) {
    const currentInput = this.states[this.activeBase].input.trim();
    const position = currentInput.length;

    if (parenthesis === "(") {
      if (currentInput === "0" || currentInput === "Error") {
        this.states[this.activeBase].input = "(";
        this.parenthesesTracker.open(position);
      } else {
        const lastChar = currentInput.slice(-1);
        const needsMultiplication = /[0-9A-Fa-f)]/.test(lastChar);
        this.states[this.activeBase].input = `${currentInput}${
          needsMultiplication ? " × " : " "
        }(`;
        this.parenthesesTracker.open(position + (needsMultiplication ? 3 : 1));
      }
      // Force display update to show highlighting
      this.updateDisplayValues();
    } else if (parenthesis === ")" && this.parenthesesTracker.canClose(currentInput)) {
      this.states[this.activeBase].input = `${currentInput})`;
      this.parenthesesTracker.close(position);
      // Force display update to show highlighting
      this.updateDisplayValues();
    }
    return { input: this.states[this.activeBase].input, error: this.error };
  }

  canAddClosingParenthesis(expr) {
    if (this.parenthesesCount <= 0) return false;

    // Check if we have content after the last opening parenthesis
    const lastOpenIndex = expr.lastIndexOf("(");
    if (lastOpenIndex === -1) return false;

    const contentAfterLastOpen = expr.slice(lastOpenIndex + 1).trim();
    if (!contentAfterLastOpen) return false;

    // Check if the last character is valid for closing
    const lastChar = expr.trim().slice(-1);
    return /[0-9A-Fa-f)]/.test(lastChar);
  }

  hasValidContentForClosing() {
    const currentInput = this.states[this.activeBase].input;
    const lastOpenIndex = currentInput.lastIndexOf("(");
    if (lastOpenIndex === -1) return false;

    const contentAfterLastOpen = currentInput.slice(lastOpenIndex + 1).trim();
    return contentAfterLastOpen.length > 0;
  }

  handlePercent() {
    const currentValue = this.evaluateExpression(
      this.states[this.activeBase].input
    );
    this.states[this.activeBase].input = this.formatResult(
      currentValue.div(100)
    );
  }



  isLastCharOperator() {
    return /[+\-×÷<<>>]\s*$/.test(this.states[this.activeBase].input);
  }

  isLastCharNumber() {
    return /[0-9A-Fa-f]$/.test(this.states[this.activeBase].input);
  }

  isLastCharClosingParenthesis() {
    return this.states[this.activeBase].input.trim().endsWith(")");
  }
}
