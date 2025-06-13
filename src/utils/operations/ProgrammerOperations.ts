import { ParenthesesTracker } from "@/utils/core/ParenthesesTracker.ts";
import { CalculatorConstants, CalculatorUtils } from "@/utils/constants/CalculatorConstants.ts";

/**
 * Handles operations for the programmer calculator mode
 */
export class ProgrammerOperations {
  calculator: any;
  parenthesesTracker: ParenthesesTracker;

  constructor(calculator: any) {
    this.calculator = calculator;
    this.parenthesesTracker = new ParenthesesTracker();
  }

  // --- Helper methods must be defined before use in TS ---
  isLastCharOperator(): boolean {
    const input = this.calculator.states[this.calculator.activeBase].input.trim();
    return CalculatorUtils.endsWithOperator(input) || 
           (/-$/.test(input) && !/-\d+$/.test(input)) ||
           input.endsWith(" << ") || 
           input.endsWith(" >> ") || 
           input.endsWith(" % ");
  }

  isLastCharNumber(): boolean {
    return CalculatorConstants.REGEX.NUMBER.test(
      this.calculator.states[this.calculator.activeBase].input.slice(-1)
    );
  }

  isLastCharClosingParenthesis(): boolean {
    return this.calculator.states[this.calculator.activeBase].input.trim().endsWith(")");
  }

  createResponse(input: string, error?: string): Record<string, any> {
    return CalculatorUtils.createResponse({
      input: input,
      error: error,
      expression: this.calculator.currentExpression
    });
  }

  createErrorResponse(err: any): Record<string, any> {
    console.error('[ProgrammerOperations] Error:', err);
    return {
      input: this.calculator.states[this.calculator.activeBase].input,
      error: CalculatorUtils.formatError(err, "Operation error"),
      expression: this.calculator.currentExpression
    };
  }

  handleNumber(num: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;
      if (currentInput === "0" || currentInput === "Error") {
        state.input = num;
      } else if (this.isLastCharClosingParenthesis()) {
        state.input += ` × ${num}`;
      } else {
        state.input += num;
      }
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleOperator(op: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      if ((currentInput === "" || this.isLastCharOperator()) && op === "-") {
        state.input = currentInput ? `${currentInput} ${op}` : op;
        return this.createResponse(state.input);
      }
      if (currentInput === "" && op !== "-") {
        return this.createResponse(state.input);
      }
      // Accept any string for op, but only handle shift ops if they are in the allowed set
      if (Array.from(CalculatorConstants.BUTTON_TYPES.PROGRAMMER_OPERATORS).includes(op)) {
        return this.handleShiftOperator(op);
      }
      return this.handleBasicOperator(op);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleShiftOperator(op: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      if (!currentInput || currentInput === "Error") {
        return this.createErrorResponse(new Error(CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION));
      }
      if (currentInput.endsWith("(")) {
        return this.createResponse(state.input);
      }
      const lastPart = CalculatorUtils.getLastExpressionPart(currentInput);
      if (!lastPart || CalculatorConstants.REGEX.OPERATOR.test(lastPart)) {
        return this.createResponse(state.input);
      }
      let newInput;
      if (this.isLastCharClosingParenthesis()) {
        newInput = `${currentInput.trim()} ${op} `;
      } else if (/>>\s*$|<<\s*$/.test(currentInput)) {
        newInput = currentInput.replace(/\s*(?:<<|>>)\s*$/, ` ${op} `);
      } else if (this.isLastCharNumber()) {
        newInput = `${currentInput.trim()} ${op} `;
      } else {
        return this.createErrorResponse(new Error(CalculatorConstants.ERROR_MESSAGES.INVALID_EXPRESSION));
      }
      state.input = newInput;
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleBasicOperator(op: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      if (this.isLastCharClosingParenthesis()) {
        state.input = `${currentInput} ${op} `;
        return this.createResponse(state.input);
      }
      if (this.isLastCharOperator()) {
        state.input = CalculatorUtils.removeLastOperator(currentInput) + ` ${op} `;
        return this.createResponse(state.input);
      }
      if (currentInput.endsWith("(")) {
        return this.createResponse(state.input);
      }
      state.input = `${currentInput} ${op} `;
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleParenthesis(parenthesis: string): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      const position = currentInput.length;
      if (parenthesis === "(") {
        this.handleOpenParenthesis(currentInput, position);
      } else if (parenthesis === ")" && this.canCloseParenthesis(currentInput)) {
        this.handleCloseParenthesis(currentInput, position);
      }
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  canCloseParenthesis(expr: string): boolean {
    if (this.parenthesesTracker.getOpenCount() <= 0) return false;
    if (!expr.trim()) return false;
    const lastOpenIndex = expr.lastIndexOf("(");
    if (lastOpenIndex === -1) return false;
    const contentAfterOpen = expr.slice(lastOpenIndex + 1).trim();
    if (!contentAfterOpen) return false;
    const lastContent = contentAfterOpen.trim();
    if (lastContent.endsWith('<<') || lastContent.endsWith('>>')) return false;
    const lastChar = expr.trim().slice(-1);
    return /[0-9A-Fa-f)]/.test(lastChar);
  }

  handleOpenParenthesis(currentInput: string, position: number): void {
    const state = this.calculator.states[this.calculator.activeBase];
    if (currentInput === "0" || currentInput === "Error") {
      state.input = "(";
      this.parenthesesTracker.open(position);
    } else {
      const lastChar = currentInput.slice(-1);
      const needsMultiplication = /[0-9A-Fa-f)]/.test(lastChar);
      const newInput = `${currentInput}${needsMultiplication ? " × " : " "}(`;
      state.input = newInput;
      this.parenthesesTracker.open(position + (needsMultiplication ? 3 : 1));
    }
  }

  handleCloseParenthesis(currentInput: string, position: number): void {
    this.calculator.states[this.calculator.activeBase].input = `${currentInput})`;
    this.parenthesesTracker.close(position);
  }

  handleBackspace(): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;
      if (currentInput === "0" || currentInput === "Error") {
        return this.createResponse(state.input);
      }
      const beforeBackspace = currentInput;
      if (this.handleSpecialBackspace(currentInput)) {
        return this.createResponse(state.input);
      }
      this.handleDefaultBackspace(currentInput);
      if (state.input === beforeBackspace) {
        console.debug('[ProgrammerOperations] Backspace had no effect');
      }
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleSpecialBackspace(currentInput: string): boolean {
    const state = this.calculator.states[this.calculator.activeBase];
    if (currentInput.match(/\s*[<>]{2}\s*$/)) {
      state.input = currentInput.replace(/\s*[<>]{2}\s*$/, '');
      return true;
    }
    if (CalculatorUtils.endsWithOperator(currentInput)) {
      state.input = CalculatorUtils.removeLastOperator(currentInput);
      return true;
    }
    return false;
  }

  handleDefaultBackspace(currentInput: string): void {
    const state = this.calculator.states[this.calculator.activeBase];
    if (currentInput.length === 1) {
      state.input = "0";
    } else {
      state.input = currentInput.trimEnd().slice(0, -1);
    }
  }

  handleToggleSign(): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input;
      if (currentInput !== "0" && currentInput !== "Error") {
        const parts = CalculatorUtils.splitExpression(currentInput);
        const lastPart = parts[parts.length - 1].trim();
        if (lastPart) {
          if (lastPart.startsWith("-")) {
            parts[parts.length - 1] = lastPart.slice(1);
          } else {
            parts[parts.length - 1] = "-" + lastPart;
          }
          state.input = parts.join(" ").trim();
        }
      }
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  handleModuloSign(): Record<string, any> {
    try {
      const state = this.calculator.states[this.calculator.activeBase];
      const currentInput = state.input.trim();
      if (!currentInput || currentInput === "0" || currentInput === "Error") {
        return this.createResponse(state.input);
      }
      if (currentInput.endsWith("(")) {
        return this.createResponse(state.input);
      }
      if (this.isLastCharClosingParenthesis() || this.isLastCharNumber()) {
        state.input = `${currentInput} % `;
        return this.createResponse(state.input);
      }
      if (this.isLastCharOperator()) {
        state.input = CalculatorUtils.removeLastOperator(currentInput) + " % ";
        return this.createResponse(state.input);
      }
      return this.createResponse(state.input);
    } catch (err: any) {
      return this.createErrorResponse(err);
    }
  }

  getParenthesesCount(): number {
    return this.parenthesesTracker.getOpenCount();
  }

  resetParentheses(): void {
    this.parenthesesTracker = new ParenthesesTracker();
  }
}