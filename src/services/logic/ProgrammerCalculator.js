import { EngineCalculator } from "@/utils/misc/EngineCalculator";
import { ProgrammerOperations } from "@/utils/operations/ProgrammerOperations";
import { ProgrammerCalculations } from "@/utils/calculations/ProgramnerCalculations";
import {
  BinCalculator,
  DecCalculator,
  HexCalculator,
  OctCalculator,
} from "../../utils/misc/BaseCalculator";

export class ProgrammerCalculator extends EngineCalculator {
  constructor(settings) {
    super(settings);
    this.MAX_INPUT_LENGTH = 29;
    this.states = {
      DEC: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
      HEX: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
    };
    this.calculators = {
      DEC: new DecCalculator(),
      BIN: new BinCalculator(),
      HEX: new HexCalculator(),
      OCT: new OctCalculator(),
    };
    this.operations = new ProgrammerOperations(this);
  }

  get activeCalculator() {
    return this.calculators[this.activeBase];
  }

  evaluateExpression(expr, base = this.activeBase) {
    try {
      return ProgrammerCalculations.evaluateExpression(expr, base);
    } catch (err) {
      // Preserve specific error messages
      throw new Error("Invalid expression: " + err.message);
    }
  }

  formatResult(result, base = this.activeBase) {
    return ProgrammerCalculations.formatResult(result, base) || "";
  }

  convertToBase(value, fromBase, toBase) {
    return ProgrammerCalculations.convertBetweenBases(value, fromBase, toBase) || "0";
  }

  handleButtonClick(btn) {
    // Allow error clearing operations
    if (["backspace", "AC", "C", "CE"].includes(btn)) {
      this.error = "";
      return this.processButton(btn);
    }

    // Check input length but allow continued input
    if (this.isInputTooLong(btn)) {
      return this.handleInputLengthError();
    }

    try {
      const result = this.processButton(btn);
      return result;
    } catch (err) {
      return {
        input: "Error",
        error: err.message || "Operation failed"
      };
    }
  }

  processButton(btn) {
    try {
      let result;
      const isFunctionKey = ["<<", ">>", "(", ")", "backspace", "AC", "C", "CE", "±", "%"].includes(btn);
      this.error = "";

      switch (btn) {
        case "=": return this.handleEquals();
        case "AC":
        case "C": this.handleClear(); break;
        case "CE": this.handleClearEntry(); break;
        case "backspace": this.operations.handleBackspace(); break;
        case "±": result = this.operations.handleToggleSign(); break;
        case "%": result = this.operations.handlePercent(); break;
        case "(":
        case ")":
          result = this.operations.handleParenthesis(btn);
          if (result) {
            this.states[this.activeBase].input = result.input;
            this.error = result.error;
          }
          break;
        case "<<":
        case ">>":
        case "+":
        case "-":
        case "×":
        case "÷": return this.operations.handleOperator(btn);
        default: this.operations.handleNumber(btn);
      }

      if (isFunctionKey && result) {
        this.states[this.activeBase].input = result.input;
        this.updateDisplayValues(); // <-- forces UI update
      }

      return {
        input: this.states[this.activeBase].input,
        error: this.error,
        expression: this.currentExpression,
      };
    } catch (err) {
      return this.handleError(err);
    }
  }

  handleEquals() {
    try {
      const expression = this.states[this.activeBase].input;
      const openCount = this.operations.getParenthesesCount();
      const finalExpr = openCount > 0 ? expression + " )".repeat(openCount) : expression;

      this.currentExpression = finalExpr;
      const result = this.evaluateExpression(finalExpr);

      if (!result) throw new Error("Invalid expression");

      const formattedResult = this.formatResult(result);
      this.updateAllStates(formattedResult);
      this.operations.resetParentheses();

      return {
        input: this.states[this.activeBase].input,
        expression: this.currentExpression,
        result: formattedResult,
        displayValues: { ...this.states }
      };
    } catch (err) {
      return this.handleError(err);
    }
  }

  updateDisplayValues() {
    try {
      const currentValue = this.evaluateExpression(
        this.states[this.activeBase].input,
        this.activeBase
      );
      
      if (currentValue) {
        Object.keys(this.states).forEach(base => {
          this.states[base].display = this.formatResult(currentValue, base);
        });
      }
      return this.states;
    } catch (err) {
      return this.states;
    }
  }

  handleBaseChange(newBase) {
    try {
      const currentValue = this.evaluateExpression(
        this.states[this.activeBase].input,
        this.activeBase
      );

      if (currentValue) {
        this.updateAllStates(this.formatResult(currentValue));
      }

      this.activeBase = newBase;
      return {
        input: this.states[newBase].input,
        error: this.error,
        displayValues: this.states
      };
    } catch (err) {
      return this.handleError(err);
    }
  }

  updateAllStates(value) {
    Object.keys(this.states).forEach(base => {
      const converted = this.convertToBase(value, this.activeBase, base);
      this.states[base] = { input: converted, display: converted };
    });
  }

  handleClear() {
    this.states[this.activeBase].input = "0";
    this.operations.resetParentheses();
    this.error = "";
  }

  handleClearEntry() {
    const input = this.states[this.activeBase].input;
    if (input !== "0" && input !== "Error") {
      const parts = input.split(" ");
      this.states[this.activeBase].input = parts.length > 1 ? 
        parts.slice(0, -1).join(" ") : "0";
    } else {
      this.handleClear();
    }
  }

  handleError(err) {
    this.error = err.message;
    this.states[this.activeBase].input = "Error";
    return {
      input: this.states[this.activeBase].input,
      error: err.message,
      expression: this.currentExpression
    };
  }

  handleInputLengthError() {
    this.error = "Maximum input length reached";
      return {
        input: this.states[this.activeBase].input,
        error: this.error,
        displayValues: this.states
      };
  }

  isInputTooLong(btn) {
    return this.states[this.activeBase].input.length >= this.MAX_INPUT_LENGTH &&
      !["=", "AC", "backspace", "C", "<<", ">>", "±"].includes(btn);
  }
}
