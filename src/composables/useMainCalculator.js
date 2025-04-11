import { computed, nextTick, watch } from 'vue'
import { useKeyboard } from '@/composables/useKeyboard'
import { useEventListener, useMemoize } from '@vueuse/core'
import { DisplayFormatter } from '@/services/display/DisplayFormatter'
/**
 * Provides unified calculator functionality for MainCalculator component
 * @param {Object} options - Calculator options and dependencies
 * @returns {Object} Calculator operations, preview, and keyboard handlers
 */
export function useMainCalculator({
  calculator,
  state,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  addToHistory,
  handleMemoryOperation,
  toggleHistory,
  isValidForBase
}) {
  /**
   * CALCULATOR OPERATIONS
   */
  
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

  /**
   * PREVIEW CALCULATION
   */
  
  /**
   * Memoized preview calculation function
   */
  const calculatePreview = useMemoize(
    (input, mode, activeBase) => {
      if (input === 'Error' || !input) return '';
      
      try {
        if (mode === 'Programmer') {
          const result = calculator.value.evaluateExpression(input, activeBase);
          return calculator.value.formatResult(result, activeBase);
        } else {
          const result = calculator.value.evaluateExpression(input);
          return calculator.value.formatResult(result);
        }
      } catch (err) {
        return '';
      }
    }, 
    { max: 20 }
  );

  /**
   * Computed preview value with proper formatting
   */
  const preview = computed(() => {
    const rawPreview = calculatePreview(state.input, state.mode, state.activeBase);
    if (!rawPreview) return '';
    
    try {
      // Use DisplayFormatter for consistent formatting
      return DisplayFormatter.format(rawPreview, {
        base: state.activeBase,
        mode: state.mode
      });
    } catch (err) {
      console.error('Error formatting preview:', err);
      return rawPreview.toString();
    }
  });

  /**
   * KEYBOARD HANDLING
   */
  
  const mode = computed(() => state.mode);
  const activeBase = computed(() => state.activeBase);

  /**
   * Set up keyboard handlers
   */
  const { setContext, clearContext } = useKeyboard('calculator', {
    clear: () => handleButtonClick('AC'),
    calculate: () => handleButtonClick('='),
    backspace: () => handleButtonClick('backspace'),
    input: (value) => {
      if (mode.value === 'Programmer') {
        if (isValidForBase(value, activeBase.value)) {
          handleButtonClick(value);
        }
      } else {
        handleButtonClick(value);
      }
    },
    setBase: (base) => {
      if (mode.value === 'Programmer') {
        handleBaseChange(base);
      }
    },
    toggleHistory
  });

  /**
   * Handle keyboard shortcuts for base changes
   */
  const handleKeyboardShortcuts = (e) => {
    if (mode.value !== 'Programmer') return;

    const shortcuts = {
      'ctrl+1': () => handleBaseChange('HEX'),
      'ctrl+2': () => handleBaseChange('DEC'),
      'ctrl+3': () => handleBaseChange('OCT'),
      'ctrl+4': () => handleBaseChange('BIN')
    };

    const combo = [
      e.ctrlKey && 'ctrl',
      e.shiftKey && 'shift',
      e.altKey && 'alt',
      e.key
    ]
      .filter(Boolean)
      .join('+');

    if (shortcuts[combo]) {
      e.preventDefault();
      shortcuts[combo]();
    }
  };

  // Add keyboard event listener
  useEventListener('keydown', handleKeyboardShortcuts);

  // Watch for mode changes
  watch(
    mode,
    (newMode) => {
      if (newMode === 'Programmer') {
        setContext('programmer');
      } else {
        clearContext('programmer');
      }
    },
    { immediate: true }
  );

  // Format animated result for display
  const animatedResult = computed(() => {
    if (!state.animatedResult) return "";
    
    try {
      return DisplayFormatter.format(state.animatedResult, {
        base: state.activeBase,
        mode: state.mode
      });
    } catch (err) {
      return state.animatedResult;
    }
  });

  return {
    handleButtonClick,
    handleClear,
    handleBaseChange,
    updateDisplayFn,
    preview,
    animatedResult
  };
}
