import { format, fraction, pi, evaluate } from 'mathjs';
import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator';
import { CalculatorUtils } from '../constants/CalculatorUtils';
import { ERROR_MESSAGES } from '../constants/CalculatorConstants';

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

      // Check for domain violations before evaluation
      this.checkDomainViolations(expr);

      // Then use sanitized expression from CalculatorUtils
      const sanitizedExpr = CalculatorUtils.sanitizeExpression(scientificExpr);

      const result = this.evaluator.evaluate(sanitizedExpr);

      // Check if result is valid
      if (!isFinite(result)) {
        throw new Error(ERROR_MESSAGES.DOMAIN_ERROR);
      }

      return result;
    } catch (err: any) {
      // Check for domain errors specifically
      if (err.message && err.message.includes(ERROR_MESSAGES.DOMAIN_ERROR)) {
        throw err; // Re-throw domain errors as-is
      }

      // Use CalculatorUtils.formatError for other errors
      throw new Error(CalculatorUtils.formatError(err, 'Invalid expression'));
    }
  }

  /**
   * Convert angle from current mode to radians for mathjs
   */
  private convertToRadians(angle: string): string {
    if (this.angleMode === 'RAD') return angle;

    if (this.angleMode === 'DEG') {
      return `(${angle}) * ${pi / 180}`;
    } else if (this.angleMode === 'GRAD') {
      return `(${angle}) * ${pi / 200}`;
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

    result = result.replace(/ln/g, 'log');
    
    // Step 1: Handle constants first
    result = this.handleConstants(result);

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

      result = result
        // Power functions
        .replace(/sqr\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'pow($1, 2)')
        .replace(/cube\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'pow($1, 3)')

        // Root functions
        .replace(/√\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'sqrt($1)')
        .replace(/∛\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'cbrt($1)')

        // Nth root function - convert nthroot(base, index) to pow(base, 1/index)
        .replace(
          /nthroot\(([^,()]*(?:\([^()]*\))*[^,()]*?)(?:,\s*([^,()]*(?:\([^()]*\))*[^,()]*))?\)/g,
          (_, base, index) => {
            // If no index provided, default to 2 (square root)
            const rootIndex = index ? index.trim() : '2';

            // Validate that we have a base
            if (!base || base.trim() === '') {
              return 'sqrt(0)'; // Safe fallback
            }

            // Validate that index is not zero or empty
            if (!rootIndex || rootIndex === '0') {
              return `pow(${base.trim()}, 1/2)`; // Default to square root
            }
            return `pow(${base.trim()}, 1/(${rootIndex}))`;
          }
        )

        // Reciprocal function
        .replace(/reciprocal\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/($1)')

        // Absolute value (pipe notation)
        .replace(/\|([^|]*(?:\|[^|]*\|)*[^|]*)\|/g, 'abs($1)');

      changed = before !== result;
      iteration++;
    }

    return result;
  }

  /**
   * Handle trigonometric functions with angle conversion - simplified without domain checking
   */
  private handleTrigonometricFunctions(expr: string): string {
    let result = expr;
    const maxIterations = 10;
    let iteration = 0;
    let changed = true;

    // Process functions iteratively to handle nesting properly
    while (changed && iteration < maxIterations) {
      const before = result;

      // Basic trigonometric functions
      result = result
        .replace(
          /\bsin\(([^()]*(?:\([^()]*\))*[^()]*)\)/g,
          (_, angle) => `sin(${this.convertToRadians(angle)})`
        )
        .replace(
          /\bcos\(([^()]*(?:\([^()]*\))*[^()]*)\)/g,
          (_, angle) => `cos(${this.convertToRadians(angle)})`
        )
        .replace(
          /\btan\(([^()]*(?:\([^()]*\))*[^()]*)\)/g,
          (_, angle) => `tan(${this.convertToRadians(angle)})`
        );

      // Inverse trigonometric functions
      result = result
        .replace(/\basin\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`asin(${value})`)
        )
        .replace(/\bacos\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`acos(${value})`)
        )
        .replace(/\batan\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`atan(${value})`)
        );

      // Hyperbolic functions (these are supported by mathjs)
      result = result
        .replace(/\bsinh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'sinh($1)')
        .replace(/\bcosh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'cosh($1)')
        .replace(/\btanh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'tanh($1)')
        .replace(/\basinh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'asinh($1)')
        .replace(/\bacosh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'acosh($1)')
        .replace(/\batanh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'atanh($1)');

      // Process inverse reciprocal functions FIRST (most specific)
      // Inverse reciprocal trigonometric functions
      result = result
        .replace(/\bacsc\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`asin(1/(${value}))`)
        )
        .replace(/\basec\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`acos(1/(${value}))`)
        )
        .replace(/\bacot\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`atan(1/(${value}))`)
        );

      // Inverse reciprocal hyperbolic functions - simplified
      result = result
        .replace(/\bacsch\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'asinh(1/($1))')
        .replace(/\basech\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'acosh(1/($1))')
        .replace(/\bacoth\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'atanh(1/($1))');

      // Then process regular reciprocal functions
      // Reciprocal trigonometric functions
      result = result
        .replace(
          /\bcsc\(([^()]*(?:\([^()]*\))*[^()]*)\)/g,
          (_, angle) => `1/sin(${this.convertToRadians(angle)})`
        )
        .replace(
          /\bsec\(([^()]*(?:\([^()]*\))*[^()]*)\)/g,
          (_, angle) => `1/cos(${this.convertToRadians(angle)})`
        )
        .replace(
          /\bcot\(([^()]*(?:\([^()]*\))*[^()]*)\)/g,
          (_, angle) => `1/tan(${this.convertToRadians(angle)})`
        );

      // Reciprocal hyperbolic functions
      result = result
        .replace(/\bcsch\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/sinh($1)')
        .replace(/\bsech\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/cosh($1)')
        .replace(/\bcoth\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/tanh($1)');

      changed = before !== result;
      iteration++;
    }

    return result;
  }

  /**
   * Handle other mathematical functions
   */
  private handleMathematicalFunctions(expr: string): string {
    let result = expr;

    // Logarithmic and exponential functions
    result = result
      .replace(/(?<!a)log\(([^)]+)\)/g, 'log10($1)') // Avoid replacing 'alog'
      .replace(/ln\(([^)]+)\)/g, 'log($1)') // ln is natural log in mathjs
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
      .replace(/dms\(([^)]+)\)/g, (_, value) => {
        return `floor(${value}) + (floor((${value} - floor(${value})) * 60) / 100) + (((${value} - floor(${value})) * 60 - floor((${value} - floor(${value})) * 60)) * 60 / 10000)`;
      })
      .replace(/deg\(([^)]+)\)/g, (_, value) => {
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
    return expr.replace(/×/g, '*').replace(/÷/g, '/');
  }

  /**
   * Handle mathematical constants like π and e
   * @param {string} expr - The expression to handle constants
   * @returns {string} The expression with constants handled
   */
  private handleConstants(expr: string): string {
    return (
      expr
        .replace(/π/g, 'pi')
        // More specific regex to avoid matching 'e' in function names
        .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'e')
    );
  }

  /**
   * Check for potential domain violations in the original expression
   */
  private checkDomainViolations(originalExpr: string): void {
    // Check for acoth with values that might be in invalid domain
    const acothMatches = originalExpr.match(/acoth\(([^)]+)\)/g);
    if (acothMatches) {
      for (const match of acothMatches) {
        const valueMatch = match.match(/acoth\(([^)]+)\)/);
        if (valueMatch) {
          const valueStr = valueMatch[1];
          try {
            // Try to evaluate just the argument
            const argValue = evaluate(valueStr);
            if (typeof argValue === 'number' && Math.abs(argValue) <= 1) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: acoth(${argValue}) - argument must satisfy |x| > 1`
              );
            }
          } catch (err) {
            // If we can't evaluate the argument, let the main evaluation handle it
            continue;
          }
        }
      }
    }

    // Check for acosh with values < 1
    const acoshMatches = originalExpr.match(/acosh\(([^)]+)\)/g);
    if (acoshMatches) {
      for (const match of acoshMatches) {
        const valueMatch = match.match(/acosh\(([^)]+)\)/);
        if (valueMatch) {
          const valueStr = valueMatch[1];
          try {
            const argValue = evaluate(valueStr);
            if (typeof argValue === 'number' && argValue < 1) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: acosh(${argValue}) - argument must be ≥ 1`
              );
            }
          } catch (err) {
            continue;
          }
        }
      }
    }

    // Check for atanh with |x| >= 1
    const atanhMatches = originalExpr.match(/atanh\(([^)]+)\)/g);
    if (atanhMatches) {
      for (const match of atanhMatches) {
        const valueMatch = match.match(/atanh\(([^)]+)\)/);
        if (valueMatch) {
          const valueStr = valueMatch[1];
          try {
            const argValue = evaluate(valueStr);
            if (typeof argValue === 'number' && Math.abs(argValue) >= 1) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: atanh(${argValue}) - argument must satisfy |x| < 1`
              );
            }
          } catch (err) {
            continue;
          }
        }
      }
    }

    // Check for asin/acos with |x| > 1
    const asinMatches = originalExpr.match(/asin\(([^)]+)\)/g);
    if (asinMatches) {
      for (const match of asinMatches) {
        const valueMatch = match.match(/asin\(([^)]+)\)/);
        if (valueMatch) {
          const valueStr = valueMatch[1];
          try {
            const argValue = evaluate(valueStr);
            if (typeof argValue === 'number' && Math.abs(argValue) > 1) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: asin(${argValue}) - argument must satisfy |x| ≤ 1`
              );
            }
          } catch (err) {
            continue;
          }
        }
      }
    }

    const acosMatches = originalExpr.match(/acos\(([^)]+)\)/g);
    if (acosMatches) {
      for (const match of acosMatches) {
        const valueMatch = match.match(/acos\(([^)]+)\)/);
        if (valueMatch) {
          const valueStr = valueMatch[1];
          try {
            const argValue = evaluate(valueStr);
            if (typeof argValue === 'number' && Math.abs(argValue) > 1) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: acos(${argValue}) - argument must satisfy |x| ≤ 1`
              );
            }
          } catch (err) {
            continue;
          }
        }
      }
    }

    // Check for sqrt with negative values
    const sqrtMatches = originalExpr.match(/√\(([^)]+)\)/g);
    if (sqrtMatches) {
      for (const match of sqrtMatches) {
        const valueMatch = match.match(/√\(([^)]+)\)/);
        if (valueMatch) {
          const valueStr = valueMatch[1];
          try {
            const argValue = evaluate(valueStr);
            if (typeof argValue === 'number' && argValue < 0) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: √(${argValue}) - argument must be ≥ 0`
              );
            }
          } catch (err) {
            continue;
          }
        }
      }
    }

    // Check for log functions with non-positive values
    const logMatches = originalExpr.match(/(log|ln)\(([^)]+)\)/g);
    if (logMatches) {
      for (const match of logMatches) {
        const valueMatch = match.match(/(log|ln)\(([^)]+)\)/);
        if (valueMatch) {
          const funcName = valueMatch[1];
          const valueStr = valueMatch[2];
          try {
            const argValue = evaluate(valueStr);
            if (typeof argValue === 'number' && argValue <= 0) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: ${funcName}(${argValue}) - argument must be > 0`
              );
            }
          } catch (err) {
            continue;
          }
        }
      }
    }
  }

  /**
   * Formats a numeric result according to calculator settings
   * @param {number} result - The numeric result to format
   * @returns {string} The formatted result as a string
   */
  formatResult(result: number): string {
    if (result === undefined || result === null || !isFinite(result))
      return 'Error';

    try {
      // Use scientific notation if enabled
      if (this.notationMode === 'SCI') {
        return format(result, {
          precision: this.settings.display?.precision || 10,
          notation: 'exponential',
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
          notation: 'exponential',
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
        notation: 'fixed',
      });

      return CalculatorUtils.trimUnnecessaryZeros(formattedDecimal);
    } catch (err) {
      console.error('Formatting error:', err);
      return result.toString();
    }
  }
}
