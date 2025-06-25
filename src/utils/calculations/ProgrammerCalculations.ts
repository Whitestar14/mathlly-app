import { isNegative, isNaN } from 'mathjs';
import { ExpressionEvaluator } from '@/utils/core/ExpressionEvaluator.ts';
import { CalculatorConstants, BaseType } from '@/utils/constants/CalculatorConstants.ts';
import { CalculatorUtils } from '../constants/CalculatorUtils';

/**
 * Handles calculations for programmer calculator
 */
export class ProgrammerCalculations {
  settings: any;
  bases: Record<BaseType, number>;
  evaluator: ExpressionEvaluator;

  constructor(settings: any) {
    this.settings = settings;
    this.bases = CalculatorConstants.BASES;
    this.evaluator = ExpressionEvaluator.getInstance();
  }

  evaluateExpression(expr: string, base: BaseType): number {
    try {
      const sanitizedExpr = CalculatorUtils.sanitizeExpression(expr);
      return this.evaluator.evaluate(sanitizedExpr, { base });
    } catch (err: any) {
      throw new Error(CalculatorUtils.formatError(err, "Invalid expression"));
    }
  }

  formatResult(result: number, base: BaseType): string {
    if (!result && result !== 0) return 'Overflow';
    try {
      return CalculatorUtils.formatForBase(
        isNegative(result) ? -Math.abs(result) : Math.abs(result),
        base
      );
    } catch (err) {
      console.error('Error formatting result:', err);
      return 'Overflow';
    }
  }

  convertToBase(value: string | number, fromBase: BaseType, toBase: BaseType): string {
    try {
      if (!value || value === 'Overflow') return '0';
      const isNeg = typeof value === 'string' && value.startsWith('-');
      const absValue = isNeg ? value.substring(1) : value;
      if (typeof absValue !== 'string') return '0';
      if (!CalculatorUtils.isValidForBase(absValue, fromBase)) {
        return '0';
      }
      const decimal = parseInt(absValue.toString(), this.bases[fromBase]);
      if (isNaN(decimal)) return '0';
      if (CalculatorConstants.MAX_VALUE && (typeof decimal === 'number') && (CalculatorConstants.MAX_VALUE.lt ? CalculatorConstants.MAX_VALUE.lt(Math.abs(decimal)) : Math.abs(decimal) > (CalculatorConstants.MAX_VALUE as any))) return 'Overflow';
      const result = CalculatorUtils.formatForBase(decimal, toBase);
      return isNeg ? '-' + result : result;
    } catch (err) {
      console.error('Error converting between bases:', err);
      return '0';
    }
    return '0';
  }
}
