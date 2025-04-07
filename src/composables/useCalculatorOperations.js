import { nextTick } from 'vue'

/**
 * Provides calculator operation handlers
 * @param {Object} options - Options
 * @returns {Object} Operation handlers
 */
export function useCalculatorOperations({
  calculator,
  state,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  addToHistory,
  handleMemoryOperation
}) {
  /**
   * Handle button clicks
   * @param {string} btn - Button value
   */
  const handleButtonClick = (btn) => {
    try {
      let result;

      // Handle memory operations
      if (['MC', 'MR', 'M+', 'M-', 'MS'].includes(btn)) {
        result = handleMemoryOperation({
          operation: btn,
          mode: state.mode,
          calculator: calculator.value,
          currentInput: state.input,
          activeBase: state.activeBase
        });

        // Update state based on memory operation result
        updateState({
          input: result.input,
          error: result.error || ""
        });

        // For Programmer mode memory recall, update display values
        if (result.displayValues) {
          nextTick(() => {
            updateDisplayValues(result.displayValues);
          });
        }
        
        return;
      } else {
        // Use calculator's button click handler
        result = calculator.value.handleButtonClick(btn);
      }

      // Update state with result
      updateState({
        input: result.input,
        error: result.error || ""
      });

      // Handle special cases for Programmer mode
      if (btn === "=" && state.mode === "Programmer") {
        if (result.displayValues) {
          updateDisplayValues(result.displayValues);
          setAnimation(result.result);
        }
      } else if (state.mode === "Programmer") {
        // Update display values for programmer mode
        nextTick(() => updateDisplayFn());
      }

      // Add to history for standard mode calculations
      if (btn === "=" && state.mode !== "Programmer" && result.result) {
        addToHistory(result.expression, result.result);
        setAnimation(result.result);
      }
    } catch (err) {
      console.error("Calculator operation error:", err);
      updateState({
        input: "Error",
        error: "Operation failed"
      });
    }
  };

  /**
   * Handle clear button
   */
  const handleClear = () => {
    const result = calculator.value.handleButtonClick('AC');
    updateState({
      input: result.input,
      error: ''
    });

    if (state.mode === 'Programmer') {
      updateDisplayFn();
    }
  };

  /**
   * Handle base change for programmer mode
   * @param {string} newBase - New base
   */
  const handleBaseChange = (newBase) => {
    if (state.mode === 'Programmer') {
      const result = calculator.value.handleBaseChange(newBase);
      nextTick(() => {
        setActiveBase(newBase);
        updateState({
          input: result.input,
          error: result.error || '',
          displayValues: result.displayValues
        });
      });
    }
  };

  /**
   * Update programmer display values
   */
  const updateDisplayFn = () => {
    if (state.mode === 'Programmer' && state.input !== 'Error') {
      try {
        const updatedValues = calculator.value.updateDisplayValues(state.input);
        updateDisplayValues(updatedValues);
      } catch (error) {
        console.error('Error updating display values:', error);
      }
    }
  };

  return {
    handleButtonClick,
    handleClear,
    handleBaseChange,
    updateDisplayFn
  };
}
