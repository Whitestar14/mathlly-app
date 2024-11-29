import { evaluate } from "mathjs";
import { DecCalculator, BinCalculator } from "./BaseCalculator";

export class ProgrammerCalculator {
  constructor(settings) {
    this.activeBase = "DEC";
    this.input = "0";
    this.error = "";
    this.settings = settings;
    this.calculators = {
      DEC: new DecCalculator(),
      BIN: new BinCalculator(),
    };
  }

  get activeCalculator() {
    return this.calculators[this.activeBase];
  }

  evaluateExpression(expr) {
    try {
      let sanitizedExpr = this.activeCalculator
        .sanitizeInput(expr)
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

      // Remove trailing operators
      sanitizedExpr = sanitizedExpr.replace(/[+\-*/]\s*$/, "");

      if (this.activeBase === "BIN") {
        const parts = sanitizedExpr.split(/([+\-*/])/);
        sanitizedExpr = parts
          .map((part) => {
            if (!["+", "-", "*", "/"].includes(part) && part !== "") {
              return parseInt(part, 2).toString(10);
            }
            return part;
          })
          .join("");
      }

      if (sanitizedExpr === "") return 0;

      const result = evaluate(sanitizedExpr);
      return this.activeBase === "BIN" ? Math.floor(result) : result;
    } catch (err) {
      console.error("Error in evaluateExpression:", err);
      return null;
    }
  }

  formatResult(result) {
    if (result === null) return "";
    return this.activeCalculator.formatResult(result);
  }

  handleBaseChange(newBase) {
    try {
      const decValue = this.evaluateExpression(this.input);
      this.activeBase = newBase;
      this.input = decValue !== null ? this.formatResult(decValue) : "0";
      return { input: this.input, error: this.error };
    } catch (err) {
      console.error("Error changing base:", err);
      this.error = "Invalid input for base conversion";
      return { input: this.input, error: this.error };
    }
  }

  updateDisplayValue(value) {
    const decValue = this.evaluateExpression(value);
    return {
      dec: this.calculators.DEC.formatResult(decValue),
      bin: this.calculators.BIN.formatResult(decValue),
    };
  }

  handleButtonClick(btn) {
    if (this.input === "Error") {
      this.handleClear();
    }

    if (
      this.input.length >= this.activeCalculator.maxInputLength &&
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
        case "=":
          this.handleEquals();
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
    } catch (err) {
      this.error = err.message;
      this.input = "Error";
    }

    return { input: this.input, error: this.error };
  }

  handleOperator(op) {
    this.error = "";
    if (!this.isLastCharOperator()) {
      this.input += ` ${op} `;
    } else {
      this.input = this.input.slice(0, -3) + ` ${op} `;
    }
  }

  handleNumber(num) {
    this.error = "";
    if (this.input === "Error" || this.input === "0") {
      this.input = num;
    } else {
      this.input += num;
    }
  }

  handleEquals() {
    this.error = "";
    try {
      const result = this.evaluateExpression(this.input);
      this.input = this.formatResult(result);
    } catch (err) {
      this.input = "Error";
      this.error = err.message;
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

  isLastCharOperator() {
    return ["+", "-", "×", "÷"].includes(this.input.trim().slice(-1));
  }
}
