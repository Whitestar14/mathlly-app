<template>
  <BasePage 
    :title="mode + ' Mode'" 
    :show-header="false" 
    :show-footer="false" 
    main-class="flex"
    :is-tool-layout="true"
  >
    <!-- Calculator Mode Switcher - teleports to header -->
    <CalculatorModeSwitcher />
    
    <div class="flex-grow flex-initial bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300">
      <div
        class="grid grid-cols-1 h-full p-4 gap-1 mx-auto"
        :class="state.mode === 'Programmer' 
          ? 'grid-rows-[1fr_2fr]' 
          : (state.mode === 'Scientific' || state.mode === 'Standard' 
          ? 'grid-rows-[1fr_3fr]' 
          : '')"
      >
        <calculator-display
          :input="input"
          :preview="preview"
          :error="state.error"
          :is-animating="state.isAnimating"
          :animated-result="animatedResult"
          :active-base="state.activeBase"
          :mode="state.mode"
          :display-values="state.displayValues"
          @open-activity="openActivity"
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
    <ActivityPanel
      :mode="state.mode"
      :is-mobile="isMobile"
      :is-open="activityPanel.isOpen"
      @history-close="activityPanel.close"
      @select-item="selectHistoryItem"
    />
  </BasePage>
</template>

<script setup lang="ts">
import { computed, watch, ref, provide, defineAsyncComponent, type Ref, type ComputedRef } from 'vue'
import { useSessionStorage } from '@vueuse/core'
import { useHistory, type HistoryItem } from '@/composables/useHistory'
import { useMemory, type UseMemoryReturn } from '@/composables/useMemory'
import { usePanel, type LightweightPanelAPI } from '@/composables/usePanel'
import { useCalculatorState, type CalculatorMode, type Base } from '@/composables/useCalculatorState'
import { useCalculatorModeSwitcher } from '@/composables/useCalculatorModeSwitcher'
import { CalculatorController, type ControllerReturn } from './MainCalculator'
import { CalculatorFactory, type Calculator } from '@/services/factory/CalculatorFactory'
import CalculatorDisplay from '@/layouts/calculators/main/CalculatorDisplay.vue'
import CalculatorButtons from '@/layouts/calculators/main/CalculatorButtons.vue'
import BasePage from '@/components/base/BasePage.vue'

// Import the calculator mode switcher component
const CalculatorModeSwitcher = defineAsyncComponent(() => import('@/components/calculator/CalculatorModeSwitcher.vue'))

// Types
interface Props {
  mode: CalculatorMode
  settings: Record<string, any>
  isMobile: boolean
}

interface HistoryService {
  addToHistory: (expression: string, result: string) => void
}

// Define props
const props = defineProps<Props>()

// Async component import with proper typing
const ActivityPanel = defineAsyncComponent(() => import('@/layouts/calculators/main/ActivityPanel.vue'))

// Use composables for state management with proper typing
const historyService: HistoryService = useHistory()
const memoryService: UseMemoryReturn = useMemory()

// Get the panel instance - cast to the correct type
const activityPanelResult = usePanel('activity')
const activityPanel = activityPanelResult as LightweightPanelAPI

// Get calculator mode switcher context
const { currentMode, updateMode } = useCalculatorModeSwitcher()

const {
  state,
  updateState,
  resetState,
  setAnimation,
  updateDisplayValues,
  setActiveBase
} = useCalculatorState(props.mode)

// Session storage with proper typing
const storedInput = useSessionStorage<string>(`calculator-session-input-${props.mode}`, '')

// Calculator instance with proper typing - use ref instead of shallowRef to match interface
const calculator: Ref<Calculator> = ref(CalculatorFactory.create(props.mode, props.settings))
 
// Provide calculator instance to child components
provide('calculator', computed(() => calculator.value))
provide('calculatorState', state)

// Initialize controller with all dependencies and proper typing
const controllerResult: ControllerReturn = CalculatorController({
  state,
  calculator,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  historyService,
  memoryService,
  toggleActivity: activityPanel.toggle
})

const {
  preview,
  input,
  animatedResult,
  handleClear,
  handleButtonClick,
  handleBaseChange,
} = controllerResult

// Memoized computed properties with proper typing
const maxInputLength: ComputedRef<number> = computed(() => calculator.value.MAX_INPUT_LENGTH)
const hasMemoryValue: ComputedRef<boolean> = computed(() => memoryService.hasMemory(props.mode).value)

// Activity panel methods
const openActivity = (): void => activityPanel.open()

// Watch for input changes with proper typing
watch(() => state.input, (newRawInput: string) => {
  if (storedInput.value !== newRawInput) {
    storedInput.value = newRawInput
  }
})

// Centralized mode change handler
const handleModeChange = (newMode: CalculatorMode, oldMode?: CalculatorMode) => {
  const validatedMode: CalculatorMode = newMode as CalculatorMode

  resetState(validatedMode)
  calculator.value = CalculatorFactory.create(validatedMode, props.settings)
  
  if (validatedMode === 'Programmer') {
    setActiveBase('DEC' as Base)
  }
  
  if (oldMode === undefined) {
    if (storedInput.value && state.input !== storedInput.value) {
      updateState({ input: storedInput.value })
      calculator.value.input = storedInput.value
      
      // Safe access to programmer calculator states
      if (validatedMode === "Programmer") {
        const calc = calculator.value as any
        if (calc.states?.DEC) {
          calc.states.DEC.input = storedInput.value
        }
      }
    }
  } else { 
    storedInput.value = ""
  }
}

// Watch for mode changes from the switcher and sync with props
watch(() => currentMode.value, (newMode: CalculatorMode) => {
  if (newMode !== props.mode) {
    // The mode change came from the switcher, handle it
    handleModeChange(newMode)
  }
})

// Watch for mode changes from props and sync with switcher
watch(() => props.mode, (newMode: CalculatorMode, oldMode?: CalculatorMode) => {
  if (!newMode) return

  // Sync the switcher with the prop change
  if (currentMode.value !== newMode) {
    updateMode(newMode)
  }

  handleModeChange(newMode, oldMode)
}, { immediate: true })

// Handle activity item selection with proper typing
const selectHistoryItem = ({ expression }: HistoryItem): void => {
  if (state.mode === 'Programmer') return

  updateState({ 
    input: expression, 
    error: '' 
  })

  calculator.value.input = expression
  if ('currentExpression' in calculator.value) {
    calculator.value.currentExpression = ''
  }
}
</script>
