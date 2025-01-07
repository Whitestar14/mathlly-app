import { evaluate, format, fraction } from "mathjs";

export class BasicCalculator {
  constructor(settings) {
    this.input = "0";
    this.error = "";
    this.settings = settings;
    this.currentExpression = "";
    this.MAX_INPUT_LENGTH = 30;
  }

  sanitizeInput(expr) {
    const allowedChars = /[^0-9+\-×÷.]/g;
    return expr.replace(allowedChars, "").slice(0, this.MAX_INPUT_LENGTH);
  }

  evaluateExpression(expr) {
    try {
      let sanitizedExpr = this.sanitizeInput(expr)
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

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

    const precision = 5;
    const useFractions = this.settings.useFractions;
    const useThousandsSeparator = this.settings.useThousandsSeparator;

    if (useFractions) {
      const frac = fraction(result);
      return frac.d === 1 ? `${frac.n}` : `${frac.n}/${frac.d}`;
    } else {
      let formattedResult = format(result, { precision: precision });
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
    }
  }

  handleButtonClick(btn) {
    if (this.input === "Error") {
      this.handleClear();
    }

    if (
      this.input.length >= this.MAX_INPUT_LENGTH &&
      btn !== "=" &&
      btn !== "AC" &&
      btn !== "backspace"
    ) {
      this.error = "Maximum input length reached";
      setTimeout(() => {
        this.error = "";
      }, 1000);
      return { input: this.input, error: this.error };
    }
    try {
      switch (btn) {
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
        case "±":
          this.handleToggleSign();
          break;
        case "=":
          return this.handleEquals();
        default:
          this.handleNumber(btn);
      }
    } catch (err) {
      this.error = err.message;
      this.input = "Error";
    }

    return {
      input: this.input,
      error: this.error,
      expression: this.currentExpression,
    };
  }

  handleOperator(op) {
    this.error = "";
    const lastChar = this.input.trim().slice(-1);
    const isLastCharOperator = this.isLastCharOperator();

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
    this.currentExpression = this.input;
  }

  handleNumber(num) {
    this.error = "";

    // Handle special case when the input is '0'
    if (this.input === '0' && num !== '.') {
        this.input = num; // Replace leading zero with the number
        return;
    }

    // Handle multiple decimal points in a number
    if (num === '.') {
        // Split the input into parts around operators
        const parts = this.input.split(/[+-×÷]+/); // Split around operators (+, -, ×, ÷)
        const lastPart = parts[parts.length - 1];

        if (lastPart.includes('.')) {
            // Prevent multiple decimal points in the same number
            return;
        }

        if (this.input === '0') {
            this.input = '0.'; // Start a decimal number
            return;
        }
    }

    // Append the number if it's valid
    this.input += num;
}

  handleEquals() {
    this.error = "";
    try {
      // Store the current expression before evaluation
      this.currentExpression = this.input;
      const result = this.evaluateExpression(this.currentExpression);
      this.input = this.formatResult(result);

      return {
        expression: this.currentExpression,
        result: this.input,
        input: this.input,
      };
    } catch (err) {
      this.input = "Error";
      this.error = err.message;
      return {
        expression: this.currentExpression,
        input: "Error",
        error: this.error,
      };
    }
  }

  handleClear() {
    this.input = "0";
    this.error = "";
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

  isLastCharOperator() {
    return ["+", "-", "×", "÷"].includes(this.input.trim().slice(-1));
  }
}
