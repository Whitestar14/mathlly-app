import { ICalculator } from "@/utils/core/ICalculator.ts";
import { ScientificOperations } from "@/utils/operations/ScientificOperations.ts";
import { ScientificCalculations } from "@/utils/calculations/ScientificCalculations.ts";
import { CalculatorConstants } from "@/utils/constants/CalculatorConstants.ts";
import { CalculatorUtils } from '@/utils/constants/CalculatorUtils';

/**
 * Calculator implementation for scientific mode
 * 
 * @class ScientificCalculator
 * @extends ICalculator
 */
export class ScientificCalculator extends ICalculator {
  MAX_INPUT_LENGTH: number;
  calculations: ScientificCalculations;
  operations: ScientificOperations;
  angleMode: 'RAD' | 'DEG' | 'GRAD' = 'DEG';
  notationMode: 'F-E' | 'SCI' = 'F-E';
  hyperbolicMode: boolean = false;

  /**
   * Create a new scientific calculator
   * 
   * @param {Object} settings - Calculator settings
   */
  constructor(settings: any) {
    super(settings);
    this.MAX_INPUT_LENGTH = CalculatorConstants.MAX_INPUT_LENGTH.STANDARD;
    // Use composition for calculations and operations
    this.calculations = new ScientificCalculations(settings);
    this.operations = new ScientificOperations(this);
    
    // Initialize scientific modes
    this.angleMode = settings.angleUnit === 'radians' ? 'RAD' : 'DEG';
  }

  /**
   * Set angle mode for trigonometric functions
   */
  setAngleMode(mode: 'RAD' | 'DEG' | 'GRAD'): void {
    this.angleMode = mode;
    this.calculations.setAngleMode(mode);
  }

  /**
   * Set notation mode for display
   */
  setNotationMode(mode: 'F-E' | 'SCI'): void {
    this.notationMode = mode;
    this.calculations.setNotationMode(mode);
  }

  /**
   * Toggle hyperbolic mode
   */
  toggleHyperbolic(state?: boolean): void {
    this.hyperbolicMode = state !== undefined ? state : !this.hyperbolicMode;
  }

  /**
   * Format a result for display
   * 
   * @param {*} result - Result to format
   * @returns {string} Formatted result
   */
  formatResult(result: any): string {
    return this.calculations.formatResult(result);
  }

  /**
   * Evaluate expression with scientific functions
   */
  evaluateExpression(expr: string): any {
    try {
      return this.calculations.evaluateExpression(expr);
    } catch (err: any) {
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  /**
   * Handle equals operation
   * 
   * @returns {Object} Calculation result
   */
  handleEquals(): Record<string, any> {
    try {
      // Get parentheses count from operations
      const openCount = this.operations.getParenthesesCount();
      // Add missing closing parentheses if needed
      const finalExpr = openCount > 0 ? this.input + ")".repeat(openCount) : this.input;
      
      this.currentExpression = finalExpr;
      const result = this.evaluateExpression(finalExpr);
      this.input = this.formatResult(result);
      
      // Reset parentheses tracker in operations
      this.operations.resetParentheses();
      
      return this.normalizeResponse({
        expression: this.currentExpression,
        result: this.input,
        input: this.input
      });
    } catch (err: any) {
      return this.createErrorResponse(err, this.input);
    }
  }

  /**
   * Process button input and route to appropriate handler
   */
  processButton(btn: string): Record<string, any> {
    try {
      this.error = '';

      // Handle parentheses
      if (btn === '(') {
        return this.operations.handleParenthesis(btn);
      }
      
      if (btn === ')') {
        return this.operations.handleParenthesis(btn);
      }

      // Handle scientific constants
      if (['π', 'e'].includes(btn)) {
        return this.operations.handleConstant(btn);
      }

      // Handle equals
      if (btn === '=') {
        return this.handleEquals();
      }

      // Handle clear operations
      if (btn === 'AC' || btn === 'C') {
        this.handleClear();
        this.operations.resetParentheses();
        return { input: this.input, error: this.error };
      }
      
      if (btn === 'CE') {
        return this.operations.handleClearEntry();
      }
      
      if (btn === 'backspace') {
        return this.operations.handleBackspace();
      }

      // Handle scientific functions
      const scientificFunctions = [
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        'csc', 'sec', 'cot', 'acsc', 'asec', 'acot',
        'csch', 'sech', 'coth', 'acsch', 'asech', 'acoth',
        'log', 'ln', 'log2', 'exp', '10^x', '2^x', 'e^x',
        'x^y', 'y√x', 'n!', '|x|', 'x²', 'x³', '√', '∛', '1/x',
        'mod', 'rand', 'dms', 'deg', 'abs', 'ceil', 'floor', 'round', 'gcd', 'lcm'
      ];

      if (scientificFunctions.includes(btn) || 
          ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'sinh⁻¹', 'cosh⁻¹', 'tanh⁻¹',
           'csc⁻¹', 'sec⁻¹', 'cot⁻¹', 'csch⁻¹', 'sech⁻¹', 'coth⁻¹',
           'log₂', '10ˣ', '2ˣ', 'eˣ', 'xʸ', 'ʸ√x', '²√x', '³√x', '¹⁄ₓ',
           '⌈x⌉', '⌊x⌋', '→DMS', '→DEG'].includes(btn)) {
        return this.operations.handleScientificFunction(btn);
      }

      // Handle basic operators
      if (['+', '-', '×', '÷'].includes(btn)) {
        return this.operations.handleOperator(btn);
      }

      // Handle percentage
      if (btn === '%') {
        return this.operations.handlePercentage();
      }

      // Handle sign toggle
      if (btn === '±') {
        return this.operations.handleToggleSign();
      }

      // Handle comma for function arguments
      if (btn === ',') {
        return this.operations.handleComma();
      }

      // Default to number handling
      return this.operations.handleNumber(btn);
    } catch (err) {
      return this.createErrorResponse(err as Error);
    }
  }

  /**
   * Handle button click - main entry point
   */
  handleButtonClick(btn: string): Record<string, any> {
    // Handle memory operations
    if (["MC", "MR", "MS", "M+", "M-"].includes(btn)) {
      // Memory operations are handled by the parent calculator
      return super.handleButtonClick(btn);
    }
    
    if (["backspace", "AC", "CE", "C"].includes(btn)) {
      return this.normalizeResponse(this.processButton(btn));
    }
    
    if (this.isInputTooLong(btn)) {
      return this.createErrorResponse(
        new Error("Maximum input length reached"),
        this.input
      );
    }
    
    try {
      return this.normalizeResponse(this.processButton(btn));
    } catch (err: any) {
      return this.createErrorResponse(err, this.input);
    }
  }

  /**
   * Handle clear operation
   */
  handleClear(): Record<string, any> {
    super.handleClear();
    this.operations.resetParentheses();
    return {
      input: this.input,
      error: this.error
    };
  }
}
