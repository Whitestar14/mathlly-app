import { evaluate } from "mathjs";
import {
  HexCalculator,
  DecCalculator,
  OctCalculator,
  BinCalculator,
} from "./BaseCalculators";
import { BaseConverter } from "./BaseConverter";

export class ProgrammerCalculator {
  constructor(settings) {
    this.activeBase = "DEC";
    this.input = "0";
    this.error = "";
    this.settings = settings;
    this.calculators = {
      HEX: new HexCalculator(),
      DEC: new DecCalculator(),
      OCT: new OctCalculator(),
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

      if (this.activeBase !== "DEC") {
        const parts = sanitizedExpr.split(/([+\-*/])/);
        sanitizedExpr = parts
          .map((part) => {
            if (!["+", "-", "*", "/"].includes(part) && part !== "") {
              return BaseConverter.convertBase(
                part,
                this.activeBase.toLowerCase(),
                10
              );
            }
            return part;
          })
          .join("");
      }

      if (sanitizedExpr.includes("/0")) {
        throw new Error("Division by zero is not allowed");
      }

      const result = evaluate(sanitizedExpr);

      if (typeof result !== "number" && !result.isBigNumber) {
        throw new Error("Invalid result");
      }

      return Math.floor(Number(result));
    } catch (err) {
      console.error("Error in evaluateExpression:", err);
      throw new Error("Invalid expression: " + err.message);
    }
  }

  formatResult(result) {
    return this.activeCalculator.formatResult(result);
  }

  handleBaseChange(newBase) {
    try {
      const decValue = this.evaluateExpression(this.input);
      this.activeBase = newBase;
      this.input = this.formatResult(decValue);
      return { input: this.input, error: this.error };
    } catch (err) {
      console.error("Error changing base:", err);
      this.error = "Invalid input for base conversion";
      return { input: this.input, error: this.error };
    }
  }

  updateDisplayValue(value) {
    try {
      const decValue = this.evaluateExpression(value);
      return {
        hex: this.calculators.HEX.formatResult(decValue),
        dec: this.calculators.DEC.formatResult(decValue),
        oct: this.calculators.OCT.formatResult(decValue),
        bin: this.calculators.BIN.formatResult(decValue),
      };
    } catch (err) {
      console.error("Error updating display value:", err);
      return { hex: "0", dec: "0", oct: "0", bin: "0" };
    }
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
