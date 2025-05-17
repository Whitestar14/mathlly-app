import { computed, nextTick, watch, shallowRef } from 'vue'
import { useKeyboard } from '@/composables/useKeyboard'
import { useEventListener, useMemoize, useThrottleFn } from '@vueuse/core'
import { DisplayFormatter } from '@/services/display/DisplayFormatter'

/**
 * Provides unified calculator functionality for MainCalculator component
 */
export function CalculatorController({
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
  // Use throttled functions for better performance
  const throttledUpdateDisplay = useThrottleFn(updateDisplayFn, 100)
  
  /**
   * Handle button clicks with performance optimizations
   */
  const handleButtonClick = (btn) => {
    try {
      // Handle memory operations
      if (['MC', 'MR', 'M+', 'M-', 'MS'].includes(btn)) {
        const result = handleMemoryOperation({
          operation: btn,
          mode: state.mode,
          calculator: calculator.value,
          currentInput: state.input,
          activeBase: state.activeBase
        });

        updateState({
          input: result.input,
          error: result.error || ""
        });

        // For Programmer mode memory recall, update display values
        if (result.displayValues) {
          nextTick(() => updateDisplayValues(result.displayValues));
        }
        
        return;
      }
      
      // Use calculator's button click handler
      const result = calculator.value.handleButtonClick(btn);

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
        // Update display values for programmer mode - throttled for performance
        nextTick(() => throttledUpdateDisplay());
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
   * Handle clear button - simplified
   */
  const handleClear = () => {
    const result = calculator.value.handleButtonClick('AC');
    updateState({
      input: result.input,
      error: ''
    });

    if (state.mode === 'Programmer') {
      throttledUpdateDisplay();
    }
  };

  /**
   * Handle base change for programmer mode - optimized
   */
  const handleBaseChange = (newBase) => {
    if (state.mode === 'Programmer') {
      const result = calculator.value.handleBaseChange(newBase);
      setActiveBase(newBase);
      
      updateState({
        input: result.input,
        error: result.error || '',
        displayValues: result.displayValues
      });
    }
  };

  /**
   * Update programmer display values - extracted for throttling
   */
  function updateDisplayFn() {
    if (state.mode === 'Programmer' && state.input !== 'Error') {
      try {
        const updatedValues = calculator.value.updateDisplayValues(state.input);
        updateDisplayValues(updatedValues);
      } catch (error) {
        console.error('Error updating display values:', error);
      }
    }
  }

  /**
   * Memoized preview calculation function with improved caching
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
    { max: 200, ttl: 10000 } // Increased cache size and TTL for better performance
  );

  /**
   * Computed preview value with proper formatting - using shallowRef for better performance
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

  // Use shallowRef for better performance
  const mode = shallowRef(state.mode);
  const activeBase = shallowRef(state.activeBase);

  /**
   * Set up keyboard handlers
   */
  const { setContext, clearContext } = useKeyboard('calculator', {
    clear: handleClear,
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
    setBase: handleBaseChange,
    toggleHistory
  });

  // Watch for mode changes - optimized with shallowRef
  watch(
    () => state.mode,
    (newMode) => {
      mode.value = newMode;
      if (newMode === 'Programmer') {
        setContext('programmer');
      } else {
        clearContext('programmer');
      }
    },
    { immediate: true }
  );

  // Watch for activeBase changes - optimized with shallowRef
  watch(
    () => state.activeBase,
    (newBase) => {
      activeBase.value = newBase;
    }
  );

  /**
   * Handle keyboard shortcuts for base changes - throttled for performance
   */
  const handleKeyboardShortcuts = useThrottleFn((e) => {
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
  }, 100);

  // Add keyboard event listener
  useEventListener('keydown', handleKeyboardShortcuts);

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
    updateDisplayFn: throttledUpdateDisplay,
    preview,
    animatedResult
  };
}
