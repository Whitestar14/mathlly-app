import { evaluate, bignumber } from "mathjs";
import {
  BinCalculator,
  DecCalculator,
  HexCalculator,
  OctCalculator,
} from "./BaseCalculator";

export class ProgrammerCalculator {
  constructor(settings) {
    this.activeBase = "DEC";
    this.states = {
      DEC: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
      HEX: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
    };
    this.error = "";
    this.settings = settings;
    this.currentExpression = "";
    this.calculators = {
      DEC: new DecCalculator(),
      BIN: new BinCalculator(),
      HEX: new HexCalculator(),
      OCT: new OctCalculator(),
    };
    this.parenthesesCount = 0;
  }

  get activeCalculator() {
    return this.calculators[this.activeBase];
  }

  evaluateExpression(expr, base = this.activeBase) {
    try {
      if (!expr || expr.trim() === "") return bignumber(0);

      // First, standardize spacing around parentheses
      let sanitizedExpr = expr
        .replace(/\(/g, " ( ")
        .replace(/\)/g, " ) ")
        .replace(/\s+/g, " ")
        .trim();

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
      return bignumber(result);
    } catch (err) {
      console.error("Error in evaluateExpression:", err, { expr });
      return null;
    }
  }

  // Add this helper method
  hasBalancedParentheses(expr) {
    let count = 0;
    for (let char of expr) {
      if (char === "(") count++;
      if (char === ")") count--;
      if (count < 0) return false;
    }
    return count === 0;
  }

  getBaseInt(base) {
    switch (base) {
      case "BIN":
        return 2;
      case "OCT":
        return 8;
      case "DEC":
        return 10;
      case "HEX":
        return 16;
      default:
        throw new Error("Invalid base");
    }
  }

  formatResult(result, base = this.activeBase) {
    if (result === null) return "";
    const intValue = parseInt(result.toString());
    let formattedResult;
    if (base === "BIN") {
      formattedResult = intValue.toString(2);
    } else {
      formattedResult = this.calculators[base].formatResult(intValue);
    }

    if (this.settings.useThousandsSeparator && base == "DEC") {
      const [integerPart, decimalPart] = formattedResult.split(".");
      const formattedIntegerPart = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
      );
      formattedResult = decimalPart
        ? `${formattedIntegerPart}.${decimalPart}`
        : formattedIntegerPart;
    }

    return formattedResult;
  }

  handleBaseChange(newBase) {
    const currentValue = this.evaluateExpression(
      this.states[this.activeBase].input,
      this.activeBase
    );
    this.activeBase = newBase;
    if (currentValue !== null) {
      Object.keys(this.states).forEach((base) => {
        this.states[base].input = this.formatResult(currentValue, base);
        this.states[base].display = this.states[base].input;
      });
    }
    return {
      input: this.states[newBase].input,
      error: this.error,
      displayValues: this.states,
    };
  }

  updateDisplayValues() {
    const currentValue = this.evaluateExpression(
      this.states[this.activeBase].input,
      this.activeBase
    );
    if (currentValue !== null) {
      Object.keys(this.states).forEach((base) => {
        this.states[base].display = this.formatResult(currentValue, base);
      });
    }
    return this.states;
  }

  handleButtonClick(btn) {
    if (this.states[this.activeBase].input === "Error") {
      this.handleClear();
    }

    const maxLength = this.activeCalculator.maxInputLength;
    if (
      this.states[this.activeBase].input.length >= maxLength &&
      btn !== "=" &&
      btn !== "AC" &&
      btn !== "backspace" &&
      btn !== "C" &&
      btn !== "<<" &&
      btn !== ">>" &&
      btn !== "±"
    ) {
      this.error = "Maximum input length reached";
      setTimeout(() => {
        this.error = "";
      }, 1000);
      return { input: this.states[this.activeBase].input, error: this.error };
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

  handleLeftShift() {
    this.handleOperator("<<");
  }

  handleRightShift() {
    this.handleOperator(">>");
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

    if (parenthesis === "(") {
      // Handle opening parenthesis
      if (currentInput === "0" || currentInput === "Error") {
        this.states[this.activeBase].input = "(";
        this.parenthesesCount++;
        return;
      }

      // Add multiplication operator if needed
      const lastChar = currentInput.slice(-1);
      const needsMultiplication = /[0-9A-Fa-f)]/.test(lastChar);

      this.states[this.activeBase].input = `${currentInput}${
        needsMultiplication ? " × " : " "
      }(`;
      this.parenthesesCount++;
    } else if (parenthesis === ")") {
      // Handle closing parenthesis
      if (this.canAddClosingParenthesis(currentInput)) {
        this.states[this.activeBase].input = `${currentInput})`;
        this.parenthesesCount--;
      }
    }
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

  handleOperator(op) {
    this.error = "";
    if (
      !this.isLastCharOperator() &&
      !this.states[this.activeBase].input.endsWith("(")
    ) {
      this.states[this.activeBase].input += ` ${op} `;
    } else if (this.isLastCharOperator()) {
      this.states[this.activeBase].input =
        this.states[this.activeBase].input.slice(0, -3) + ` ${op} `;
    }
  }

  handleNumber(num) {
    this.error = "";

    const currentInput = this.states[this.activeBase].input;

    // Handle special cases where input is '0' or 'Error'
    if (currentInput === "0" || currentInput === "Error") {
      this.states[this.activeBase].input = num;
      return;
    }

    // Handle multiple decimal points in the same number
    if (num === ".") {
      const parts = currentInput.split(/[+-×÷]+/); // Split around operators
      const lastPart = parts[parts.length - 1];

      if (lastPart.includes(".")) {
        // Prevent multiple decimal points in the same number
        return;
      }

      if (currentInput === "0") {
        this.states[this.activeBase].input = "0."; // Start a decimal number
        return;
      }
    }

    // Handle the case where the last character is a closing parenthesis
    if (this.isLastCharClosingParenthesis()) {
      this.states[this.activeBase].input += ` × ${num}`;
      return;
    }

    // Handle leading zeros after operators
    if (/[+-×÷]/.test(currentInput.trim().slice(-1)) && num === "0") {
      return; // Prevent leading zeros after operators
    }

    // Default case: append the number to the current input
    this.states[this.activeBase].input += num;
  }

  handleEquals() {
    try {
      let expression = this.states[this.activeBase].input;

      // Add missing closing parentheses
      while (this.parenthesesCount > 0) {
        expression += " )";
        this.parenthesesCount--;
      }

      this.currentExpression = expression;
      const result = this.evaluateExpression(expression);

      if (result === null) throw new Error("Invalid expression");

      this.states[this.activeBase].input = this.formatResult(result);

      return {
        expression: this.currentExpression,
        result: this.states[this.activeBase].input,
      };
    } catch (err) {
      this.error = err.message;
      this.states[this.activeBase].input = "Error";
      return {
        expression: this.currentExpression,
        result: "Error",
      };
    }
  }

  handleClear() {
    this.states[this.activeBase].input = "0";
    this.parenthesesCount = 0;
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
      this.states[this.activeBase].input !== "0" &&
      this.states[this.activeBase].input !== "Error"
    ) {
      if (this.states[this.activeBase].input.length === 1) {
        this.states[this.activeBase].input = "0";
      } else {
        this.states[this.activeBase].input = this.states[
          this.activeBase
        ].input.slice(0, -1);
      }
    }
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
