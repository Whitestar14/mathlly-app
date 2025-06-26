import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { evaluate, bignumber, type BigNumber } from 'mathjs';
import type { CalculatorMode } from '@/composables/useCalculatorState';
import type { Calculator } from '@/services/factory/CalculatorFactory';

// Types
export interface MemoryValues {
  Standard: number | BigNumber;
  Programmer: number | BigNumber;
  Scientific: number | BigNumber;
}

export interface DisplayValues {
  [key: string]: {
    input: string;
    display: string;
  };
}

export interface MemoryOperationParams {
  mode: CalculatorMode;
  calculator: Calculator;
  currentInput: string;
  activeBase?: string;
}

export interface MemoryOperationResult {
  input: string;
  error?: string;
  displayValues?: DisplayValues;
}

export interface UseMemoryReturn {
  hasMemory: (mode: CalculatorMode) => ComputedRef<boolean>;
  handleMemoryOperation: (params: {
    operation: string;
    mode: CalculatorMode;
    calculator: Calculator;
    currentInput: string;
    activeBase?: string;
  }) => MemoryOperationResult;
}

// Create a shared state for memory across the application
const memoryValues: Ref<MemoryValues> = ref({
  Standard: 0,
  Programmer: 0,
  Scientific: 0,
});

/**
 * Composable for calculator memory operations
 */
export function useMemory(): UseMemoryReturn {
  /**
   * Check if a specific calculator mode has memory
   */
  const hasMemory = (mode: CalculatorMode): ComputedRef<boolean> => 
    computed(() => memoryValues.value[mode] !== 0);

  /**
   * Clear memory for a specific mode
   */
  const clear = (mode: CalculatorMode): boolean => {
    memoryValues.value[mode] = 0;
    return true;
  };

  /**
   * Recall memory value for a specific mode
   */
  const recall = (mode: CalculatorMode): number | BigNumber => {
    return memoryValues.value[mode];
  };

  /**
   * Store value in memory for a specific mode
   */
  const store = (mode: CalculatorMode, value: number | string | BigNumber): boolean => {
    try {
      const numericValue = typeof value === 'object' && value.toString ? value.toString() : value;
      memoryValues.value[mode] = bignumber(numericValue);
      return true;
    } catch (error) {
      console.error('Memory store error:', error);
      return false;
    }
  };

  /**
   * Add value to memory for a specific mode
   */
  const add = (mode: CalculatorMode, value: number | string | BigNumber): boolean => {
    try {
      const result = evaluate(`${memoryValues.value[mode]} + ${value}`);
      memoryValues.value[mode] = result;
      return true;
    } catch (error) {
      console.error('Memory add error:', error);
      return false;
    }
  };

  /**
   * Subtract value from memory for a specific mode
   */
  const subtract = (mode: CalculatorMode, value: number | string | BigNumber): boolean => {
    try {
      const result = evaluate(`${memoryValues.value[mode]} - ${value}`);
      memoryValues.value[mode] = result;
      return true;
    } catch (error) {
      console.error('Memory subtract error:', error);
      return false;
    }
  };

  /**
   * Create a standardized response object
   */
  const createResponse = (
    input: string, 
    error: string = '', 
    displayValues: DisplayValues | null = null
  ): MemoryOperationResult => {
    const response: MemoryOperationResult = { input };
    if (error) response.error = error;
    if (displayValues) response.displayValues = displayValues;
    return response;
  };

  /**
   * Handle memory clear operation
   */
  const handleMemoryClear = (mode: CalculatorMode, currentInput: string): MemoryOperationResult => {
    clear(mode);
    return createResponse(currentInput);
  };

  /**
   * Handle memory recall for programmer mode
   */
  const handleProgrammerMemoryRecall = (
    calculator: Calculator,
    activeBase: string,
    memoryValue: number | BigNumber
  ): MemoryOperationResult => {
    try {
      // Convert the memory value to a decimal number string
      const decimalValue = memoryValue.toString();

      // Convert to all bases and create display values
      const newStates: DisplayValues = {};
      const bases = ['DEC', 'HEX', 'OCT', 'BIN'];

      bases.forEach((base) => {
        try {
          // Use the convertToBase method that should now exist on all calculators
          const converted = calculator.convertToBase!(decimalValue, 'DEC', base);
          newStates[base] = { input: converted, display: converted };
        } catch (e) {
          console.error(`Error converting to ${base}:`, e);
          newStates[base] = { input: '0', display: '0' };
        }
      });

      // Return the value in active base as input with all display values
      const activeBaseValue = calculator.convertToBase!(
        decimalValue,
        'DEC',
        activeBase
      );

      // Important: Update calculator's internal state to match the recalled value
      if ('states' in calculator) {
        (calculator as any).states = { ...newStates };
        calculator.input = activeBaseValue;
        calculator.currentExpression = activeBaseValue;
      }

      return createResponse(activeBaseValue, '', newStates);
    } catch (err) {
      console.error('Error in programmer memory recall:', err);
      return createResponse('Error', 'Memory recall failed');
    }
  };

  /**
   * Handle memory recall for standard mode
   */
  const handleStandardMemoryRecall = (
    calculator: Calculator, 
    memoryValue: number | BigNumber
  ): MemoryOperationResult => {
    try {
      const formattedValue = calculator.formatResult(memoryValue);

      // Important: Update calculator's internal state
      calculator.input = formattedValue;
      calculator.currentExpression = formattedValue;

      return createResponse(formattedValue);
    } catch (err) {
      console.error('Error in standard memory recall:', err);
      return createResponse('Error', 'Memory recall failed');
    }
  };

  /**
   * Evaluate expression based on calculator mode
   */
  const evaluateExpression = (
    mode: CalculatorMode, 
    calculator: Calculator, 
    input: string, 
    activeBase?: string
  ): any => {
    if (mode === 'Programmer' && activeBase) {
      return calculator.evaluateExpression(input, activeBase);
    } else {
      return calculator.evaluateExpression(input);
    }
  };

  /**
   * Convert programmer value to decimal if needed
   */
  const convertToDecimal = (
    value: any, 
    calculator: Calculator, 
    activeBase: string
  ): string => {
    if (activeBase !== 'DEC' && calculator.convertToBase) {
      return calculator.convertToBase(value, activeBase, 'DEC');
    }
    return value.toString();
  };

  /**
   * Handle memory store operation
   */
  const handleMemoryStore = (params: MemoryOperationParams): MemoryOperationResult => {
    const { mode, calculator, currentInput, activeBase } = params;
    
    try {
      const storeValue = evaluateExpression(
        mode,
        calculator,
        currentInput,
        activeBase
      );

      // Convert to decimal for storage if in programmer mode
      const valueToStore = mode === 'Programmer' && activeBase
        ? convertToDecimal(storeValue, calculator, activeBase)
        : storeValue;

      if (store(mode, valueToStore)) {
        return createResponse(currentInput);
      } else {
        return createResponse(currentInput, 'Memory store failed');
      }
    } catch (err) {
      console.error('Error in memory store:', err);
      return createResponse(currentInput, 'Memory store failed');
    }
  };

  /**
   * Handle memory add operation
   */
  const handleMemoryAdd = (params: MemoryOperationParams): MemoryOperationResult => {
    const { mode, calculator, currentInput, activeBase } = params;
    
    try {
      const addValue = evaluateExpression(
        mode,
        calculator,
        currentInput,
        activeBase
      );

      // Convert to decimal for storage if in programmer mode
      const valueToAdd = mode === 'Programmer' && activeBase
        ? convertToDecimal(addValue, calculator, activeBase)
        : addValue;

      if (add(mode, valueToAdd)) {
        return createResponse(currentInput);
      } else {
        return createResponse(currentInput, 'Memory add failed');
      }
    } catch (err) {
      console.error('Error in memory add:', err);
      return createResponse(currentInput, 'Memory add failed');
    }
  };

  /**
   * Handle memory subtract operation
   */
  const handleMemorySubtract = (params: MemoryOperationParams): MemoryOperationResult => {
    const { mode, calculator, currentInput, activeBase } = params;
    
    try {
      const subtractValue = evaluateExpression(
        mode,
        calculator,
        currentInput,
        activeBase
      );

      // Convert to decimal for storage if in programmer mode
      const valueToSubtract = mode === 'Programmer' && activeBase
        ? convertToDecimal(subtractValue, calculator, activeBase)
        : subtractValue;

      if (subtract(mode, valueToSubtract)) {
        return createResponse(currentInput);
      } else {
        return createResponse(currentInput, 'Memory subtract failed');
      }
    } catch (err) {
      console.error('Error in memory subtract:', err);
      return createResponse(currentInput, 'Memory subtract failed');
    }
  };

  /**
   * Handle memory operations
   */
  const handleMemoryOperation = (params: {
    operation: string;
    mode: CalculatorMode;
    calculator: Calculator;
    currentInput: string;
    activeBase?: string;
  }): MemoryOperationResult => {
    const { operation, mode, calculator, currentInput, activeBase } = params;
    
    try {
      switch (operation) {
        case 'MC':
          return handleMemoryClear(mode, currentInput);

        case 'MR': {
          const memoryValue = recall(mode);
          if (memoryValue === null || memoryValue === 0) {
            return createResponse(currentInput);
          }

          return mode === 'Programmer' && activeBase
            ? handleProgrammerMemoryRecall(calculator, activeBase, memoryValue)
            : handleStandardMemoryRecall(calculator, memoryValue);
        }

        case 'MS':
          return handleMemoryStore({
            mode,
            calculator,
            currentInput,
            activeBase,
          });

        case 'M+':
          return handleMemoryAdd({
            mode,
            calculator,
            currentInput,
            activeBase,
          });

        case 'M-':
          return handleMemorySubtract({
            mode,
            calculator,
            currentInput,
            activeBase,
          });

        default:
          return createResponse(currentInput, 'Unknown memory operation');
      }
    } catch (err) {
      console.error('Memory operation error:', err);
      return createResponse(currentInput, 'Memory operation failed');
    }
  };

  return {
    hasMemory,
    handleMemoryOperation,
  };
}
