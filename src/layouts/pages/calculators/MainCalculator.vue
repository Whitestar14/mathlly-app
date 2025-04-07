<template>
  <main class="flex-grow flex">
    <div class="flex-grow flex-initial bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300">
      <div class="grid grid-cols-1 h-full p-4 gap-1 mx-auto"
        :class="state.mode === 'Programmer' ? 'grid-rows-[1fr_2fr]' : 'grid-rows-[1fr_2.5fr]'">
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
import { computed, watch, ref, onMounted, provide } from 'vue'
import { useTitle } from '@vueuse/core'
import { useHistory } from '@/composables/useHistory'
import { usePanel } from '@/composables/usePanel'
import { useMemory } from '@/composables/useMemory'
import { useInputValidation } from '@/composables/useValidation'
import { useCalculatorState } from '@/composables/useCalculatorState'
import { useCalculatorOperations } from '@/composables/useCalculatorOperations'
import { usePreviewCalculation } from '@/composables/usePreviewCalculation'
import { useCalculatorKeyboard } from '@/composables/useCalculatorKeyboard'
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

// Setup preview calculation
const { preview } = usePreviewCalculation({ calculator, state })

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

// Setup calculator operations
const {
  handleButtonClick,
  handleClear,
  handleBaseChange
} = useCalculatorOperations({
  calculator,
  state,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  addToHistory,
  handleMemoryOperation
})

// Setup keyboard handling
useCalculatorKeyboard({
  mode: computed(() => state.mode),
  activeBase: computed(() => state.activeBase),
  handleButtonClick,
  handleBaseChange,
  toggleHistory,
  isValidForBase
})

onMounted(async () => {
  await settingsStore.loadSettings()
})

// Watch for mode changes
watch(
  () => props.mode,
  (newMode) => {
    if (!newMode) return

    resetState(newMode)
    calculator.value = CalculatorFactory.createCalculator(newMode, props.settings)

    if (newMode === 'Programmer') {
      setActiveBase('DEC')
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
