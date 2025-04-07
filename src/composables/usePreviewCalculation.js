import { computed } from 'vue'
import { useMemoize } from '@vueuse/core'

/**
 * Provides preview calculation functionality
 * @param {Object} options - Options
 * @returns {Object} Preview calculation utilities
 */
export function usePreviewCalculation({ calculator, state }) {
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
   * Computed preview value
   */
  const preview = computed(() => 
    calculatePreview(state.input, state.mode, state.activeBase)
  );

  return { preview };
}
