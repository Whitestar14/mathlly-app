import { EngineCalculator } from "@/utils/misc/CalculatorCore";
import { StandardOperations } from "@/utils/operations/StandardOperations";
import { StandardCalculations } from "@/utils/calculations/StandardCalculations";
export class StandardCalculator extends EngineCalculator {
  constructor(settings) {
    super(settings);
    this.MAX_INPUT_LENGTH = 100;
    this.isExponentMode = false;
    this.hasExponent = false;
    this.calculations = new StandardCalculations(settings);
    this.operations = new StandardOperations(this);
  }

  handleButtonClick(btn) {
    try {
      this.error = "";

      if (this.input === "Error") {
        this.handleClear();
      }

      if (this.isInputTooLong(btn)) {
        this.error = "Maximum input length reached";
        return { input: this.input, error: this.error };
      }

      const result = this.processButton(btn);
      return result;
    } catch (err) {
      if (err.message === "Overflow")
        return { input: "Error", error: "Overflow: Exceeding max limit bound" };
    }
  }

  processButton(btn) {
    const operationMap = {
      MC: () => this.handleMemoryClear(),
      MR: () => this.handleMemoryRecall(),
      "M+": () => this.handleMemoryAdd(),
      "M-": () => this.handleMemorySubtract(),
      MS: () => this.handleMemoryStore(),
      "=": () => this.handleEquals(),
      AC: () => this.handleClear(),
      C: () => this.handleClear(),
      CE: () => this.handleClearEntry(),
      backspace: () => this.operations.handleBackspace(),
      "1/x": () => this.operations.handleReciprocal(),
      "x²": () => this.operations.handleSquare(),
      "√": () => this.operations.handleSquareRoot(),
      "%": () => this.operations.handlePercentage(),
      "±": () => this.operations.handleToggleSign(),
      EXP: () => this.operations.handleExponent(),
    };

    if (operationMap[btn]) {
      return operationMap[btn]();
    }

    if (["+", "-", "×", "÷"].includes(btn)) {
      return this.operations.handleOperator(btn);
    }

    return this.operations.handleNumber(btn);
  }

  evaluateExpression(expr) {
    return this.calculations.evaluateExpression(expr);
  }

  formatResult(result) {
    return this.calculations.formatResult(result);
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
        error: this.error,
      };
    }
  }

  handleClear() {
    Object.assign(this, {
      input: "0",
      error: "",
      currentExpression: "",
      isExponentMode: false,
      hasExponent: false,
    });
    return { input: this.input, error: this.error };
  }

  handleClearEntry() {
    if (this.input !== "0" && this.input !== "Error") {
      const parts = this.input.split(" ");
      this.input = parts.length > 1 ? parts.slice(0, -1).join(" ") : "0";
    } else {
      this.handleClear();
    }
    return { input: this.input, error: this.error };
  }

  isInputTooLong(btn) {
    const excludedButtons = [
      "=",
      "AC",
      "backspace",
      "MC",
      "MR",
      "M+",
      "M-",
      "MS",
      "C",
      "CE",
    ];
    return (
      this.input.length >= this.MAX_INPUT_LENGTH &&
      !excludedButtons.includes(btn)
    );
  }
}
