<!-- Calculator Page.vue -->
<template>
  <main class="flex-grow flex">
    <!-- Welcome Modal -->
    <welcome-modal
      v-model:is-open="showWelcomeModal"
      @close="closeWelcomeModal"
    />

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
          :is-animating="isAnimating"
          :animated-preview="animatedResult"
          :active-base="activeBase"
          :settings="settings"
        />

        <calculator-buttons
          :mode="mode"
          @button-click="handleButtonClick"
          @clear="handleClear"
          @base-change="handleBaseChange"
          :display-values="displayValues"
          :active-base="activeBase"
        />
      </div>
    </div>

    <history-panel
      v-if="!isMobile"
      ref="historyPanelRef"
      :is-open="isHistoryOpen"
      :is-mobile="isMobile"
      :mode="mode"
      @select-history-item="selectHistoryItem"
      @delete-history-item="deleteHistoryItem"
      @clear-history="clearHistory"
      @close="$emit('toggle-history')"
      class="w-1/4 min-w-[250px] max-w-[400px]"
    />

    <div v-if="!isMobile" class="fixed bottom-16 right-4 z-[100]">
      <button
        @click="openShortcutModal"
        v-tippy="{ content: 'Keyboard Shortcuts' }"
        class="text-gray-600 bg-gray-200 hover:bg-gray-300 hover:text-indigo-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-full p-3 shadow-lg transition-colors duration-300"
      >
        <KeyboardIcon class="h-6 w-6" />
      </button>
    </div>

    <shortcut-guide v-model:open="isShortcutModalOpen" />
  </main>
</template>

<script setup>
import { HistoryIcon, KeyboardIcon } from "lucide-vue-next";
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import db from "../../data/db";
import { BasicCalculator } from "../utils/BasicCalculator";
import { ProgrammerCalculator } from "../utils/ProgrammerCalculator";
import { StandardCalculator } from "../utils/StandardCalculator";
import CalculatorButtons from "../CalculatorButtons.vue";
import CalculatorDisplay from "../CalculatorDisplay.vue";
import HistoryPanel from "../HistoryPanel.vue";
import ShortcutGuide from "../ShortcutGuide.vue";
import WelcomeModal from "../WelcomeModal.vue";

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
  isHistoryOpen: { type: Boolean, required: true },
});

const emit = defineEmits(["update:mode", "toggle-history", "update-history"]);

const currentInput = ref("0");
const isAnimating = ref(false);
const animatedResult = ref("");
const historyPanelRef = ref(null);
const isShortcutModalOpen = ref(false);
const showWelcomeModal = ref(!localStorage.getItem("mathlly-welcome-shown"));

const closeWelcomeModal = () => {
  showWelcomeModal.value = false;
  localStorage.setItem("mathlly-welcome-shown", "true");
};

const calculator = computed(() => {
  switch (props.mode) {
    case "Programmer":
      return new ProgrammerCalculator(props.settings);
    case "Standard":
      return new StandardCalculator(props.settings);
    default:
      return new BasicCalculator(props.settings);
  }
});

const calculatorState = ref({
  input: currentInput.value || "0",
  error: "",
});

const activeBase = ref("DEC");

const preview = computed(() => {
  if (props.mode === "Programmer") {
    try {
      const result = calculator.value.evaluateExpression(
        calculatorState.value.input,
        activeBase.value
      );
      return calculator.value.formatResult(result, activeBase.value);
    } catch (err) {
      return "";
    }
  } else {
    try {
      const result = calculator.value.evaluateExpression(
        calculatorState.value.input
      );
      return calculator.value.formatResult(result);
    } catch (err) {
      return "";
    }
  }
});

// Import useDebounce from vueuse

const addToHistoryDebounced = (() => {
  let timeout;
  return (expression, result) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const timestamp = new Date().getTime();
      await db.history.add({ expression, result, timestamp });
      emit("update-history");

      if (historyPanelRef.value) {
        await nextTick();
        historyPanelRef.value.updateHistory();
      }
    }, 500); // 500ms debounce time
  };
})();

const selectHistoryItem = (item) => {
  if (props.mode === "Programmer") {
    return; // Maintain disabled state for Programmer mode
  }
  
  // Update both the display state and calculator state
  calculatorState.value = {
    input: item.expression,
    error: "",
    expression: item.expression
  };
  
  // Update the calculator's internal state
  calculator.value.input = item.expression;
  calculator.value.currentExpression = item.expression;
  calculator.value.error = "";
  
  currentInput.value = item.expression;
};

const deleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("update-history");
};

const clearHistory = async () => {
  await db.history.clear();
  emit("update-history");
};

const displayValues = ref({
  HEX: { input: "0", display: "0" },
  DEC: { input: "0", display: "0" },
  OCT: { input: "0", display: "0" },
  BIN: { input: "0", display: "0" },
});

watch(
  () => props.mode,
  () => {
    calculatorState.value = {
      input: "0",
      error: "",
    };
    activeBase.value = "DEC";
  }
);

watch(
  () => calculatorState.value.input,
  (newInput) => {
    if (props.mode === "Programmer") {
      // Force an update of display values
      try {
        const updatedDisplayValues =
          calculator.value.updateDisplayValues(newInput);
        displayValues.value = {
          ...displayValues.value,
          ...updatedDisplayValues,
        };
      } catch (error) {
        console.error("Error updating display values:", error);
      }
    }
  },
  { deep: true }
);

const updateDisplayState = () => {
  if (props.mode === "Programmer") {
    try {
      const updatedValues = calculator.value.updateDisplayValues();
      displayValues.value = {
        ...displayValues.value,
        ...updatedValues,
      };
      calculatorState.value.input =
        updatedValues[activeBase.value]?.input || "0";
    } catch (error) {
      console.error("Error in updateDisplayState:", error);
    }
  }
};

const handleButtonClick = (btn) => {
  const result = calculator.value.handleButtonClick(btn);
  calculatorState.value = result;

  if (props.mode === "Programmer") {
    updateDisplayState();
  }

  if (btn === "=") {
    animatedResult.value = result.result;
    isAnimating.value = true;

    setTimeout(() => {
      isAnimating.value = false;
    }, 500);

    // Store both the expression and the result
    if (props.mode !== "Programmer") {
      addToHistoryDebounced(result.expression, result.result);
    }
  }
};

const handleClear = () => {
  calculatorState.value = calculator.value.handleButtonClick("AC");
  if (props.mode === "Programmer") {
    updateDisplayState();
  }
};

const handleBaseChange = (newBase) => {
  if (props.mode === "Programmer") {
    activeBase.value = newBase;
    const result = calculator.value.handleBaseChange(newBase);
    calculatorState.value = result;
    updateDisplayState();
  }
};

const handleKeyDown = (event) => {
  const key = event.key;
  const allowedKeys = {
    HEX: /^[0-9A-Fa-f]$/,
    DEC: /^[0-9]$/,
    OCT: /^[0-7]$/,
    BIN: /^[01]$/,
  };

  if (props.mode === "Programmer" && allowedKeys[activeBase.value].test(key)) {
    handleButtonClick(key.toUpperCase());
  } else if (
    ["+", "-", "*", "/", "=", "Enter", "Escape", "Backspace"].includes(key)
  ) {
    event.preventDefault();
    switch (key) {
      case "+":
        handleButtonClick("+");
        break;
      case "-":
        handleButtonClick("-");
        break;
      case "*":
        handleButtonClick("×");
        break;
      case "/":
        handleButtonClick("÷");
        break;
      case "=":
      case "Enter":
        handleButtonClick("=");
        break;
      case "Escape":
        handleButtonClick("C");
        break;
      case "Backspace":
        handleButtonClick("backspace");
        break;
    }
  } else if (props.mode !== "Programmer") {
    if (/^[0-9.]$/.test(key)) {
      handleButtonClick(key);
    }
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
</style>
