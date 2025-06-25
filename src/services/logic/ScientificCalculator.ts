import { ICalculator } from "@/utils/core/ICalculator.ts";
import { ScientificOperations } from "@/utils/operations/ScientificOperations.ts";
import { ScientificCalculations } from "@/utils/calculations/ScientificCalculations.ts";
import { CalculatorConstants, CalculatorUtils } from "@/utils/constants/CalculatorConstants.ts";

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
  angleMode: 'RAD' | 'DEG' | 'GRAD' = 'RAD';
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
    this.angleMode = settings.angleUnit === 'degrees' ? 'DEG' : 'RAD';
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
  toggleHyperbolic(state: boolean): void {
    this.hyperbolicMode = state;
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

handleEquals(): Record<string, any> {
  console.log('🟰 handleEquals() called!')
  console.log('📍 Call stack:', new Error().stack)
  console.log('📝 Current input:', this.input)
  
  try {
    // Get parentheses count from operations
    const openCount = this.operations.getParenthesesCount();
    console.log('🔢 Open parentheses count:', openCount)
    
    // Add missing closing parentheses if needed
    const finalExpr = openCount > 0 ? this.input + ")".repeat(openCount) : this.input;
    console.log('📐 Final expression with auto-closed parens:', finalExpr)
    
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

      // Handle scientific mode toggles
      if (btn === 'RAD' || btn === 'DEG' || btn === 'GRAD') {
        this.setAngleMode(btn as 'RAD' | 'DEG' | 'GRAD');
        return { input: this.input, angleMode: this.angleMode };
      }
      
      if (btn === 'F-E' || btn === 'SCI') {
        this.setNotationMode(btn as 'F-E' | 'SCI');
        return { input: this.input, notationMode: this.notationMode };
      }
      
      if (btn === 'HYP') {
        this.toggleHyperbolic(!this.hyperbolicMode);
        return { input: this.input, hyperbolicMode: this.hyperbolicMode };
      }

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

      // Handle scientific functions - expanded list
      const scientificFunctions = [
        // Basic trig functions
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        // Reciprocal trig functions
        'csc', 'sec', 'cot', 'acsc', 'asec', 'acot',
        // Hyperbolic functions
        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        // Reciprocal hyperbolic functions
        'csch', 'sech', 'coth', 'acsch', 'asech', 'acoth',
        // Logarithmic and exponential functions
        'log', 'ln', 'log2', 'exp', '10^x', '2^x', 'e^x',
        // Power and root functions
        'x^y', 'y√x', 'n!', '|x|', 'x²', 'x³', '√', '∛', '1/x',
        // Additional mathematical functions
        'abs', 'ceil', 'floor', 'round', 'rand', 'gcd', 'lcm',
        // Angle conversion functions
        'dms', 'deg', 'mod'
      ];

      // Handle display variants of scientific functions
      const displayVariants = [
        'sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'csc⁻¹', 'sec⁻¹', 'cot⁻¹',
        'sinh⁻¹', 'cosh⁻¹', 'tanh⁻¹', 'csch⁻¹', 'sech⁻¹', 'coth⁻¹',
        'log₂', '10ˣ', '2ˣ', 'eˣ', 'xʸ', 'ʸ√x', '²√x', '³√x', '¹⁄ₓ',
        '⌈x⌉', '⌊x⌋', '→DMS', '→DEG'
      ];

      if (scientificFunctions.includes(btn) || displayVariants.includes(btn)) {
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

