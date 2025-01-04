import { evaluate, format, fraction } from "mathjs";

export class StandardCalculator {
  constructor(settings) {
    this.MAX_INPUT_LENGTH = 50;
    this.input = "0";
    this.error = "";
    this.settings = settings;
    this.currentExpression = "";
  }

  sanitizeInput(expr) {
    const allowedChars = /[^0-9+\-×÷.()%]/g;
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

    const precision = this.settings.precision;
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

    switch (btn) {
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

  handleOperator(op) {
    this.error = "";
    const lastChar = this.input.trim().slice(-1);
    const isLastCharOperator = this.isLastCharOperator();

    // If the input is a result, allow using it in a new expression
    if (this.input === this.currentExpression?.result) {
      this.currentExpression = "";
    }

    // Allow negative numbers after arithmetic operators
    if (op === "-" && isLastCharOperator && ["×", "÷", "+"].includes(lastChar)) {
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
    
    // If the input is a result from history or calculation
    if (this.input === this.currentExpression?.result) {
      // Start a new expression
      this.input = num;
      this.currentExpression = "";
    } else if (this.input === "Error" || this.input === "0") {
      this.input = num;
    } else {
      // Continue building the expression
      this.input += num;
    }
  }

  handleEquals() {
    this.error = "";
    try {
      this.currentExpression = {
        expression: this.input,
        result: this.formatResult(this.evaluateExpression(this.input))
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
