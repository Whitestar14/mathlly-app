export class StandardOperations {
  constructor(calculator) {
    this.calculator = calculator;
  }

  handleNumber(num) {
    if (this.calculator.input === "0" && num !== ".") {
      this.calculator.input = num;
      return { input: this.calculator.input, error: "" };
    }

    if (!this.validateNumberInput(num)) {
      return { input: this.calculator.input, error: "" };
    }

    this.calculator.input += num;
    return { input: this.calculator.input, error: "" };
  }

  handleOperator(op) {
    const lastChar = this.calculator.input.trim().slice(-1);
    const isLastCharOperator = ["+", "-", "×", "÷"].includes(lastChar);

    if (
      op === "-" &&
      isLastCharOperator &&
      ["×", "÷", "+"].includes(lastChar)
    ) {
      this.calculator.input += ` ${op} `;
      return { input: this.calculator.input, error: "" };
    }

    this.calculator.input = isLastCharOperator
      ? this.calculator.input.slice(0, -3) + ` ${op} `
      : this.calculator.input + ` ${op} `;

    return { input: this.calculator.input, error: "" };
  }

  handleBackspace() {
    if (
      this.calculator.input === "0" ||
      this.calculator.input === "Error" ||
      this.calculator.input === "Overflow"
    ) {
      return { input: this.calculator.input, error: "" };
    }

    const operatorMatch = this.calculator.input.match(
      /(.*?)(\s*[+\-×÷]\s*)(\d)$/
    );
    this.calculator.input = operatorMatch
      ? operatorMatch[1]
      : this.calculator.input.length === 1
      ? "0"
      : this.calculator.input.slice(0, -1);

    return { input: this.calculator.input, error: "" };
  }

  handleToggleSign() {
    const currentInput = this.calculator.input;
    
    if (currentInput !== "0" && currentInput !== "Error") {
      const parts = currentInput.split(/([+×÷])/);
      const lastPart = parts[parts.length - 1].trim();

      if (lastPart) {
        if (lastPart.startsWith("-")) parts[parts.length - 1] = lastPart.slice(1);
        else parts[parts.length - 1] = "- " + lastPart;

        this.calculator.input = parts.join(" ").trim();
      }
    }
    return { input: this.calculator.input, error: this.calculator.error };
  }

  handleSquare() {
    return this.handleOperation((value) => {
      if (!Number.isFinite(value)) throw new Error("Overflow");
      return Math.pow(value, 2);
    });
  }

  handleSquareRoot() {
    return this.handleOperation((value) => {
      if (value < 0)
        throw new Error("Cannot calculate square root of negative number");
      return Math.sqrt(value);
    });
  }

  handleReciprocal() {
    return this.handleOperation((value) => {
      if (value === 0) throw new Error("Cannot divide by zero");
      return 1 / value;
    });
  }

  handlePercentage() {
    return this.handleOperation((value) => value / 100);
  }

  handleOperation(operation) {
    try {
      const value = this.calculator.evaluateExpression(this.calculator.input);
      const result = operation(value);
      if (!Number.isFinite(result)) {
        throw new Error("Overflow");
      }
      this.calculator.input = this.calculator.formatResult(result);
      return { input: this.calculator.input, error: "" };
    } catch (err) {
      if (err.message === "Overflow")
        return {
          input: this.calculator.input,
          error: "Overflow: Evaluated result exceeding max limit",
        };
      return { input: "Error", error: err.message };
    }
  }

  validateNumberInput(num) {
    if (num === ".") {
      const parts = this.calculator.input.split(/[+\-×÷]+/);
      return !parts[parts.length - 1].includes(".");
    }
    return true;
  }
}
