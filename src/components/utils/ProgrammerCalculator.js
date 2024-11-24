import { bignumber, format, evaluate } from "mathjs";

export class ProgrammerCalculator {
  constructor(settings) {
    this.MAX_INPUT_LENGTH = 29;
    this.activeBase = "DEC";
    this.input = "0";
    this.error = "";
    this.settings = settings;
  }

  sanitizeInput(expr) {
    const allowedChars = {
      HEX: /[^0-9A-Fa-f+\-×÷]/g,
      DEC: /[^0-9+\-×÷]/g,
      OCT: /[^0-7+\-×÷]/g,
      BIN: /[^01+\-×÷]/g,
    };

    const sanitized = expr.replace(allowedChars[this.activeBase], "");
    return sanitized.replace(/^[+×÷]/, "").slice(0, this.MAX_INPUT_LENGTH);
  }

  evaluateExpression(expr) {
    try {
      let sanitizedExpr = this.sanitizeInput(expr)
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

      // Convert the expression to decimal if not already in decimal
      if (this.activeBase !== "DEC") {
        const parts = sanitizedExpr.split(/([+\-*/])/);
        sanitizedExpr = parts
          .map((part) => {
            if (!["+", "-", "*", "/"].includes(part)) {
              return bignumber(part, this.activeBase.toLowerCase()).toString();
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

      // Ensure the result is an integer for Programmer mode
      return Math.floor(result);
    } catch (err) {
      throw new Error("Invalid expression: " + err.message);
    }
  }

  formatResult(result) {
    if (result === undefined) return "";
    // Format the result based on the active base
    switch (this.activeBase) {
      case "HEX":
        return format(result, { notation: "hex" })
          .toUpperCase()
          .replace(/^0X/, "");
      case "DEC":
        return format(result, { notation: "fixed", precision: 0 });
      case "OCT":
        return format(result, { notation: "oct" }).replace(/^0O/, "");
      case "BIN":
        return this.formatBinary(
          format(result, { notation: "bin" }).replace(/^0B/, "")
        );
      default:
        return format(result, { notation: "fixed", precision: 0 });
    }
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

  formatBinary(binString) {
    binString = binString.replace(/\s/g, "").replace(/^0+/, "");
    if (binString === "") return "0";
    const padding = 4 - (binString.length % 4);
    if (padding < 4) {
      binString = "0".repeat(padding) + binString;
    }
    return binString.match(/.{1,4}/g).join(" ");
  }

  updateDisplayValue(value) {
    try {
      const decValue = this.evaluateExpression(value);
      return {
        hex: format(decValue, { notation: "hex" })
          .toUpperCase()
          .replace(/^0X/, ""),
        dec: format(decValue, { notation: "fixed", precision: 0 }),
        oct: format(decValue, { notation: "oct" }).replace(/^0O/, ""),
        bin: this.formatBinary(
          format(decValue, { notation: "bin" }).replace(/^0B/, "")
        ),
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

export default function Component() {
  return <div>ProgrammerCalculator.js</div>;
}
