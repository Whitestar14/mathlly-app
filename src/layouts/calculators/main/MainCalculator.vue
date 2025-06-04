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

<script setup>
import { computed, watch, shallowRef, provide, defineAsyncComponent } from 'vue';
import { useSessionStorage } from '@vueuse/core';
import { useHistory } from '@/composables/useHistory';
import { useMemory } from '@/composables/useMemory';
import { usePanel } from '@/composables/usePanel';
import { useCalculatorState } from '@/composables/useCalculatorState';
import { CalculatorController } from './MainCalculator';
import { CalculatorFactory } from '@/services/factory/CalculatorFactory';
import CalculatorDisplay from '@/layouts/calculators/main/CalculatorDisplay.vue';
import CalculatorButtons from '@/layouts/calculators/main/CalculatorButtons.vue';
import BasePage from '@/components/base/BasePage.vue';

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
});

const ActivityPanel = defineAsyncComponent(() => import('@/layouts/calculators/main/ActivityPanel.vue'));

// Use composables for state management
const historyService = useHistory();
const memoryService = useMemory();
const activityPanel = usePanel('activity');

const {
  state,
  updateState,
  resetState,
  setAnimation,
  updateDisplayValues,
  setActiveBase
} = useCalculatorState(props.mode);

const storedInput = useSessionStorage(`calculator-session-input-${props.mode}`, '');

const calculator = shallowRef(CalculatorFactory.create(props.mode, props.settings));
 
// Provide calculator instance to child components
provide('calculator', computed(() => calculator.value));
provide('calculatorState', state);

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
  toggleActivity: activityPanel.toggle
});

// Memoized computed properties
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH);
const hasMemoryValue = computed(() => memoryService.hasMemory(props.mode).value);

// activityPanel panel methods
const openActivity = () => activityPanel.open();

watch(() => state.input, (newRawInput) => {
  if (storedInput.value !== newRawInput) {
    storedInput.value = newRawInput;
  }
});

watch(() => props.mode, (newMode, oldMode) => {
  if (!newMode) return;

  resetState(newMode);
  calculator.value = CalculatorFactory.create(newMode, props.settings);
  if (newMode === 'Programmer') {
    setActiveBase('DEC');
  }
  if (oldMode === undefined) {
    if (storedInput.value && state.input !== storedInput.value) {
      updateState({ input: storedInput.value });
      calculator.value.input = storedInput.value;
      if (props.mode === "Programmer") {
      calculator.value.states.DEC.input = storedInput.value;
      }
    }
  } else { 
    storedInput.value = "";
  }
}, { immediate: true });


// Handle activityPanel item selection
const selectHistoryItem = ({ expression }) => {
  if (state.mode === 'Programmer') return

  updateState({input: expression, error: ''})

  calculator.value.input = expression
  calculator.value.currentExpression = ''
}
</script>
