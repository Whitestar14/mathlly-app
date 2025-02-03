export class ProgrammerOperations {
  constructor(state) {
    this.state = state;
  }

  handleNumber(num) {
    const currentState = this.state.getState();
    if (currentState.input === "0" || currentState.input === "Error") {
      this.state.setState(this.state.activeBase, { 
        ...currentState,
        input: num 
      });
      return;
    }
    
    this.state.setState(this.state.activeBase, {
      ...currentState,
      input: currentState.input + num
    });
  }

  handleOperator(op) {
    const currentState = this.state.getState();
    const isLastCharOp = /[+\-×÷<<>>]\s*$/.test(currentState.input);
    
    if (op === "<<" || op === ">>") {
      this.handleShiftOperator(op, isLastCharOp);
      return;
    }

    this.handleBasicOperator(op, isLastCharOp);
  }

  handleShiftOperator(op, isLastCharOp) {
    const currentState = this.state.getState();
    if (isLastCharOp) {
      const newInput = currentState.input.replace(/\s*[+\-×÷<<>>]\s*$/, ` ${op} `);
      this.state.setState(this.state.activeBase, { ...currentState, input: newInput });
    } else if (!currentState.input.endsWith("(")) {
      this.state.setState(this.state.activeBase, {
        ...currentState,
        input: `${currentState.input} ${op} `
      });
    }
  }

  handleBasicOperator(op, isLastCharOp) {
    const currentState = this.state.getState();
    if (!isLastCharOp && !currentState.input.endsWith("(")) {
      this.state.setState(this.state.activeBase, {
        ...currentState,
        input: `${currentState.input} ${op} `
      });
    } else if (isLastCharOp) {
      const newInput = currentState.input.replace(/\s*[+\-×÷<<>>]\s*$/, ` ${op} `);
      this.state.setState(this.state.activeBase, { ...currentState, input: newInput });
    }
  }

  // Add other operation handlers as needed...
}
