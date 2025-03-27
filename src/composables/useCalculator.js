import { ref } from 'vue';
import { StandardCalculator } from '@/services/logic/StandardCalculator';
import { ProgrammerCalculator } from '@/services/logic/ProgrammerCalculator';
import { useCalculatorState } from './useCalculatorState';

const calculatorTypes = {
  Standard: StandardCalculator,
  Programmer: ProgrammerCalculator,
};

export function useCalculator(mode, settings) {
  const {
    state,
    updateState,
    updateDisplayValues,
    setActiveBase,
    setAnimation,
    clearState,
  } = useCalculatorState();

  let calculator = ref(null);

  const createCalculator = (mode) => {
    const CalculatorClass = calculatorTypes[mode];
    if (!CalculatorClass) {
      console.error(`Invalid calculator mode: ${mode}`);
      return new StandardCalculator(settings);
    }
    return new CalculatorClass(settings);
  };

  // Initialize calculator
  calculator.value = createCalculator(mode);

  const updateDisplayState = () => {
    if (mode === 'Programmer') {
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
    updateDisplayState,
  };
}
