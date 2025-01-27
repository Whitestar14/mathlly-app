import { evaluate, format, fraction } from "mathjs";
import { EngineCalculator } from "./EngineCalculator";
import { DisplayFormatter } from "@/services/DisplayFormatter"
export class StandardCalculator extends EngineCalculator {
  constructor(settings) {
    super(settings);
    // Increase MAX_INPUT_LENGTH for Standard mode
    this.MAX_INPUT_LENGTH = 100; // More generous limit for standard calculations
    this.isExponentMode = false;
    this.hasExponent = false;
  }

  sanitizeInput(expr) {
    // Allow e/E for scientific notation along with other characters
    const allowedChars = /[^0-9+\-×÷.()%e/]/g;
    return expr.replace(allowedChars, "").slice(0, this.MAX_INPUT_LENGTH);
  }

  evaluateExpression(expr) {
    try {
      let sanitizedExpr = this.sanitizeInput(expr)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[+\-*/]\s*$/, "")  // Remove trailing operators
        .replace(/\s+/g, " ")
        // Properly handle scientific notation
        .replace(/([0-9])([e])([-+]?)([0-9]+)/g, '$1 * 10^($3$4)')
        .trim();

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
  
    try {
      if (this.settings.useFractions) {
        let frac;
        if (typeof result === 'number') {
          frac = fraction(result);
        } else if (typeof result === 'string') {
          frac = fraction(result, { tolerance: 1e-12 });
        } else if (result && result.isBigNumber) {
          frac = fraction(result.toString(), { tolerance: 1e-12 });
        } else {
          throw new Error("Unexpected result type for fraction conversion");
        }
  
        if (frac.d <= 10000) {
          return frac.d === 1 ? `${frac.n}` : `${frac.n}/${frac.d}`;
        }
      }
  
      // Increase precision for larger numbers
      const precision = Math.abs(result) > 1e10 ? 
        Math.min(this.settings.precision + 4, 12) : 
        this.settings.precision;
  
      // Format the number with dynamic precision
      let formattedResult = format(result, {
        precision: precision,
        notation: Math.abs(result) >= 1e21 || (Math.abs(result) < 1e-7 && result !== 0) 
          ? 'exponential' 
          : 'fixed'
      });
  
      // Use DisplayFormatter for thousands separator
      return DisplayFormatter.formatStandard(
        formattedResult,
        this.settings.useThousandsSeparator
      );
    } catch (err) {
      console.error("Formatting error:", err);
      return result.toString();
    }
  }
  

  handleButtonClick(btn) {
    if (this.input === "Error") {
      this.handleClear();
    }

    if (this.input.length >= this.MAX_INPUT_LENGTH && 
        !["=", "AC", "backspace", "MC", "MR", "M+", "M-", "MS"].includes(btn)) {
      this.error = "Maximum input length reached";
      setTimeout(() => { this.error = ""; }, 1000);
      return { input: this.input, error: this.error };
    }
try {
    switch (btn) {
      case "MC": return this.handleMemoryClear();
      case "MR": return this.handleMemoryRecall();
      case "M+": return this.handleMemoryAdd();
      case "M-": return this.handleMemorySubtract();
      case "MS": return this.handleMemoryStore();
      case "1/x": return this.handleReciprocal();
      case "x²": return this.handleSquare();
      case "√": return this.handleSquareRoot();
      case "EXP": return this.handleExponent();
      case "=": return this.handleEquals();
      case "%": return this.handlePercentage();
      case "±": return this.handleToggleSign();
      case "AC":
      case "C": return this.handleClear();
      case "CE": return this.handleClearEntry();
      case "backspace": return this.handleBackspace();
      case "+":
      case "-":
      case "×":
      case "÷": return this.handleOperator(btn);
      default: return this.handleNumber(btn);
    }
  } catch (err) {
    this.error = err.message;
    this.input = "Error";
  }
  }

  handleExponent() {
    if (!this.isLastCharOperator() && !this.hasExponent) {
      this.input += "e";
      this.hasExponent = true;
      this.isExponentMode = true;
    }
    return { input: this.input, error: this.error };
  }

  handleOperator(op) {
    this.error = "";
    const lastChar = this.input.trim().slice(-1);
    const isLastCharOperator = this.isLastCharOperator();
  
    if (this.input === this.currentExpression?.result) {
      this.currentExpression = "";
    }
  
    if (op === "-" && isLastCharOperator && ["×", "÷", "+"].includes(lastChar)) {
      this.input += ` ${op} `;
      return { input: this.input, error: this.error };
    }
  
    if (!isLastCharOperator) {
      this.input += ` ${op} `;
    } else {
      this.input = this.input.slice(0, -3) + ` ${op} `;
    }
    return { input: this.input, error: this.error };
  }
  
  handleClear() {
    this.input = "0";
    this.error = "";
    return { input: this.input, error: this.error };
  }
  
  handleClearEntry() {
    if (this.input !== "0" && this.input !== "Error") {
      const parts = this.input.split(" ");
      parts.pop();
      this.input = parts.join(" ") || "0";
    } else {
      this.handleClear();
    }
    return { input: this.input, error: this.error };
  }
  
  handleToggleSign() {
    if (this.input !== "0") {
      if (this.input.startsWith("-")) {
        this.input = this.input.slice(1);
      } else {
        this.input = "-" + this.input;
      }
    }
    return { input: this.input, error: this.error };
  }
  

handleNumber(num) {
    if (this.input === "0" && num !== ".") {
      this.input = num;
      this.hasExponent = false;
      this.isExponentMode = false;
      return { input: this.input, error: this.error };
    }

    if (num === ".") {
      if (this.isExponentMode) return { input: this.input, error: this.error };
      const parts = this.input.split(/[+-×÷]+/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes(".")) return { input: this.input, error: this.error };
      if (this.input === "0") {
        this.input = "0.";
        return { input: this.input, error: this.error };
      }
    }

    if ((num === "+" || num === "-") && this.isExponentMode) {
      const lastChar = this.input.slice(-1);
      if (lastChar === "e") {
        this.input += num;
        return { input: this.input, error: this.error };
      }
    }

    this.input += num;
    return { input: this.input, error: this.error };
  }

  handleEquals() {
    try {
      this.hasExponent = false;
      this.isExponentMode = false;

      this.currentExpression = this.input;
      const result = this.evaluateExpression(this.currentExpression);
      this.input = this.formatResult(result);

      return {
        expression: this.currentExpression,
        result: this.input,
        input: this.input,
        error: this.error,
      };
    } catch (err) {
      this.input = "Error";
      this.error = err.message;
      return {
        expression: this.currentExpression,
        input: "Error",
        error: this.error
      };
    }
  }

  // Add these methods to StandardCalculator class
handleSquare() {
  try {
    const value = this.evaluateExpression(this.input);
    this.input = this.formatResult(Math.pow(value, 2));
    return { input: this.input, error: this.error };
  } catch (err) {
    this.input = "Error";
    this.error = err.message;
    return { input: this.input, error: this.error };
  }
}

handleSquareRoot() {
  try {
    const value = this.evaluateExpression(this.input);
    if (value < 0) {
      throw new Error("Cannot calculate square root of negative number");
    }
    this.input = this.formatResult(Math.sqrt(value));
    return { input: this.input, error: this.error };
  } catch (err) {
    this.input = "Error";
    this.error = err.message;
    return { input: this.input, error: this.error };
  }
}

handleReciprocal() {
  try {
    const value = this.evaluateExpression(this.input);
    if (value === 0) {
      throw new Error("Cannot divide by zero");
    }
    this.input = this.formatResult(1 / value);
    return { input: this.input, error: this.error };
  } catch (err) {
    this.input = "Error";
    this.error = err.message;
    return { input: this.input, error: this.error };
  }
}

handlePercentage() {
  try {
    const value = this.evaluateExpression(this.input);
    this.input = this.formatResult(value / 100);
    return { input: this.input, error: this.error };
  } catch (err) {
    this.input = "Error";
    this.error = err.message;
    return { input: this.input, error: this.error };
  }
}


  handleBackspace() {
    if (this.input !== "0" && this.input !== "Error") {
      // Check for operator + space + single digit pattern
      const operatorPattern = /(.*?)(\s*[+\-×÷]\s*)(\d)$/;
      const match = this.input.match(operatorPattern);
      
      if (match) {
        // If found, remove the last digit and trailing space
        this.input = match[1];
      } else if (this.input.length === 1) {
        this.input = "0";
      } else {
        this.input = this.input.slice(0, -1);
      }
    }
    return { input: this.input, error: this.error };
  }

  isLastCharOperator() {
    return ["+", "-", "×", "÷"].includes(this.input.trim().slice(-1));
  }
}
