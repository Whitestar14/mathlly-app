// composables/useCalculatorState.js
import { ref, computed } from 'vue';

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
  });

  const getCurrentDisplayValue = computed(() => {
    return state.value.displayValues[state.value.activeBase]?.input || '0';
  });

  const updateState = (newState) => {
    state.value = {
      ...state.value,
      ...newState,
    };
  };

  // Update useCalculatorState's updateDisplayValues
  const updateDisplayValues = (values) => {
    if (!values) return;

    const updatedDisplayValues = { ...state.value.displayValues };

    Object.keys(values).forEach((base) => {
      if (updatedDisplayValues[base]) {
        updatedDisplayValues[base] = {
          ...updatedDisplayValues[base],
          ...values[base],
        };
      }
    });

    // Update both displayValues and input to ensure consistency
    updateState({
      displayValues: updatedDisplayValues,
      input: values[state.value.activeBase]?.input || state.value.input,
    });
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
    };

    // Reset state based on calculator mode
    updateState(defaultState);
  };

  return {
    state,
    getCurrentDisplayValue,
    updateState,
    updateDisplayValues,
    setActiveBase,
    setAnimation,
    clearState,
  };
}
