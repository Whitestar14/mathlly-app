import { useSettingsStore } from '@/stores/settings';

export class CalculatorCore {
  constructor(settings) {
    // Fallback to settings store if not provided
    this.settings = settings || useSettingsStore(); 
    this.input = "0";
    this.error = "";
    this.currentExpression = "";
    this.activeBase = "DEC";
    this.MAX_INPUT_LENGTH = 50;
  }

  // Must be implemented by child classes. Expect an expression string.
  evaluateExpression() {
    throw new Error("evaluateExpression must be implemented in child class.");
  }

  // Must be implemented by child classes.
  formatResult() {
    throw new Error("formatResult must be implemented in child class.");
  }

  // Must be implemented by child classes.
  handleEquals() {
    throw new Error("handleEquals must be implemented in child class.");
  }

  // Must be implemented by child classes.
  handleOperator() {
    throw new Error("handleOperator must be implemented in child class.");
  }

  // Must be implemented by child classes.
  handleNumber() {
    throw new Error("handleNumber must be implemented in child class.");
  }
}
