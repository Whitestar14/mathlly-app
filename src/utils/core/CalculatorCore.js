import { Memory } from "./Memory";
import { useSettingsStore } from '@/stores/settings';

export class CalculatorCore {
  constructor(settings) {
    // Fallback to settings store if not provided
    this.settings = settings || useSettingsStore(); 
    this.memory = new Memory();
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

  // Memory functions (shared by all calculators)
  handleMemoryClear() {
    this.memory.clear();
    return { input: this.input, error: this.error };
  }

  handleMemoryRecall() {
    const value = this.memory.recall();
    if (value !== null) {
      this.input = this.formatResult(value);
    }
    return { input: this.input, error: this.error };
  }

  handleMemoryAdd() {
    try {
      const currentValue = this.evaluateExpression(this.input);
      if (!this.memory.add(currentValue)) {
        this.error = "Memory operation failed";
      }
    } catch (err) {
      this.error = "Memory operation failed";
    }
    return { input: this.input, error: this.error };
  }

  handleMemorySubtract() {
    try {
      const currentValue = this.evaluateExpression(this.input);
      if (!this.memory.subtract(currentValue)) {
        this.error = "Memory operation failed";
      }
    } catch (err) {
      this.error = "Memory operation failed";
    }
    return { input: this.input, error: this.error };
  }

  handleMemoryStore() {
    try {
      const value = this.evaluateExpression(this.input);
      if (!this.memory.store(value)) {
        this.error = "Cannot store in memory";
      }
    } catch (err) {
      this.error = "Cannot store in memory";
    }
    return { input: this.input, error: this.error };
  }
}
