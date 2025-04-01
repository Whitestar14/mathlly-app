import { ref, computed } from 'vue';
import { evaluate, bignumber } from 'mathjs';

// Create a shared state for memory across the application
const memoryValues = ref({
  Standard: 0,
  Programmer: 0
});

export function useMemory() {
  // Check if a specific calculator mode has memory
  const hasMemory = (mode) => computed(() => memoryValues.value[mode] !== 0);
  
  // Memory operations
  const clear = (mode) => {
    memoryValues.value[mode] = 0;
    return true;
  };
  
  const recall = (mode) => {
    return memoryValues.value[mode];
  };
  
  const store = (mode, value) => {
    try {
      const numericValue = typeof value === 'object' && value.toString ? 
        value.toString() : value;
      
      memoryValues.value[mode] = bignumber(numericValue);
      return true;
    } catch (error) {
      console.error('Memory store error:', error);
      return false;
    }
  };
  
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
  
  // Improved memory operation handler with object destructuring
  const handleMemoryOperation = ({ 
    operation, 
    mode, 
    calculator, 
    currentInput, 
    activeBase 
  }) => {
    try {
      let result = { input: currentInput, error: '' };

      switch (operation) {
        case 'MC': {
          clear(mode);
          break;
        }
        case 'MR': {
          const memoryValue = recall(mode);
          if (memoryValue !== null && memoryValue !== 0) {
            try {
              if (mode === 'Programmer') {
                // Convert the memory value to a decimal number string
                const decimalValue = memoryValue.toString();
                
                // For Programmer mode, we need to:
                // 1. Convert the decimal value to the active base
                const activeBaseValue = calculator.convertToBase(
                  decimalValue, 
                  'DEC', 
                  activeBase
                );
                
                // 2. Update the input with the converted value
                result.input = activeBaseValue;
                
                // 3. Create a new states object with the converted values for all bases
                const newStates = {};
                
                // For each base, convert the decimal value to that base
                ['DEC', 'HEX', 'OCT', 'BIN'].forEach(base => {
                  try {
                    // Always convert from DEC to the target base
                    const converted = calculator.convertToBase(
                      decimalValue, 
                      'DEC', 
                      base
                    );
                    
                    newStates[base] = { 
                      input: converted, 
                      display: converted 
                    };
                  } catch (e) {
                    console.error(`Error converting to ${base}:`, e);
                    newStates[base] = { input: '0', display: '0' };
                  }
                });
                
                // 4. Include the updated states in the result
                result.displayValues = newStates;
              } else {
                // For Standard mode
                result.input = calculator.formatResult(memoryValue);
              }
            } catch (err) {
              console.error('Error in memory recall:', err);
              result.error = 'Memory recall failed';
            }
          }
          break;
        }
        case 'MS': {
          try {
            let storeValue;
            if (mode === 'Programmer') {
              // Make sure we're evaluating the expression in the correct base
              storeValue = calculator.evaluateExpression(
                currentInput,
                activeBase
              );

              // Convert the result to decimal for storage (memory always stores in decimal)
              if (activeBase !== 'DEC') {
                const convertedValue = calculator.convertToBase(
                  storeValue,
                  activeBase,
                  'DEC'
                );
                storeValue = convertedValue;
              }
            } else {
              storeValue = calculator.evaluateExpression(currentInput);
            }

            // Store the value
            store(mode, storeValue);
          } catch (err) {
            console.error('Error in memory store:', err);
            result.error = 'Memory store failed';
          }
          break;
        }
        case 'M+': {
          try {
            let addValue;
            if (mode === 'Programmer') {
              addValue = calculator.evaluateExpression(
                currentInput,
                activeBase
              );
              
              // Convert to decimal if needed
              if (activeBase !== 'DEC') {
                addValue = calculator.convertToBase(
                  addValue,
                  activeBase,
                  'DEC'
                );
              }
            } else {
              addValue = calculator.evaluateExpression(currentInput);
            }
            
            if (!add(mode, addValue)) {
              result.error = 'Memory add failed';
            }
          } catch (err) {
            console.error('Error in memory add:', err);
            result.error = 'Memory add failed';
          }
          break;
        }
        case 'M-': {
          try {
            let subtractValue;
            if (mode === 'Programmer') {
              subtractValue = calculator.evaluateExpression(
                currentInput,
                activeBase
              );
              
              // Convert to decimal if needed
              if (activeBase !== 'DEC') {
                subtractValue = calculator.convertToBase(
                  subtractValue,
                  activeBase,
                  'DEC'
                );
              }
            } else {
              subtractValue = calculator.evaluateExpression(currentInput);
            }
            
            if (!subtract(mode, subtractValue)) {
              result.error = 'Memory subtract failed';
            }
          } catch (err) {
            console.error('Error in memory subtract:', err);
            result.error = 'Memory subtract failed';
          }
          break;
        }
      }

      return result;
    } catch (err) {
      console.error('Memory operation error:', err);
      return { input: currentInput, error: 'Memory operation failed' };
    }
  };
  
  return {
    hasMemory,
    handleMemoryOperation
  };
}
