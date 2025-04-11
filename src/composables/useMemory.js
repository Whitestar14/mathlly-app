import { ref, computed } from 'vue';
import { evaluate, bignumber } from 'mathjs';

// Create a shared state for memory across the application
const memoryValues = ref({
  Standard: 0,
  Programmer: 0,
});

/**
 * Composable for calculator memory operations
 * @returns {Object} Memory operations and state
 */
export function useMemory() {
  /**
   * Check if a specific calculator mode has memory
   * @param {string} mode - Calculator mode
   * @returns {Object} Computed boolean indicating if memory exists
   */
  const hasMemory = (mode) => computed(() => memoryValues.value[mode] !== 0);

  /**
   * Clear memory for a specific mode
   * @param {string} mode - Calculator mode
   * @returns {boolean} Success indicator
   */
  const clear = (mode) => {
    memoryValues.value[mode] = 0;
    return true;
  };

  /**
   * Recall memory value for a specific mode
   * @param {string} mode - Calculator mode
   * @returns {number|Object} Memory value
   */
  const recall = (mode) => {
    return memoryValues.value[mode];
  };

  /**
   * Store value in memory for a specific mode
   * @param {string} mode - Calculator mode
   * @param {number|string|Object} value - Value to store
   * @returns {boolean} Success indicator
   */
  const store = (mode, value) => {
    try {
      const numericValue =
        typeof value === 'object' && value.toString ? value.toString() : value;

      memoryValues.value[mode] = bignumber(numericValue);
      return true;
    } catch (error) {
      console.error('Memory store error:', error);
      return false;
    }
  };

  /**
   * Add value to memory for a specific mode
   * @param {string} mode - Calculator mode
   * @param {number|string|Object} value - Value to add
   * @returns {boolean} Success indicator
   */
  const add = (mode, value) => {
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
   * @param {string} mode - Calculator mode
   * @param {number|string|Object} value - Value to subtract
   * @returns {boolean} Success indicator
   */
  const subtract = (mode, value) => {
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
   * @param {string} input - Current input
   * @param {string} [error=""] - Error message if any
   * @param {Object} [displayValues=null] - Display values for programmer mode
   * @returns {Object} Standardized response
   */
  const createResponse = (input, error = '', displayValues = null) => {
    const response = { input, error };
    if (displayValues) response.displayValues = displayValues;
    return response;
  };

  /**
   * Handle memory clear operation
   * @param {string} mode - Calculator mode
   * @param {string} currentInput - Current calculator input
   * @returns {Object} Operation result
   */
  const handleMemoryClear = (mode, currentInput) => {
    clear(mode);
    return createResponse(currentInput);
  };

  /**
   * Handle memory recall for programmer mode
   * @param {Object} calculator - Calculator instance
   * @param {string} activeBase - Current active base
   * @param {number|Object} memoryValue - Value from memory
   * @returns {Object} Operation result with converted values
   */
  const handleProgrammerMemoryRecall = (
    calculator,
    activeBase,
    memoryValue
  ) => {
    try {
      // Convert the memory value to a decimal number string
      const decimalValue = memoryValue.toString();

      // Convert to all bases and create display values
      const newStates = {};
      const bases = ['DEC', 'HEX', 'OCT', 'BIN'];

      bases.forEach((base) => {
        try {
          // Always convert from DEC to the target base
          const converted = calculator.convertToBase(decimalValue, 'DEC', base);
          newStates[base] = { input: converted, display: converted };
        } catch (e) {
          console.error(`Error converting to ${base}:`, e);
          newStates[base] = { input: '0', display: '0' };
        }
      });

      // Return the value in active base as input with all display values
      const activeBaseValue = calculator.convertToBase(
        decimalValue,
        'DEC',
        activeBase
      );

      // Important: Update calculator's internal state to match the recalled value
      if (calculator.states) {
        calculator.states = { ...newStates };
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
   * @param {Object} calculator - Calculator instance
   * @param {number|Object} memoryValue - Value from memory
   * @returns {Object} Operation result with formatted value
   */
  const handleStandardMemoryRecall = (calculator, memoryValue) => {
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
   * @param {string} mode - Calculator mode
   * @param {Object} calculator - Calculator instance
   * @param {string} input - Expression to evaluate
   * @param {string} [activeBase] - Active base for programmer mode
   * @returns {*} Evaluation result
   */
  const evaluateExpression = (mode, calculator, input, activeBase) => {
    if (mode === 'Programmer') {
      return calculator.evaluateExpression(input, activeBase);
    } else {
      return calculator.evaluateExpression(input);
    }
  };

  /**
   * Convert programmer value to decimal if needed
   * @param {*} value - Value to convert
   * @param {Object} calculator - Calculator instance
   * @param {string} activeBase - Current active base
   * @returns {string} Decimal value
   */
  const convertToDecimal = (value, calculator, activeBase) => {
    if (activeBase !== 'DEC') {
      return calculator.convertToBase(value, activeBase, 'DEC');
    }
    return value.toString();
  };

  /**
   * Handle memory store operation
   * @param {Object} params - Operation parameters
   * @returns {Object} Operation result
   */
  const handleMemoryStore = ({
    mode,
    calculator,
    currentInput,
    activeBase,
  }) => {
    try {
      const storeValue = evaluateExpression(
        mode,
        calculator,
        currentInput,
        activeBase
      );

      // Convert to decimal for storage if in programmer mode
      const valueToStore =
        mode === 'Programmer'
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
   * @param {Object} params - Operation parameters
   * @returns {Object} Operation result
   */
  const handleMemoryAdd = ({ mode, calculator, currentInput, activeBase }) => {
    try {
      const addValue = evaluateExpression(
        mode,
        calculator,
        currentInput,
        activeBase
      );

      // Convert to decimal for storage if in programmer mode
      const valueToAdd =
        mode === 'Programmer'
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
   * @param {Object} params - Operation parameters
   * @returns {Object} Operation result
   */
  const handleMemorySubtract = ({
    mode,
    calculator,
    currentInput,
    activeBase,
  }) => {
    try {
      const subtractValue = evaluateExpression(
        mode,
        calculator,
        currentInput,
        activeBase
      );

      // Convert to decimal for storage if in programmer mode
      const valueToSubtract =
        mode === 'Programmer'
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
   * @param {Object} params - Operation parameters
   * @returns {Object} Operation result
   */
  const handleMemoryOperation = ({
    operation,
    mode,
    calculator,
    currentInput,
    activeBase,
  }) => {
    try {
      switch (operation) {
        case 'MC':
          return handleMemoryClear(mode, currentInput);

        case 'MR': {
          const memoryValue = recall(mode);
          if (memoryValue === null || memoryValue === 0) {
            return createResponse(currentInput);
          }

          return mode === 'Programmer'
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
