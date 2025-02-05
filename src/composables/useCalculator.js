import { ref } from 'vue'
import { BasicCalculator } from '@/utils/BasicCalculator'
import { StandardCalculator } from '@/utils/StandardCalculator'
import { ProgrammerCalculator } from '@/utils/ProgrammerCalculator'
import { useCalculatorState } from './useCalculatorState'

const calculatorTypes = {
  'Basic': BasicCalculator,
  'Standard': StandardCalculator,
  'Programmer': ProgrammerCalculator
};

export function useCalculator(mode, settings) {
  const {
    state,
    updateState,
    updateDisplayValues,
    setActiveBase,
    setAnimation,
    clearState
  } = useCalculatorState()

  const calculator = ref(null);
  
  const createCalculator = (mode) => {
    const CalculatorClass = calculatorTypes[mode];
    if (!CalculatorClass) {
      console.error(`Invalid calculator mode: ${mode}`);
      return new BasicCalculator(settings);
    }
    return new CalculatorClass(settings);
  };
  
  // Initialize calculator
  calculator.value = createCalculator(mode);

  const updateDisplayState = () => {
    if (mode === "Programmer") {
      const updatedValues = calculator.value.updateDisplayValues();
      if (updatedValues) {
        updateDisplayValues(updatedValues);
        // Only update input if it's different from current state
        if (updatedValues[state.value.activeBase]?.input !== state.value.input) {
          updateState({
            input: updatedValues[state.value.activeBase]?.input || "0",
            error: ""
          });
        }
      }
    }
  };

  return {
    calculator,
    createCalculator,
    state,
    updateState,
    updateDisplayValues,
    setActiveBase,
    setAnimation,
    clearState,
    updateDisplayState
  }
}