import { ref, nextTick, reactive } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { StandardCalculator } from '@/services/logic/StandardCalculator';
import { ProgrammerCalculator } from '@/services/logic/ProgrammerCalculator';
import { useCalculatorState } from './useCalculatorState';
import { Memory } from '@/utils/misc/Memory';

const calculatorTypes = {
  Standard: StandardCalculator,
  Programmer: ProgrammerCalculator,
};

export function useCalculator(mode, settings) {
  const {
    state,
    updateState,
    updateDisplayValues,
    updateMemoryState,
    setActiveBase,
    setAnimation,
    clearState,
  } = useCalculatorState();

  let calculator = ref(null);
  
  // Create separate memory instances for each calculator type
  const memories = reactive({
    Standard: new Memory(),
    Programmer: new Memory()
  });

  const createCalculator = (mode) => {
    const CalculatorClass = calculatorTypes[mode];
    if (!CalculatorClass) {
      console.error(`Invalid calculator mode: ${mode}`);
      return new StandardCalculator(settings);
    }
    
    // Create calculator with the appropriate memory instance
    const calc = new CalculatorClass(settings);
    
    // Replace the default memory with our mode-specific memory
    calc.memory = memories[mode];
    
    return calc;
  };

  // Initialize calculator
  calculator.value = createCalculator(mode);

  // Method to check if memory has value and update state
  const checkMemoryState = (mode) => {
    const hasMemory = memories[mode].recall() !== 0;
    updateMemoryState(mode, hasMemory);
    return hasMemory;
  };
  
  // Check memory states for all calculator types on initialization
  Object.keys(memories).forEach(calcMode => {
    checkMemoryState(calcMode);
  });
  
  const handleMemoryOperation = (operation) => {
    const result = calculator.value.handleButtonClick(operation);
    
    // After any memory operation, check and update memory state
    checkMemoryState(mode);
    
    return result;
  };

  // Debounce display updates to prevent UI jank
  const updateDisplayState = useDebounceFn(() => {
    if (mode === 'Programmer') {
      nextTick(() => {
        const updatedValues = calculator.value.updateDisplayValues();
        if (updatedValues) {
          updateDisplayValues(updatedValues);
          // Only update input if it's different from current state
          if (
            updatedValues[state.value.activeBase]?.input !== state.value.input
          ) {
            updateState({
              input: updatedValues[state.value.activeBase]?.input || '0',
              error: '',
            });
          }
        }
      });
    }
  }, 16);

  return {
    calculator,
    createCalculator,
    state,
    updateState,
    updateDisplayValues,
    setActiveBase,
    setAnimation,
    clearState,
    updateDisplayState,
    handleMemoryOperation,
    checkMemoryState
  };
}
