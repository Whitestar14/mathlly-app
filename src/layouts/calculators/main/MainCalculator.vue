<template>
  <BasePage 
    :title="mode + ' Mode'" 
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
      @history-close="activityPanel.close()"
      @select-item="selectHistoryItem"
    />
  </BasePage>
</template>

<script setup lang="ts">
import { computed, watch, shallowRef, provide, defineAsyncComponent, type Ref, type ComputedRef } from 'vue'
import { useSessionStorage } from '@vueuse/core'
import { useHistory } from '@/composables/useHistory'
import { useMemory } from '@/composables/useMemory'
import { usePanel } from '@/composables/usePanel'
import { useCalculatorState, type CalculatorMode, type Base } from '@/composables/useCalculatorState'
import { CalculatorController, type Calculator, type ControllerReturn } from './MainCalculator'
import { CalculatorFactory } from '@/services/factory/CalculatorFactory'
import CalculatorDisplay from '@/layouts/calculators/main/CalculatorDisplay.vue'
import CalculatorButtons from '@/layouts/calculators/main/CalculatorButtons.vue'
import BasePage from '@/components/base/BasePage.vue'

// Define interfaces for props and components
interface Props {
  mode: CalculatorMode
  settings: Record<string, any>
  isMobile: boolean
}

interface HistoryItem {
  expression: string
  result?: string
}

interface MemoryService {
  hasMemory: (mode: string) => Ref<boolean>
}

interface HistoryService {
  addToHistory: (expression: string, result: string) => void
}

interface PanelService {
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

// Define props
const props = defineProps<Props>()

// Async component import with proper typing
const ActivityPanel = defineAsyncComponent(() => import('@/layouts/calculators/main/ActivityPanel.vue'))

// Use composables for state management with proper typing
const historyService: HistoryService = useHistory()
const memoryService: MemoryService = useMemory()
const activityPanel: PanelService = usePanel('activity')

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

// Calculator instance with proper typing
const calculator: Ref<Calculator> = shallowRef(CalculatorFactory.create(props.mode, props.settings))
 
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

// Watch for mode changes with proper typing
watch(() => props.mode, (newMode: CalculatorMode, oldMode?: CalculatorMode) => {
  if (!newMode) return

  resetState(newMode)
  calculator.value = CalculatorFactory.create(newMode, props.settings)
  
  if (newMode === 'Programmer') {
    setActiveBase('DEC' as Base)
  }
  
  if (oldMode === undefined) {
    if (storedInput.value && state.input !== storedInput.value) {
      updateState({ input: storedInput.value })
      calculator.value.input = storedInput.value
      
      if (props.mode === "Programmer") {
        calculator.value.states.DEC.input = storedInput.value
      }
    }
  } else { 
    storedInput.value = ""
  }
}, { immediate: true })

// Handle activity item selection with proper typing
const selectHistoryItem = ({ expression }: HistoryItem): void => {
  if (state.mode === 'Programmer') return

  updateState({ 
    input: expression, 
    error: '' 
  })

  calculator.value.input = expression
  calculator.value.currentExpression = ''
}
</script>
