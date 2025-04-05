<template>
  <main class="flex-grow flex">
    <div class="flex-grow flex-initial bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300">
      <div class="grid grid-cols-1 h-full p-4 gap-1 mx-auto" :class="state.mode === 'Programmer'
          ? 'grid-rows-[1fr_2fr]'
          : 'grid-rows-[1fr_2.5fr]'
        ">
        <calculator-display :input="state.input" :preview="preview" :error="state.error"
          :is-animating="state.isAnimating" :animated-result="state.animatedResult" :active-base="state.activeBase"
          :mode="state.mode" :display-values="state.displayValues" @open-history="toggleHistory"
          @base-change="handleBaseChange" />

        <calculator-buttons :mode="state.mode" :input-length="state.input.length" :max-length="maxInputLength"
          :active-base="state.activeBase" :has-memory="hasMemoryValue" @button-click="handleButtonClick"
          @clear="handleClear" />
      </div>
    </div>
    <history-panel :mode="state.mode" :is-mobile="isMobile" :is-open="isHistoryOpen" @update:is-open="toggleHistory"
      @select-item="selectHistoryItem" />
  </main>
</template>

<script setup>
import { computed, watch, ref, nextTick, onMounted, provide } from 'vue'
import { useTitle, useEventListener, useMemoize } from '@vueuse/core'
import { useHistory } from '@/composables/useHistory'
import { usePanel } from '@/composables/usePanel'
import { useMemory } from '@/composables/useMemory'
import { useKeyboard } from '@/composables/useKeyboard'
import { useInputValidation } from '@/composables/useValidation'
import { useCalculatorState } from '@/composables/useCalculatorState'
import { CalculatorFactory } from '@/services/factory/CalculatorFactory'
import HistoryPanel from '@/layouts/pages/calculators/main/HistoryPanel.vue'
import CalculatorDisplay from '@/layouts/pages/calculators/main/CalculatorDisplay.vue'
import CalculatorButtons from '@/layouts/pages/calculators/main/CalculatorButtons.vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
})

const { isValidForBase } = useInputValidation()
const settingsStore = useSettingsStore()

// Create unified calculator state
const {
  state,
  updateState,
  resetState,
  setAnimation,
  updateDisplayValues,
  setActiveBase
} = useCalculatorState(props.mode)

// Create calculator instance using factory
const calculator = ref(CalculatorFactory.createCalculator(props.mode, props.settings))

// Provide calculator instance to child components
provide('calculator', computed(() => calculator.value))

// Set page title
useTitle(computed(() => `${props.mode} Mode - Mathlly`))

// Computed properties
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH)
const hasMemoryValue = computed(() => hasMemory(props.mode).value)

const calculatePreview = useMemoize(
  (input, mode, activeBase) => {
    if (input === 'Error') return '';
    
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
)

const preview = computed(() => 
  calculatePreview(state.input, state.mode, state.activeBase)
)

// History panel management
const { addToHistory } = useHistory()
const {
  isOpen: isHistoryOpen,
  close: closeHistory,
  toggle: toggleHistory,
  handleResize,
} = usePanel('history-panel', props.isMobile)

// Memory management
const { hasMemory, handleMemoryOperation } = useMemory()

// Handle button clicks
const handleButtonClick = (btn) => {
  try {
    let result

    // Handle memory operations
    if (['MC', 'MR', 'M+', 'M-', 'MS'].includes(btn)) {
      result = handleMemoryOperation({
        operation: btn,
        mode: state.mode,
        calculator: calculator.value,
        currentInput: state.input,
        activeBase: state.activeBase
      })

      // For Programmer mode memory recall, update display values
      if (btn === 'MR' && state.mode === 'Programmer' && result.displayValues) {
        nextTick(() => {
          // Update display values and input in a single batch
          updateDisplayValues(result.displayValues)
          updateState({
            input: result.displayValues[state.activeBase]?.input || result.input,
            error: result.error || ""
          })
        })
        return
      }
    } else {
      // Use calculator's button click handler
      result = calculator.value.handleButtonClick(btn)
    }

    // Update state with result
    updateState({
      input: result.input,
      error: result.error || ""
    })

    // Handle special cases for Programmer mode
    if (btn === "=" && state.mode === "Programmer") {
      if (result.displayValues) {
        updateDisplayValues(result.displayValues)
        setAnimation(result.result)
      }
    } else if (state.mode === "Programmer") {
      // Update display values for programmer mode
      nextTick(() => updateDisplayFn())
    }

    // Add to history for standard mode calculations
    if (btn === "=" && state.mode !== "Programmer" && result.result) {
      addToHistory(result.expression, result.result)
      setAnimation(result.result)
    }
  } catch (err) {
    console.error("Calculator operation error:", err)
    updateState({
      input: "Error",
      error: "Operation failed"
    })
  }
}

// Helper function to update programmer display values
const updateDisplayFn = () => {
  if (state.mode === 'Programmer' && state.input !== 'Error') {
    try {
      const updatedValues = calculator.value.updateDisplayValues(state.input)
      updateDisplayValues(updatedValues)
    } catch (error) {
      console.error('Error updating display values:', error)
    }
  }
}

// Handle clear button
const handleClear = () => {
  const result = calculator.value.handleButtonClick('AC')
  updateState({
    input: result.input,
    error: ''
  })

  if (state.mode === 'Programmer') {
    updateDisplayFn()
  }
}

// Handle base change for programmer mode
const handleBaseChange = (newBase) => {
  if (state.mode === 'Programmer') {
    const result = calculator.value.handleBaseChange(newBase)
    nextTick(() => {
      setActiveBase(newBase)
      updateState({
        input: result.input,
        error: result.error || '',
        displayValues: result.displayValues
      })
    })
  }
}

// Keyboard handling
const { setContext, clearContext } = useKeyboard('calculator', {
  clear: () => handleButtonClick('AC'),
  calculate: () => handleButtonClick('='),
  backspace: () => handleButtonClick('backspace'),
  input: (value) => {
    if (state.mode === 'Programmer') {
      if (isValidForBase(value, state.activeBase)) {
        handleButtonClick(value)
      }
    } else {
      handleButtonClick(value)
    }
  },
  setBase: (base) => {
    if (state.mode === 'Programmer') {
      handleBaseChange(base)
    }
  },
  toggleHistory
})

// Keyboard shortcuts for base changes
const handleKeyboardShortcuts = (e) => {
  if (state.mode !== 'Programmer') return

  const shortcuts = {
    'ctrl+1': () => handleBaseChange('DEC'),
    'ctrl+2': () => handleBaseChange('HEX'),
    'ctrl+3': () => handleBaseChange('OCT'),
    'ctrl+4': () => handleBaseChange('BIN')
  }

  const combo = [
    e.ctrlKey && 'ctrl',
    e.shiftKey && 'shift',
    e.altKey && 'alt',
    e.key
  ]
    .filter(Boolean)
    .join('+')

  if (shortcuts[combo]) {
    e.preventDefault()
    shortcuts[combo]()
  }
}

// Add keyboard event listener
useEventListener('keydown', handleKeyboardShortcuts)

// Load settings on mount
onMounted(async () => {
  await settingsStore.loadSettings()
})

// Watch for mode changes
watch(
  () => props.mode,
  (newMode) => {
    if (!newMode) return // Skip if mode is not set

    // Reset state and create new calculator
    resetState(newMode)
    calculator.value = CalculatorFactory.createCalculator(newMode, props.settings)

    // Set up keyboard context for programmer mode
    if (newMode === 'Programmer') {
      setActiveBase('DEC')
      setContext('programmer')
    } else {
      clearContext('programmer')
    }
  },
  { immediate: true }
)

// Watch for mobile state changes
watch(
  () => props.isMobile,
  (newIsMobile) => {
    handleResize(newIsMobile)
  }
)

// Handle history item selection
const selectHistoryItem = ({ expression }) => {
  if (state.mode === 'Programmer') return

  updateState({
    input: expression,
    error: ''
  })

  calculator.value.input = expression
  calculator.value.currentExpression = ''

  closeHistory()
}
</script>
