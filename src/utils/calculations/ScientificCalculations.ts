import { format, fraction, pi, e, evaluate } from "mathjs";
import { ExpressionEvaluator } from "@/utils/core/ExpressionEvaluator.ts";
import { CalculatorUtils } from "@/utils/constants/CalculatorConstants.ts";

/**
 * Handles calculations for the scientific calculator mode
 */
export class ScientificCalculations {
  settings: any;
  evaluator: ExpressionEvaluator;
  angleMode: 'RAD' | 'DEG' | 'GRAD' = 'RAD';
  notationMode: 'F-E' | 'SCI' = 'F-E';

  /**
   * Creates a new ScientificCalculations instance
   * @param {Object} settings - Calculator settings including precision and fraction preferences
   */
  constructor(settings: any) {
    this.settings = settings;
    this.evaluator = ExpressionEvaluator.getInstance();
    this.angleMode = settings.angleUnit === 'degrees' ? 'DEG' : 'RAD';
    this.notationMode = 'F-E';
  }

  /**
   * Set angle mode for trigonometric calculations
   * @param {string} mode - 'RAD', 'DEG', or 'GRAD'
   */
  setAngleMode(mode: 'RAD' | 'DEG' | 'GRAD'): void {
    this.angleMode = mode;
  }

  /**
   * Set notation mode for display
   * @param {string} mode - 'F-E' or 'SCI'
   */
  setNotationMode(mode: 'F-E' | 'SCI'): void {
    this.notationMode = mode;
  }

  /**
   * Evaluates a mathematical expression
   * @param {string} expr - The expression to evaluate
   * @returns {number} The evaluated result
   * @throws {Error} If the expression is invalid or causes an error
   */
  evaluateExpression(expr: string): number {
    try {
      // First convert scientific notation and symbols for mathjs
      const scientificExpr = this.convertScientificExpression(expr);
      
      // Then use sanitized expression from CalculatorUtils
      const sanitizedExpr = CalculatorUtils.sanitizeExpression(scientificExpr);
      
      return this.evaluator.evaluate(sanitizedExpr);
    } catch (err: any) {
      // Use CalculatorUtils.formatError for consistent error handling
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  /**
   * Convert angle from current mode to radians for mathjs
   */
  private convertToRadians(angle: string): string {
    if (this.angleMode === 'RAD') return angle;
    
    if (this.angleMode === 'DEG') {
      return `(${angle}) * ${pi/180}`;
    } else if (this.angleMode === 'GRAD') {
      return `(${angle}) * ${pi/200}`;
    }
    
    return angle;
  }

  /**
   * Convert angle from radians to current mode
   */
  private convertFromRadians(expr: string): string {
    if (this.angleMode === 'RAD') return expr;
    
    if (this.angleMode === 'DEG') {
      return `(${expr}) * 180/${pi}`;
    } else if (this.angleMode === 'GRAD') {
      return `(${expr}) * 200/${pi}`;
    }
    
    return expr;
  }

/**
 * Convert scientific symbols to mathjs-compatible expressions
 * @param {string} expr - Expression with scientific symbols
 * @returns {string} Converted expression
 */
private convertScientificExpression(expr: string): string {
  let result = expr;
  
  // Step 1: Simple global replacements (no nesting issues)
  result = result.replace(/ln/g, 'log');
  
  // Step 2: Handle functions with potential nesting using iterative approach
  result = this.handleNestedFunctions(result);
  
  // Step 3: Handle trigonometric functions with angle conversion
  result = this.handleTrigonometricFunctions(result);
  
  // Step 4: Handle other mathematical functions
  result = this.handleMathematicalFunctions(result);
  
  // Step 5: Handle operators and final conversions
  result = this.handleOperators(result);
  
  return result;
}

/**
 * Handle functions that can be nested using iterative approach
 */
private handleNestedFunctions(expr: string): string {
  let result = expr;
  const maxIterations = 10;
  let iteration = 0;
  let changed = true;
  
  while (changed && iteration < maxIterations) {
    const before = result;
    
    // Handle all functions that might nest
    result = result
      // Power functions
      .replace(/sqr\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'pow($1, 2)')
      .replace(/cube\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'pow($1, 3)')
      
      // Root functions (if they can nest)
      .replace(/√\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'sqrt($1)')
      .replace(/∛\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'cbrt($1)')
      
      // Reciprocal function
      .replace(/reciprocal\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/($1)')
      
      // Absolute value (pipe notation)
      .replace(/\|([^|]*(?:\|[^|]*\|)*[^|]*)\|/g, 'abs($1)');
    
    changed = (before !== result);
    iteration++;
  }
  
  return result;
}

/**
 * Handle trigonometric functions with angle conversion
 */
private handleTrigonometricFunctions(expr: string): string {
  let result = expr;
  
  // Basic trigonometric functions
  result = result
    .replace(/sin\(([^)]+)\)/g, (match, angle) => `sin(${this.convertToRadians(angle)})`)
    .replace(/cos\(([^)]+)\)/g, (match, angle) => `cos(${this.convertToRadians(angle)})`)
    .replace(/tan\(([^)]+)\)/g, (match, angle) => `tan(${this.convertToRadians(angle)})`);
  
  // Inverse trigonometric functions
  result = result
    .replace(/asin\(([^)]+)\)/g, (match, value) => this.convertFromRadians(`asin(${value})`))
    .replace(/acos\(([^)]+)\)/g, (match, value) => this.convertFromRadians(`acos(${value})`))
    .replace(/atan\(([^)]+)\)/g, (match, value) => this.convertFromRadians(`atan(${value})`));
  
  // Reciprocal trigonometric functions
  result = result
    .replace(/csc\(([^)]+)\)/g, (match, angle) => `1/sin(${this.convertToRadians(angle)})`)
    .replace(/sec\(([^)]+)\)/g, (match, angle) => `1/cos(${this.convertToRadians(angle)})`)
    .replace(/cot\(([^)]+)\)/g, (match, angle) => `1/tan(${this.convertToRadians(angle)})`);
  
  // Inverse reciprocal trigonometric functions
  result = result
    .replace(/acsc\(([^)]+)\)/g, (match, value) => this.convertFromRadians(`asin(1/(${value}))`))
    .replace(/asec\(([^)]+)\)/g, (match, value) => this.convertFromRadians(`acos(1/(${value}))`))
    .replace(/acot\(([^)]+)\)/g, (match, value) => this.convertFromRadians(`atan(1/(${value}))`));
  
  // Hyperbolic functions
  result = result
    .replace(/sinh\(([^)]+)\)/g, 'sinh($1)')
    .replace(/cosh\(([^)]+)\)/g, 'cosh($1)')
    .replace(/tanh\(([^)]+)\)/g, 'tanh($1)')
    .replace(/asinh\(([^)]+)\)/g, 'asinh($1)')
    .replace(/acosh\(([^)]+)\)/g, 'acosh($1)')
    .replace(/atanh\(([^)]+)\)/g, 'atanh($1)');
  
  // Reciprocal hyperbolic functions
  result = result
    .replace(/csch\(([^)]+)\)/g, '1/sinh($1)')
    .replace(/sech\(([^)]+)\)/g, '1/cosh($1)')
    .replace(/coth\(([^)]+)\)/g, '1/tanh($1)')
    .replace(/acsch\(([^)]+)\)/g, 'asinh(1/($1))')
    .replace(/asech\(([^)]+)\)/g, 'acosh(1/($1))')
    .replace(/acoth\(([^)]+)\)/g, 'atanh(1/($1))');
  
  return result;
}

/**
 * Handle other mathematical functions
 */
private handleMathematicalFunctions(expr: string): string {
  let result = expr;
  
  // Logarithmic and exponential functions
  result = result
    .replace(/log\(([^)]+)\)/g, 'log10($1)')
    .replace(/log2\(([^)]+)\)/g, 'log2($1)')
    .replace(/10\^\(([^)]+)\)/g, 'pow(10, $1)')
    .replace(/2\^\(([^)]+)\)/g, 'pow(2, $1)')
    .replace(/e\^\(([^)]+)\)/g, 'exp($1)')
    .replace(/exp\(([^)]+)\)/g, 'exp($1)');
  
  // Additional mathematical functions
  result = result
    .replace(/abs\(([^)]+)\)/g, 'abs($1)')
    .replace(/ceil\(([^)]+)\)/g, 'ceil($1)')
    .replace(/floor\(([^)]+)\)/g, 'floor($1)')
    .replace(/round\(([^)]+)\)/g, 'round($1)')
    .replace(/rand\(\)/g, 'random()')
    .replace(/gcd\(([^)]+)\)/g, 'gcd($1)')
    .replace(/lcm\(([^)]+)\)/g, 'lcm($1)');
  
  // Angle conversions
  result = result
    .replace(/dms\(([^)]+)\)/g, (match, value) => {
      return `floor(${value}) + (floor((${value} - floor(${value})) * 60) / 100) + (((${value} - floor(${value})) * 60 - floor((${value} - floor(${value})) * 60)) * 60 / 10000)`;
    })
    .replace(/deg\(([^)]+)\)/g, (match, value) => {
      return `floor(${value}) + (floor((${value} - floor(${value})) * 100) / 60) + (((${value} - floor(${value})) * 100 - floor((${value} - floor(${value})) * 100)) * 100 / 3600)`;
    });
  
  // Special operations
  result = result
    .replace(/(\d+)!/g, 'factorial($1)') // Factorial
    .replace(/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g, '$1 * 10^$2'); // Scientific notation
  
  // Modulo operation
  result = result
    .replace(/mod\(([^,]+),\s*([^)]+)\)/g, 'mod($1, $2)')
    .replace(/(\d+)\s+mod\s+(\d+)/g, 'mod($1, $2)');
  
  return result;
}

/**
 * Handle operators and final conversions
 */
private handleOperators(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/');
}

  /**
   * Formats a numeric result according to calculator settings
   * @param {number} result - The numeric result to format
   * @returns {string} The formatted result as a string
   */
  formatResult(result: number): string {
    if (result === undefined || result === null || !isFinite(result)) return "Error";
    
    try {
      // Use scientific notation if enabled
      if (this.notationMode === 'SCI') {
        return format(result, {
          precision: this.settings.display?.precision || 10,
          notation: "exponential"
        });
      }
      
      // Try to display as fraction if enabled in settings
      if (this.settings.display?.useFractions) {
        return fraction(result).toFraction();
      }
      
      // Handle special cases for very large or very small numbers
      if (
        Math.abs(result) >= 1e15 ||
        (Math.abs(result) < 1e-10 && result !== 0)
      ) {
        return format(result, {
          precision: this.settings.display?.precision || 10,
          notation: "exponential",
        });
      }
      
      // For regular numbers
      const isInteger = Number.isInteger(result);
      if (isInteger) {
        return result.toString();
      }
      
      // For decimal numbers, respect precision but trim unnecessary zeros
      const formattedDecimal = format(result, {
        precision: this.settings.display?.precision || 10,
        notation: "fixed",
      });
      
      return CalculatorUtils.trimUnnecessaryZeros(formattedDecimal);
    } catch (err) {
      console.error("Formatting error:", err);
      return result.toString();
    }
  }
}
