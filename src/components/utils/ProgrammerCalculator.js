import { evaluate } from "mathjs";
import {
  BinCalculator,
  DecCalculator,
  HexCalculator,
  OctCalculator,
} from "./BaseCalculator";

// ProgrammerCalculator.js

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
  }

  get activeCalculator() {
    return this.calculators[this.activeBase];
  }

  evaluateExpression(expr, base = this.activeBase) {
    try {
      let sanitizedExpr = this.calculators[base]
        .sanitizeInput(expr)
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

      sanitizedExpr = sanitizedExpr.replace(/[+\-*/]\s*$/, "");

      if (base === "BIN") {
        const parts = sanitizedExpr.split(/([+\-*/])/);
        sanitizedExpr = parts
          .map((part) => {
            if (!["+", "-", "*", "/"].includes(part) && part !== "") {
              return parseInt(part, 2).toString(10);
            }
            return part;
          })
          .join("");
      } else if (base !== "DEC") {
        const parts = sanitizedExpr.split(/([+\-*/])/);
        sanitizedExpr = parts
          .map((part) => {
            if (!["+", "-", "*", "/"].includes(part) && part !== "") {
              return parseInt(part, this.getBaseInt(base)).toString(10);
            }
            return part;
          })
          .join("");
      }

      if (sanitizedExpr === "") return 0;

      const result = evaluate(sanitizedExpr);
      return base === "BIN" ? Math.floor(result) : result;
    } catch (err) {
      console.error("Error in evaluateExpression:", err);
      return null;
    }
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
    if (base === "BIN") {
      return Math.floor(result).toString(2);
    }
    return this.calculators[base].formatResult(result);
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
      btn !== "backspace"
    ) {
      this.error = "Maximum input length reached";
      setTimeout(() => {
        this.error = "";
      }, 1000);
      return { input: this.states[this.activeBase].input, error: this.error };
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
        // Add bitwise operations
        case "AND":
        case "OR":
        case "XOR":
        case "NOT":
        case "<<":
        case ">>":
          this.handleBitwiseOperation(btn);
          break;
        case "=":
          return this.handleEquals();
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
      expression: this.currentExpression
    };
  
  }

  handleBitwiseOperation(op) {
    const currentValue = this.evaluateExpression(
      this.states[this.activeBase].input,
      this.activeBase
    );
    if (currentValue === null) return;

    let result;
    switch (op) {
      case "AND":
        this.states[this.activeBase].input += " & ";
        break;
      case "OR":
        this.states[this.activeBase].input += " | ";
        break;
      case "XOR":
        this.states[this.activeBase].input += " ^ ";
        break;
      case "NOT":
        result = ~currentValue;
        this.states[this.activeBase].input = this.formatResult(
          result,
          this.activeBase
        );
        break;
      case "<<":
        this.states[this.activeBase].input += " << ";
        break;
      case ">>":
        this.states[this.activeBase].input += " >> ";
        break;
    }
  }

  handleOperator(op) {
    this.error = "";
    if (!this.isLastCharOperator()) {
      this.states[this.activeBase].input += ` ${op} `;
    } else {
      this.states[this.activeBase].input =
        this.states[this.activeBase].input.slice(0, -3) + ` ${op} `;
    }
  }

  handleNumber(num) {
    this.error = "";
    if (
      this.states[this.activeBase].input === "Error" ||
      this.states[this.activeBase].input === "0"
    ) {
      this.states[this.activeBase].input = num;
    } else {
      this.states[this.activeBase].input += num;
    }
  }

  handleEquals() {
    this.error = "";
    try {
      // Store the current expression before evaluation
      this.currentExpression = this.states[this.activeBase].input;
      const result = this.evaluateExpression(this.currentExpression);
      this.states[this.activeBase].input = this.formatResult(result);
      // Return both the expression and the result
      return {
        expression: this.currentExpression,
        result: this.states[this.activeBase].input,
      };
    } catch (err) {
      this.states[this.activeBase].input = "Error";
      this.error = err.message;
      return {
        expression: this.currentExpression,
        result: "Error",
      };
    }
  }

  handleClear() {
    this.states[this.activeBase].input = "0";
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
    return ["+", "-", "×", "÷"].includes(
      this.states[this.activeBase].input.trim().slice(-1)
    );
  }
}
