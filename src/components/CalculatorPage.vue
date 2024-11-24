<template>
  <main class="flex-grow flex">
    <div
      class="flex-grow bg-white dark:bg-gray-800 shadow-xl overflow-hidden transition-colors duration-300"
    >
      <div class="px-6 mx-auto" :class="isMobile ? 'py-6' : ''">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-4 md:hidden">
              <button
                @click="$emit('toggle-history')"
                class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <HistoryIcon class="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <calculator-display
          :input="calculatorState.input"
          :preview="preview"
          :error="calculatorState.error"
          :isAnimating="isAnimating"
          :animatedPreview="animatedResult"
          :activeBase="activeBase"
        />

        <calculator-buttons
          :mode="mode"
          @button-click="handleButtonClick"
          @clear="handleClear"
          @base-change="handleBaseChange"
          :display-value="displayValue"
        />
      </div>
    </div>

    <history-panel
      v-if="!isMobile"
      ref="historyPanelRef"
      :isOpen="isHistoryOpen"
      :isMobile="isMobile"
      @selectHistoryItem="selectHistoryItem"
      @deleteHistoryItem="deleteHistoryItem"
      @clearHistory="clearHistory"
      class="w-1/4 min-w-[250px] max-w-[400px]"
    />

    <div v-if="!isMobile" class="fixed bottom-16 right-4 z-[100]">
      <button
        @click="openShortcutModal"
        v-tippy="{content:'Keyboard Shortcuts'}"
        class="text-gray-600 bg-gray-200 hover:bg-gray-300 hover:text-indigo-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-full p-3 shadow-lg transition-colors duration-300"
      >
        <KeyboardIcon class="h-6 w-6" />
      </button>
    </div>

    <shortcut-guide v-model:open="isShortcutModalOpen"/>
  </main>
</template>

<script setup>
import { HistoryIcon, KeyboardIcon } from "lucide-vue-next";
import { bignumber, evaluate, format, fraction } from "mathjs";
import {
  computed,
  defineEmits,
  defineProps,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import db from "../data/db";
import CalculatorButtons from "./CalculatorButtons.vue";
import CalculatorDisplay from "./CalculatorDisplay.vue";
import HistoryPanel from "./HistoryPanel.vue";
import ShortcutGuide from "./ShortcutGuide.vue";
import { ProgrammerCalculator } from './utils/ProgrammerCalculator';
import { StandardCalculator } from './utils/StandardCalculator';
import { BasicCalculator } from './utils/BasicCalculator';

const props = defineProps(["mode", "settings", "isMobile", "isHistoryOpen"]);

const emit = defineEmits(["update:mode", "toggle-history", "update-history"]);

const currentInput = inject("currentInput");
const isAnimating = ref(false);
const animatedResult = ref("");
const historyPanelRef = ref(null);
const isShortcutModalOpen = ref(false);

const calculator = computed(() => {
  switch (props.mode) {
    case 'Programmer':
      return new ProgrammerCalculator(props.settings);
    case 'Standard':
      return new StandardCalculator(props.settings);
    case 'Basic':
      return new BasicCalculator(props.settings);
    default:
      return new StandardCalculator(props.settings);
  }
});

const calculatorState = ref({
  input: currentInput.value || "0",
  error: "",
});

const activeBase = ref("DEC");
const displayValue = ref({
  hex: "0",
  dec: "0",
  oct: "0",
  bin: "0",
});

// Watch for changes in currentInput
watch(currentInput, (newValue) => {
  calculatorState.value.input = newValue;
});

// Watch for changes in local input and update currentInput
watch(() => calculatorState.value.input, (newValue) => {
  currentInput.value = newValue;
});

// Watch for changes in mode and reset the calculator state
watch(() => props.mode, () => {
  calculatorState.value = {
    input: "0",
    error: "",
  };
  activeBase.value = "DEC";
  displayValue.value = {
    hex: "0",
    dec: "0",
    oct: "0",
    bin: "0",
  };
});

const preview = computed(() => {
  try {
    const result = calculator.value.evaluateExpression(calculatorState.value.input);
    return calculator.value.formatResult(result);
  } catch (err) {
    return "";
  }
});

const addToHistory = async (expression, result) => {
  const timestamp = new Date().getTime();
  const id = await db.history.add({ expression, result, timestamp });
  emit("update-history");

  // Update the history panel
  if (historyPanelRef.value) {
    await nextTick();
    historyPanelRef.value.updateHistory();
  }

  return id;
};

const selectHistoryItem = (item) => {
  calculatorState.value.input = item.expression;
};

const deleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("update-history");
};

const clearHistory = async () => {
  await db.history.clear();
  emit("update-history");
};

const handleButtonClick = (btn) => {
  const result = calculator.value.handleButtonClick(btn);
  calculatorState.value = result;

  if (btn === "=") {
    animatedResult.value = calculatorState.value.input;
    isAnimating.value = true;

    setTimeout(() => {
      isAnimating.value = false;
    }, 500);

    addToHistory(calculatorState.value.input, calculatorState.value.input);
  }

  if (props.mode === 'Programmer') {
    updateDisplayValue(calculatorState.value.input);
  }
};

const handleClear = () => {
  calculatorState.value = calculator.value.handleButtonClick('AC');
  if (props.mode === 'Programmer') {
    updateDisplayValue(calculatorState.value.input);
  }
};

const handleBaseChange = (newBase) => {
  if (props.mode === 'Programmer') {
    activeBase.value = newBase;
    calculatorState.value = calculator.value.handleBaseChange(newBase);
    updateDisplayValue(calculatorState.value.input);
  }
};

const updateDisplayValue = (value) => {
  if (props.mode === 'Programmer') {
    displayValue.value = calculator.value.updateDisplayValue(value);
  }
};

const handleKeyDown = (event) => {
  const key = event.key;
  const allowedKeys = {
    HEX: /^[0-9A-Fa-f]$/,
    DEC: /^[0-9]$/,
    OCT: /^[0-7]$/,
    BIN: /^[01]$/
  };

  if (props.mode === 'Programmer' && allowedKeys[activeBase.value].test(key)) {
    handleButtonClick(key.toUpperCase());
  } else if (['+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace'].includes(key)) {
    event.preventDefault();
    switch (key) {
      case '+':
        handleButtonClick('+');
        break;
      case '-':
        handleButtonClick('-');
        break;
      case '*':
        handleButtonClick('×');
        break;
      case '/':
        handleButtonClick('÷');
        break;
      case '=':
      case 'Enter':
        handleButtonClick('=');
        break;
      case 'Escape':
        handleButtonClick('C');
        break;
      case 'Backspace':
        handleButtonClick('backspace');
        break;
    }
  } else if (props.mode !== 'Programmer') {
    if (/^[0-9.]$/.test(key)) {
      handleButtonClick(key);
    }
  } else {
    event.preventDefault();
  }
};

const openShortcutModal = () => {
  isShortcutModalOpen.value = true;
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
</style>