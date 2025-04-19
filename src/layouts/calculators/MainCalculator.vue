<template>
  <BasePage 
    :title="props.mode + ' Mode'" 
    :show-header="false" 
    :show-footer="false" 
    main-class="flex"
    :is-tool-layout="true"
  >
    <div class="flex-grow flex-initial bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300">
      <div
        class="grid grid-cols-1 h-full p-4 gap-1 mx-auto"
        :class="state.mode === 'Programmer' ? 'grid-rows-[1fr_2fr]' : 'grid-rows-[1fr_2.5fr]'"
      >
        <calculator-display
          :input="state.input"
          :preview="preview"
          :error="state.error"
          :is-animating="state.isAnimating"
          :animated-result="animatedResult"
          :active-base="state.activeBase"
          :mode="state.mode"
          :display-values="state.displayValues"
          @open-history="openHistory"
          @base-change="handleBaseChange"
        />

        <calculator-buttons
          :mode="state.mode"
          :input-length="state.input.length"
          :max-length="maxInputLength"
          :active-base="state.activeBase"
          :has-memory="hasMemoryValue"
          @button-click="handleButtonClick"
          @clear="handleClear"
        />
      </div>
    </div>
    <history-panel
      :mode="state.mode"
      :is-mobile="isMobile"
      :is-open="isHistoryOpen"
      @update:is-open="isHistoryOpen = $event"
      @select-item="selectHistoryItem"
    />
  </BasePage>
</template>


<script setup>
import { computed, watch, ref, onMounted, provide } from 'vue'
import { useHistory } from '@/composables/useHistory'
import { useMemory } from '@/composables/useMemory'
import { useInputValidation } from '@/composables/useValidation'
import { useCalculatorState } from '@/composables/useCalculatorState'
import { useMainCalculator } from '@/composables/useMainCalculator'
import { CalculatorFactory } from '@/services/factory/CalculatorFactory'
import HistoryPanel from '@/layouts/calculators/main/HistoryPanel.vue'
import CalculatorDisplay from '@/layouts/calculators/main/CalculatorDisplay.vue'
import CalculatorButtons from '@/layouts/calculators/main/CalculatorButtons.vue'
import { useSettingsStore } from '@/stores/settings'
import BasePage from '@/components/base/BasePage.vue'

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
const calculator = ref(CalculatorFactory.create(props.mode, props.settings))

// Provide calculator instance to child components
provide('calculator', computed(() => calculator.value))

// Computed properties
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH)
const hasMemoryValue = computed(() => hasMemory(props.mode).value)

// History panel management
const { addToHistory } = useHistory()
// History panel management - simplified to just use a ref
const isHistoryOpen = ref(false)

// Function to open history panel
const openHistory = () => {
  isHistoryOpen.value = true
}

// Function to toggle history panel
const toggleHistory = () => {
  isHistoryOpen.value = !isHistoryOpen.value
}

// Memory management
const { hasMemory, handleMemoryOperation } = useMemory()

// Setup unified calculator functionality
const {
  handleButtonClick,
  handleClear,
  handleBaseChange,
  preview,
  animatedResult
} = useMainCalculator({
  calculator,
  state,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  addToHistory,
  handleMemoryOperation,
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
    calculator.value = CalculatorFactory.create(newMode, props.settings)

    if (newMode === 'Programmer') {
      setActiveBase('DEC')
    }
  },
  { immediate: true }
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
}
</script>
