import { ICalculator } from "@/utils/core/ICalculator";
import { ProgrammerOperations } from "@/utils/operations/ProgrammerOperations";
import { ProgrammerCalculations } from "@/utils/calculations/ProgrammerCalculations";
import { CalculatorConstants, CalculatorUtils } from "@/utils/constants/CalculatorConstants";
import {
  BinCalculator,
  DecCalculator,
  HexCalculator,
  OctCalculator,
} from "@/utils/core/BaseCalculator";

/**
 * Calculator implementation for programmer mode with multiple base support
 * 
 * @class ProgrammerCalculator
 * @extends ICalculator
 */
export class ProgrammerCalculator extends ICalculator {
  /**
   * Create a new programmer calculator
   * 
   * @param {Object} settings - Calculator settings
   */
  constructor(settings) {
    super(settings);
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.PROGRAMMER;
    
    // Initialize state for each base
    this.states = {
      DEC: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
      HEX: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
    };
    
    // Initialize specialized calculators for each base
    this.calculators = {
      DEC: new DecCalculator(),
      BIN: new BinCalculator(),
      HEX: new HexCalculator(),
      OCT: new OctCalculator(),
    };
    
    // Use composition for calculations and operations
    this.calculations = new ProgrammerCalculations(settings);
    this.operations = new ProgrammerOperations(this);
  }

  /**
   * Get the calculator for the active base
   * 
   * @returns {Object} Active base calculator
   */
  get activeCalculator() {
    return this.calculators[this.activeBase];
  }

  /**
   * Evaluate a mathematical expression
   * 
   * @param {string} expr - Expression to evaluate
   * @param {string} [base=this.activeBase] - Base for evaluation
   * @returns {*} Evaluation result
   */
  evaluateExpression(expr, base = this.activeBase) {
    try {
      return this.calculations.evaluateExpression(expr, base);
    } catch (err) {
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  /**
   * Format a result for display
   * 
   * @param {*} result - Result to format
   * @param {string} [base=this.activeBase] - Base for formatting
   * @returns {string} Formatted result
   */
  formatResult(result, base = this.activeBase) {
    return this.calculations.formatResult(result, base) || "";
  }

  /**
   * Convert a value between bases
   * 
   * @param {string|number} value - Value to convert
   * @param {string} fromBase - Source base
   * @param {string} toBase - Target base
   * @returns {string} Converted value
   */
  convertToBase(value, fromBase, toBase) {
    return this.calculations.convertToBase(value, fromBase, toBase) || "0";
  }

  /**
   * Handle button click
   * 
   * @param {string} btn - Button value
   * @returns {Object} Updated state
   */
  handleButtonClick(btn) {
    // Allow error clearing operations
    if (["backspace", "AC", "CE"].includes(btn)) {
      return this.normalizeResponse(this.processButton(btn));
    }

    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error("Maximum input length reached"),
        this.states[this.activeBase].input
      );
    }

    try {
      return this.normalizeResponse(this.processButton(btn));
    } catch (err) {
      return this.createErrorResponse(err, this.states[this.activeBase].input);
    }
  }

  /**
   * Process button input
   * 
   * @param {string} btn - Button value
   * @returns {Object} Processing result
   */
  processButton(btn) {
    try {
      this.error = "";
      // Use CalculatorConstants for button type checking
      const isFunctionKey = [
        ...CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS,
        "(", ")", "backspace", "AC", "CE", "±", "%"
      ].includes(btn);

      switch (btn) {
        case "=":
          return this.handleEquals();
        case "AC":
          this.handleClear();
          break;
        case "CE":
          this.handleClearEntry();
          break;
        case "backspace":
          return this.operations.handleBackspace();
        case "±":
          return this.operations.handleToggleSign();
        case "%":
          return this.operations.handleModuloSign();
        case "(":
        case ")":
          return this.operations.handleParenthesis(btn);
        case "<<":
        case ">>":
        case "+":
        case "-":
        case "×":
        case "÷":
          return this.operations.handleOperator(btn);
        default:
          return this.operations.handleNumber(btn);
      }

      // Update display values for function keys
      if (isFunctionKey) {
        this.updateDisplayValues();
      }

      return {
        input: this.states[this.activeBase].input,
        error: this.error,
        expression: this.currentExpression
      };
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Handle equals operation
   * 
   * @returns {Object} Calculation result
   */
  handleEquals() {
    try {
      const expression = this.states[this.activeBase].input;
      const openCount = this.operations.getParenthesesCount();
      const finalExpr = openCount > 0 ? expression + " )".repeat(openCount) : expression;

      this.currentExpression = finalExpr;
      const result = this.evaluateExpression(finalExpr);

      if (!result && result !== 0) throw new Error("Invalid expression");

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
      return this.createErrorResponse(err);
    }
  }

  /**
   * Update display values for all bases
   * 
   * @returns {Object} Updated states
   */
  updateDisplayValues() {
    try {
      const currentValue = this.evaluateExpression(
        this.states[this.activeBase].input,
        this.activeBase
      );
      
      if (currentValue || currentValue === 0) {
        Object.keys(this.states).forEach(base => {
          this.states[base].display = this.formatResult(currentValue, base);
        });
      }
      return this.states;
    } catch (err) {
      return this.states;
    }
  }

  /**
   * Handle base change
   * 
   * @param {string} newBase - New base to switch to
   * @returns {Object} Updated state
   */
  handleBaseChange(newBase) {
    try {
      // Clean up incomplete expressions before evaluating
      const currentInput = this.states[this.activeBase].input.trim();
      const cleanedInput = CalculatorUtils.sanitizeExpression(currentInput);
      
      if (cleanedInput !== currentInput) {
        this.states[this.activeBase].input = cleanedInput;
      }

      const currentValue = this.evaluateExpression(
        cleanedInput,
        this.activeBase
      );

      if (currentValue || currentValue === 0) {
        this.updateAllStates(this.formatResult(currentValue));
      }

      this.activeBase = newBase;
      return {
        input: this.states[newBase].input,
        error: this.error,
        displayValues: this.states
      };
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  /**
   * Update all base states with a value
   * 
   * @param {string|number} value - Value to set
   */
  updateAllStates(value) {
    try {
      Object.keys(this.states).forEach(base => {
        const converted = this.convertToBase(value, this.activeBase, base);
        this.states[base] = {
          input: converted,
          display: converted
        };
      });
    } catch (err) {
      console.error('Error updating states:', err);
      throw err;
    }
  }

  /**
   * Clear calculator state
   * 
   * @returns {Object} Updated state
   */
  handleClear() {
    super.handleClear();
    Object.keys(this.states).forEach(base => {
      this.states[base] = { input: "0", display: "0" };
    });
    this.operations.resetParentheses();
    return {
      input: "0",
      error: "",
      displayValues: this.states
    };
  }

  /**
   * Clear current entry
   * 
   * @returns {Object} Updated state
   */
  handleClearEntry() {
    const input = this.states[this.activeBase].input;
    if (input !== "0" && input !== "Error") {
      const parts = input.split(" ");
      this.states[this.activeBase].input = parts.length > 1 ? 
        parts.slice(0, -1).join(" ") : "0";
    } else {
      this.handleClear();
    }
    return {
      input: this.states[this.activeBase].input,
      error: "",
      displayValues: this.states
    };
  }

  /**
   * Check if input is too long
   * 
   * @param {string} btn - Button being pressed
   * @returns {boolean} True if input would be too long
   */
  isInputTooLong(btn) {
    // Use CalculatorConstants.BUTTON_TYPES for excluded buttons
    const excludedButtons = [
      "=", "AC", "backspace", 
      ...CalculatorConstants.BUTTON_TYPES.MEMORY,
      ...CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS,
      "CE", "±", "%"
    ];
    
    return this.states[this.activeBase].input.length >= this.MAX_INPUT_LENGTH &&
      !excludedButtons.includes(btn);
  }
}
