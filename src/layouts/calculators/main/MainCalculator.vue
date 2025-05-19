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
          @open-history="openHistory"
          @base-change="handleBaseChange"
        />

        <calculator-buttons
          :mode="state.mode"
          :input-length="input.length"
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
      :is-open="history.isOpen"
      @history-close="history.close()"
      @select-item="selectHistoryItem"
    />
  </BasePage>
</template>

<script setup>
import { computed, watch, shallowRef, onMounted, provide } from 'vue';
import { useHistory } from '@/composables/useHistory';
import { useMemory } from '@/composables/useMemory';
import { usePanel } from '@/composables/usePanel';
import { useCalculatorState } from '@/composables/useCalculatorState';
import { CalculatorController } from './MainCalculator';
import { CalculatorFactory } from '@/services/factory/CalculatorFactory';
import HistoryPanel from '@/layouts/calculators/main/HistoryPanel.vue';
import CalculatorDisplay from '@/layouts/calculators/main/CalculatorDisplay.vue';
import CalculatorButtons from '@/layouts/calculators/main/CalculatorButtons.vue';
import BasePage from '@/components/base/BasePage.vue';

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
});

// Use composables for state management
const historyService = useHistory();
const memoryService = useMemory();
const history = usePanel('history-panel');

const {
  state,
  updateState,
  resetState,
  setAnimation,
  updateDisplayValues,
  setActiveBase
} = useCalculatorState(props.mode);

// Use shallowRef for better performance with objects
const calculator = shallowRef(CalculatorFactory.create(props.mode, props.settings));
 
// Provide calculator instance to child components
provide('calculator', computed(() => calculator.value));

// Initialize controller with all dependencies
const {
  preview,
  input,
  animatedResult,
  handleClear,
  handleButtonClick,
  handleBaseChange,
} = CalculatorController({
  state,
  calculator,
  updateState,
  setAnimation,
  updateDisplayValues,
  setActiveBase,
  historyService,
  memoryService,
  toggleHistory: history.toggle
});

// Memoized computed properties
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH);
const hasMemoryValue = computed(() => memoryService.hasMemory(props.mode).value);

// History panel methods
const openHistory = () => history.open();

// Load settings on mount
onMounted(async () => {
  await props.settings.loadSettings();
})

watch(() => props.mode, (newMode) => {
  if (!newMode) return;
    resetState(newMode)
    calculator.value = CalculatorFactory.create(newMode, props.settings)

    if (newMode === 'Programmer') setActiveBase('DEC');
  },
  { immediate: true }
)

// Handle history item selection
const selectHistoryItem = ({ expression }) => {
  if (state.mode === 'Programmer') return

  updateState({input: expression, error: ''})

  calculator.value.input = expression
  calculator.value.currentExpression = ''
}
</script>
