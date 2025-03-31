// composables/useCalculatorState.js
import { ref } from 'vue';

export function useCalculatorState() {
  const state = ref({
    input: '0',
    error: '',
    preview: '',
    isAnimating: false,
    animatedResult: '',
    activeBase: 'DEC',
    displayValues: {
      HEX: { input: '0', display: '0' },
      DEC: { input: '0', display: '0' },
      OCT: { input: '0', display: '0' },
      BIN: { input: '0', display: '0' },
    },
    currentExpression: '',
    memoryStates: {
      Standard: false,
      Programmer: false
    }
  });

  // Add method to update memory state for a specific calculator type
  const updateMemoryState = (calculatorType, hasMemory) => {
    const updatedMemoryStates = { ...state.value.memoryStates };
    updatedMemoryStates[calculatorType] = hasMemory;
    
    updateState({
      memoryStates: updatedMemoryStates
    });
  };

  const updateDisplayValues = (values) => {
    const updatedDisplayValues = { ...state.value.displayValues };
    Object.keys(values).forEach(base => {
      updatedDisplayValues[base] = values[base];
    });

    // Update both displayValues and input to ensure consistency
    updateState({
      displayValues: updatedDisplayValues,
      input: values[state.value.activeBase]?.input || state.value.input,
    });
  };

  const updateState = (newState) => {
    state.value = {
      ...state.value,
      ...newState,
    }
  }

  const getCurrentDisplayValue = () => {
    return state.value.displayValues[state.value.activeBase] || { input: '0', display: '0' };
  };

  const setActiveBase = (base) => {
    if (!['HEX', 'DEC', 'OCT', 'BIN'].includes(base)) return;
    updateState({
      activeBase: base,
      input: state.value.displayValues[base]?.input || '0',
    });
  };

  const setAnimation = (result) => {
    updateState({
      animatedResult: result,
      isAnimating: true,
    });
    setTimeout(() => {
      updateState({
        isAnimating: false,
        animatedResult: '',
      });
    }, 500);
  };

  const clearState = () => {
    // Save current memory states
    const currentMemoryStates = { ...state.value.memoryStates };
    
    const defaultState = {
      input: '0',
      preview: '',
      error: '',
      displayValues: {
        HEX: { input: '0', display: '0' },
        DEC: { input: '0', display: '0' },
        OCT: { input: '0', display: '0' },
        BIN: { input: '0', display: '0' },
      },
      activeBase: 'DEC',
      currentExpression: '',
      // Restore memory states
      memoryStates: currentMemoryStates
    };
  
    // Reset state based on calculator mode
    updateState(defaultState);
  };
  

  return {
    state,
    getCurrentDisplayValue,
    updateState,
    updateDisplayValues,
    updateMemoryState,
    setActiveBase,
    setAnimation,
    clearState,
  };
}