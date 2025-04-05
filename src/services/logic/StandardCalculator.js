import { ICalculator } from "@/utils/core/ICalculator";
import { StandardOperations } from "@/utils/operations/StandardOperations";
import { StandardCalculations } from "@/utils/calculations/StandardCalculations";

export class StandardCalculator extends ICalculator {
  constructor(settings) {
    super(settings);
    // Use composition for calculations and operations
    this.calculations = new StandardCalculations(settings);
    this.operations = new StandardOperations(this);
  }

  evaluateExpression(expr) {
    return this.calculations.evaluateExpression(expr);
  }

  formatResult(result) {
    return this.calculations.formatResult(result);
  }

  handleEquals() {
    try {
      this.currentExpression = this.input;
      const result = this.evaluateExpression(this.currentExpression);
      this.input = this.formatResult(result);

      return {
        expression: this.currentExpression,
        result: this.input,
        input: this.input,
        error: this.error
      };
    } catch (err) {
      return this.createErrorResponse(err);
    }
  }

  handleOperator(op) {
    return this.operations.handleOperator(op);
  }

  handleNumber(num) {
    return this.operations.handleNumber(num);
  }

  handleBackspace() {
    return this.operations.handleBackspace();
  }

  // Additional specialized methods
  handleSquare() {
    return this.operations.handleSquare();
  }

  handleSquareRoot() {
    return this.operations.handleSquareRoot();
  }

  handleReciprocal() {
    return this.operations.handleReciprocal();
  }

  handlePercentage() {
    return this.operations.handlePercentage();
  }
}
