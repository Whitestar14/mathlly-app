import { watch } from 'vue'
import { useKeyboard } from '@/composables/useKeyboard'
import { useEventListener } from '@vueuse/core'

/**
 * Provides keyboard handling for calculator
 * @param {Object} options - Options
 */
export function useCalculatorKeyboard({
  mode,
  activeBase,
  handleButtonClick,
  handleBaseChange,
  toggleHistory,
  isValidForBase
}) {
  /**
   * Set up keyboard handlers
   */
  const { setContext, clearContext } = useKeyboard('calculator', {
    clear: () => handleButtonClick('AC'),
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
    setBase: (base) => {
      if (mode.value === 'Programmer') {
        handleBaseChange(base);
      }
    },
    toggleHistory
  });

  /**
   * Handle keyboard shortcuts for base changes
   */
  const handleKeyboardShortcuts = (e) => {
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
  };

  // Add keyboard event listener
  useEventListener('keydown', handleKeyboardShortcuts);

  // Watch for mode changes
  watch(
    mode,
    (newMode) => {
      if (newMode === 'Programmer') {
        setContext('programmer');
      } else {
        clearContext('programmer');
      }
    },
    { immediate: true }
  );
}
