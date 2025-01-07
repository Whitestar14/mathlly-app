import { evaluate, format, fraction } from "mathjs";

export class StandardCalculator {
  constructor(settings) {
    this.MAX_INPUT_LENGTH = 50;
    this.input = "0";
    this.error = "";
    this.settings = settings;
    this.currentExpression = "";
    this.memoryValue = 0;
    this.isExponentMode = false;
    this.hasExponent = false;
  }

  sanitizeInput(expr) {
    // Allow e/E for scientific notation along with other characters
    const allowedChars = /[^0-9+\-×÷.()%eE]/g;
    return expr.replace(allowedChars, "").slice(0, this.MAX_INPUT_LENGTH);
  }

  evaluateExpression(expr) {
    try {
      let sanitizedExpr = this.sanitizeInput(expr)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        // Properly handle scientific notation
        .replace(/([0-9])([eE])([-+]?)([0-9]+)/g, '$1 * 10^($3$4)');

      if (sanitizedExpr.includes("/0")) {
        throw new Error("Division by zero is not allowed");
      }

      const result = evaluate(sanitizedExpr);

      if (typeof result !== "number" && !result.isBigNumber) {
        throw new Error("Invalid result");
      }

      return result;
    } catch (err) {
      throw new Error("Invalid expression: " + err.message);
    }
  }

  formatResult(result) {
    if (result === undefined) return "";

    const precision = this.settings.precision;
    const useFractions = this.settings.useFractions;
    const useThousandsSeparator = this.settings.useThousandsSeparator;

    try {
      if (useFractions) {
        // Convert to fraction with a reasonable tolerance
        const frac = fraction(result, { tolerance: 1e-12 });
        
        // Only show as fraction if denominator is reasonable
        if (frac.d <= 10000) {
          return frac.d === 1 ? `${frac.n}` : `${frac.n}/${frac.d}`;
        }
      }

      // Handle very large or small numbers
      if (Math.abs(result) >= 1e21 || (Math.abs(result) < 1e-7 && result !== 0)) {
        return result.toExponential(precision);
      }

      // Format regular numbers
      let formattedResult = format(result, { 
        precision: precision,
        notation: 'fixed'
      });

      // Apply thousands separator if needed
      if (useThousandsSeparator) {
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
    } catch (err) {
      console.error("Formatting error:", err);
      return result.toString();
    }
  }

  handleButtonClick(btn) {
    if (this.input === "Error") {
      this.handleClear();
    }

    if (
      this.input.length >= this.MAX_INPUT_LENGTH &&
      !["=", "AC", "backspace", "MC", "MR", "M+", "M-", "MS"].includes(btn)
    ) {
      this.error = "Maximum input length reached";
      setTimeout(() => {
        this.error = "";
      }, 1000);
      return { input: this.input, error: this.error };
    }

    switch (btn) {
      // Memory operations
      case "MC":
        this.handleMemoryClear();
        break;
      case "MR":
        this.handleMemoryRecall();
        break;
      case "M+":
        this.handleMemoryAdd();
        break;
      case "M-":
        this.handleMemorySubtract();
        break;
      case "MS":
        this.handleMemoryStore();
        break;
      // Function operations
      case "1/x":
        this.handleReciprocal();
        break;
      case "x²":
        this.handleSquare();
        break;
      case "√":
        this.handleSquareRoot();
        break;
        case "EXP":
        this.handleExponent();
        break;
      case "=":
        return this.handleEquals();
      case "%":
        this.handlePercentage();
        break;
      case "±":
        this.handleToggleSign();
        break;
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
        this.handleOperator(btn);
        break;
      default:
        this.handleNumber(btn);
    }

    return {
      input: this.input,
      error: this.error,
      expression: this.currentExpression,
    };
  }

  handleExponent() {
    if (!this.isLastCharOperator() && !this.hasExponent) {
      this.input += "e";
      this.hasExponent = true;
      this.isExponentMode = true;
    }
  }


  handleOperator(op) {
    this.error = "";
    const lastChar = this.input.trim().slice(-1);
    const isLastCharOperator = this.isLastCharOperator();

    // If the input is a result, allow using it in a new expression
    if (this.input === this.currentExpression?.result) {
      this.currentExpression = "";
    }

    // Allow negative numbers after arithmetic operators
    if (
      op === "-" &&
      isLastCharOperator &&
      ["×", "÷", "+"].includes(lastChar)
    ) {
      this.input += ` ${op} `;
      return;
    }

    if (!isLastCharOperator) {
      this.input += ` ${op} `;
    } else {
      this.input = this.input.slice(0, -3) + ` ${op} `;
    }
  }
  handleNumber(num) {
    this.error = "";

    // Reset flags if starting new input
    if (this.input === "0" && num !== ".") {
      this.input = num;
      this.hasExponent = false;
      this.isExponentMode = false;
      return;
    }

    // Handle decimal point
    if (num === ".") {
      if (this.isExponentMode) return; // No decimals in exponent
      const parts = this.input.split(/[\+\-\×\÷]+/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes(".")) return;
      if (this.input === "0") {
        this.input = "0.";
        return;
      }
    }

    // Handle exponent sign
    if ((num === "+" || num === "-") && this.isExponentMode) {
      const lastChar = this.input.slice(-1);
      if (lastChar === "e") {
        this.input += num;
        return;
      }
    }

    // Append the number
    this.input += num;
  }

  handleEquals() {
    this.error = "";
    try {
      // Reset exponent flags
      this.hasExponent = false;
      this.isExponentMode = false;

      this.currentExpression = {
        expression: this.input,
        result: this.formatResult(this.evaluateExpression(this.input)),
      };

      this.input = this.currentExpression.result;

      return {
        expression: this.currentExpression.expression,
        result: this.input,
        input: this.input,
      };
    } catch (err) {
      this.input = "Error";
      this.error = err.message;
      return {
        expression: this.currentExpression?.expression || "",
        input: "Error",
      };
    }
  }

  // Memory Operations - This is a temporary solution, a hotfix if you please, to implementing a fixer upper version of memory functions
  handleMemoryClear() {
    this.memoryValue = 0;
  }

  handleMemoryRecall() {
    if (this.memoryValue !== null) {
      this.input = this.formatResult(this.memoryValue);
    }
  }

  handleMemoryAdd() {
    try {
      const currentValue = this.evaluateExpression(this.input);
      this.memoryValue += currentValue;
    } catch (err) {
      this.error = "Cannot add to memory: " + err.message;
    }
  }

  handleMemorySubtract() {
    try {
      const currentValue = this.evaluateExpression(this.input);
      this.memoryValue -= currentValue;
    } catch (err) {
      this.error = "Cannot subtract from memory: " + err.message;
    }
  }

  handleMemoryStore() {
    try {
      this.memoryValue = this.evaluateExpression(this.input);
    } catch (err) {
      this.error = "Cannot store in memory: " + err.message;
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
    } catch (err) {
      this.input = "Error";
      this.error = err.message;
    }
  }

  handleReciprocal() {
    this.handleUnaryOperation((value) => `1/${value}`);
  }

  handleSquare() {
    this.handleUnaryOperation((value) => `${value}^2`);
  }

  handleSquareRoot() {
    this.handleUnaryOperation((value) => `sqrt(${value})`);
  }

  handleClear() {
    this.input = "0";
    this.error = "";
  }

  handleClearEntry() {
    if (this.input !== "0" && this.input !== "Error") {
      const parts = this.input.split(" ");
      parts.pop();
      this.input = parts.join(" ") || "0";
    } else {
      this.handleClear();
    }
  }

  handleBackspace() {
    if (this.input !== "0" && this.input !== "Error") {
      if (this.input.length === 1) {
        this.input = "0";
      } else {
        this.input = this.input.slice(0, -1);
      }
    }
  }

  handlePercentage() {
    this.error = "";
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
  }

  handleToggleSign() {
    if (this.input !== "0") {
      if (this.input.startsWith("-")) {
        this.input = this.input.slice(1);
      } else {
        this.input = "-" + this.input;
      }
    }
  }

  isLastCharOperator() {
    return ["+", "-", "×", "÷"].includes(this.input.trim().slice(-1));
  }
}
