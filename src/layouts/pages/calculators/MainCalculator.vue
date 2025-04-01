<template>
  <main class="flex-grow flex">
    <div
      class="flex-grow flex-initial bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300"
    >
      <div
        class="grid grid-cols-1 h-full p-4 gap-1 mx-auto"
        :class="
          mode === 'Programmer'
            ? 'grid-rows-[1fr_2fr]'
            : 'grid-rows-[1fr_2.5fr]'
        "
      >
        <calculator-display
          :input="input"
          :preview="preview"
          :error="error"
          :is-animating="isAnimating"
          :animated-result="animatedResult"
          :active-base="activeBase"
          :mode="mode"
          :display-values="displayValues"
          @open-history="toggleHistory"
          @base-change="handleBaseChange"
        />

        <calculator-buttons
          :mode="mode"
          :input-length="input.length"
          :max-length="maxInputLength"
          :active-base="activeBase"
          :has-memory="hasMemoryValue"
          @button-click="handleButtonClick"
          @clear="handleClear"
        />
      </div>
    </div>
    <history-panel
      :mode="mode"
      :is-mobile="isMobile"
      :is-open="isHistoryOpen"
      @update:is-open="toggleHistory"
      @select-item="selectHistoryItem"
    />
  </main>
</template>

<script setup>
import { computed, watch, ref, nextTick, onMounted, provide } from 'vue';
import { useTitle, useEventListener } from '@vueuse/core';
import { useHistory } from '@/composables/useHistory';
import { usePanel } from '@/composables/usePanel';
import { useCalculator } from '@/composables/useCalculator';
import { useMemory } from '@/composables/useMemory';
import { useKeyboard } from '@/composables/useKeyboard';
import { useInputValidation } from '@/composables/useValidation';
import HistoryPanel from '@/layouts/pages/calculators/main/HistoryPanel.vue';
import CalculatorDisplay from '@/layouts/pages/calculators/main/CalculatorDisplay.vue';
import CalculatorButtons from '@/layouts/pages/calculators/main/CalculatorButtons.vue';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
});

const { isValidForBase } = useInputValidation();

const {
  calculator,
  createCalculator,
  state,
  updateState,
  updateDisplayValues,
  setActiveBase,
  setAnimation,
  clearState,
  updateDisplayState,
} = useCalculator(props.mode, props.settings);

provide(
  'calculator',
  computed(() => calculator.value)
);
useTitle(computed(() => `${props.mode} Mode - Mathlly`));

const input = computed(() => state.value.input);
const error = computed(() => state.value.error);
const isAnimating = computed(() => state.value.isAnimating);
const animatedResult = computed(() => state.value.animatedResult);
const activeBase = computed(() => state.value.activeBase);
const displayValues = computed(() => state.value.displayValues);
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH);
// Get memory functions
const { hasMemory, handleMemoryOperation } = useMemory();

// Computed property to check if current mode has memory
const hasMemoryValue = computed(() => hasMemory(props.mode).value);

const preview = computed(() => {
  if (props.mode === 'Programmer') {
    try {
      const result = calculator.value.evaluateExpression(
        input.value,
        activeBase.value
      );
      return calculator.value.formatResult(result, activeBase.value);
    } catch (err) {
      return '';
    }
  } else {
    try {
      const result = calculator.value.evaluateExpression(input.value);
      return calculator.value.formatResult(result);
    } catch (err) {
      return '';
    }
  }
});

const currentInput = ref('0');
const { addToHistory } = useHistory();
const {
  isOpen: isHistoryOpen,
  close: closeHistory,
  toggle: toggleHistory,
  handleResize,
} = usePanel('history-panel', props.isMobile);

watch(
  () => props.isMobile,
  (newIsMobile) => {
    handleResize(newIsMobile);
  }
);

// In the handleButtonClick function
const handleButtonClick = (btn) => {
  try {
    let result;
    
    // Handle memory operations through our special handler with object parameter
    if (['MC', 'MR', 'M+', 'M-', 'MS'].includes(btn)) {
      result = handleMemoryOperation({
        operation: btn,
        mode: props.mode,
        calculator: calculator.value,
        currentInput: input.value,
        activeBase: activeBase.value
      });
      
      // For Programmer mode memory recall, update display values
      if (btn === 'MR' && props.mode === 'Programmer' && result.displayValues) {
        // Force a complete state update
        nextTick(() => {
          // First update the display values
          updateDisplayValues(result.displayValues);
          
          // Then update the input based on the active base
          updateState({
            input: result.displayValues[activeBase.value]?.input || result.input,
            error: result.error || "",
          });
          
          // Force a display update
          calculator.value.states = { ...result.displayValues };
        });
        
        return;
      }
    } else {
      result = calculator.value.handleButtonClick(btn);
    }

    // Rest of the function remains the same
    updateState({
      input: result.input,
      error: result.error || "",
    });

    if (btn === "=" && props.mode === "Programmer") {
      if (result.displayValues) {
        updateDisplayValues(result.displayValues);
        setAnimation(result.result);
      }
    } else if (props.mode === "Programmer") {
      nextTick(() => updateDisplayState());
    }

    if (btn === "=" && props.mode !== "Programmer" && result.result) {
      addToHistory(result.expression, result.result);
      setAnimation(result.result);
    }
  } catch (err) {
    console.error("Calculator operation error:", err);
    updateState({
      input: "Error",
      error: "Operation failed",
    });
  }
}

const handleClear = () => {
  const result = calculator.value.handleButtonClick('AC');
  updateState({
    input: result.input,
    error: '',
  });

  if (props.mode === 'Programmer') {
    updateDisplayState();
  }
};

const handleBaseChange = (newBase) => {
  if (props.mode === 'Programmer') {
    const result = calculator.value.handleBaseChange(newBase);
    nextTick(() => {
      setActiveBase(newBase);
      updateState({
        input: result.input,
        error: result.error || '',
        displayValues: result.displayValues,
      });
    });
  }
};

const { setContext, clearContext } = useKeyboard('calculator', {
  clear: () => handleButtonClick('AC'),
  calculate: () => handleButtonClick('='),
  backspace: () => handleButtonClick('backspace'),
  input: (value) => {
    if (props.mode === 'Programmer') {
      if (isValidForBase(value, activeBase.value)) {
        handleButtonClick(value);
      }
    } else {
      handleButtonClick(value);
    }
  },
  // Replace setBase with a direct call to handleBaseChange
  setBase: (base) => {
    if (props.mode === 'Programmer') {
      handleBaseChange(base);
    }
  },
  toggleHistory,
});

// Add keyboard shortcuts for base changes
const handleKeyboardShortcuts = (e) => {
  if (props.mode !== 'Programmer') return;

  const shortcuts = {
    'ctrl+1': () => handleBaseChange('DEC'),
    'ctrl+2': () => handleBaseChange('HEX'),
    'ctrl+3': () => handleBaseChange('OCT'),
    'ctrl+4': () => handleBaseChange('BIN'),
  };

  const combo = [
    e.ctrlKey && 'ctrl',
    e.shiftKey && 'shift',
    e.altKey && 'alt',
    e.key,
  ]
    .filter(Boolean)
    .join('+');

  if (shortcuts[combo]) {
    e.preventDefault();
    shortcuts[combo]();
  }
};

useEventListener('keydown', handleKeyboardShortcuts);
const settingsStore = useSettingsStore();

onMounted(() => {
  (async function () {
    await settingsStore.loadSettings();
  })();
});

watch(
  () => props.mode,
  (newMode) => {
    if (!newMode) return; // Skip if mode is not set
    clearState();
    calculator.value = createCalculator(newMode);

    if (newMode === 'Programmer') {
      setActiveBase('DEC');
      setContext('programmer');
    } else {
      clearContext('programmer');
    }
  },
  { immediate: true }
);

watch(
  currentInput,
  (newValue) => {
    if (newValue !== input.value && newValue !== 'Error') {
      updateState({
        input: newValue,
        error: '',
      });
      calculator.value.input = newValue;
      calculator.value.currentExpression = '';
      calculator.value.error = '';

      if (props.mode === 'Programmer') {
        updateDisplayState();
      }
    }
  },
  { immediate: true }
);

watch(
  () => input.value,
  (newInput) => {
    if (props.mode === 'Programmer' && newInput !== 'Error') {
      nextTick(() => {
        try {
          const updatedDisplayValues =
            calculator.value.updateDisplayValues(newInput);
          updateDisplayValues(updatedDisplayValues);
        } catch (error) {
          console.error('Error updating display values:', error);
        }
      });
    }
  },
  { deep: true }
);

const selectHistoryItem = ({ expression }) => {
  if (props.mode === 'Programmer') return;

  updateState({ input: expression, error: '' });
  calculator.value.input = expression;
  calculator.value.currentExpression = '';
  currentInput.value = expression;

  closeHistory();
};
</script>
