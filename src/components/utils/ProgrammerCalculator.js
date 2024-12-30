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

      if (base !== "DEC") {
        const parts = sanitizedExpr.split(/([+\-*/])/);
        sanitizedExpr = parts
          .map((part) => {
            if (
              !["+", "-", "*", "/", "(", ")", "<<", ">>"].includes(part) &&
              part.trim() !== ""
            ) {
              return parseInt(part, this.getBaseInt(base)).toString(10);
            }
            return part;
          })
          .join("");
      }

      // Handle shift operations
      sanitizedExpr = sanitizedExpr.replace(
        /(\d+)\s*<<\s*(\d+)/g,
        (_, a, b) => {
          return (bignumber(a) << bignumber(b)).toString();
        }
      );
      sanitizedExpr = sanitizedExpr.replace(
        /(\d+)\s*>>\s*(\d+)/g,
        (_, a, b) => {
          return (bignumber(a) >> bignumber(b)).toString();
        }
      );

      if (sanitizedExpr === "") return bignumber(0);

      const result = evaluate(sanitizedExpr);
      return bignumber(result);
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
    const intValue = parseInt(result.toString());
    let formattedResult;
    if (base === "BIN") {
      formattedResult = intValue.toString(2);
    } else {
      formattedResult = this.calculators[base].formatResult(intValue);
    }

    if (this.settings.useThousandsSeparator) {
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
    const currentInput = this.states[this.activeBase].input;
    if (
      parenthesis === "(" &&
      (currentInput === "0" || this.isLastCharOperator())
    ) {
      this.states[this.activeBase].input =
        currentInput === "0" ? "(" : currentInput + "(";
    } else if (parenthesis === "(" && this.isLastCharNumber()) {
      this.states[this.activeBase].input += " × (";
    } else {
      this.states[this.activeBase].input += parenthesis;
    }
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
    if (
      this.states[this.activeBase].input === "0" ||
      this.states[this.activeBase].input === "Error"
    ) {
      this.states[this.activeBase].input = num;
    } else if (this.isLastCharClosingParenthesis()) {
      this.states[this.activeBase].input += ` × ${num}`;
    } else {
      this.states[this.activeBase].input += num;
    }
  }

  handleEquals() {
    this.error = "";
    try {
      this.currentExpression = this.states[this.activeBase].input;
      const result = this.evaluateExpression(this.currentExpression);
      this.states[this.activeBase].input = this.formatResult(result);
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
    return /[+\-×÷<<>>]\s*$/.test(this.states[this.activeBase].input);
  }

  isLastCharNumber() {
    return /[0-9A-Fa-f]$/.test(this.states[this.activeBase].input);
  }

  isLastCharClosingParenthesis() {
    return this.states[this.activeBase].input.trim().endsWith(")");
  }
}
