<!-- Calculator Page.vue -->
<template>
  <main class="flex-grow flex">
    <!-- Welcome Modal -->
    <WelcomeModal
      :is-open="showWelcomeModal"
      @update:is-open="showWelcomeModal = $event"
      @close="closeWelcomeModal"
    />

    <div
      class="flex-grow bg-white dark:bg-gray-800 shadow-xl overflow-hidden transition-colors duration-300"
    >
      <div class="p-6 mx-auto">
        <calculator-display
          :input="calculatorState.input"
          :preview="preview"
          :error="calculatorState.error"
          :is-animating="isAnimating"
          :animated-preview="animatedResult"
          :active-base="activeBase"
          :settings="settings"
          @toggle-history="toggleHistory"
        />

        <calculator-buttons
          :mode="mode"
          :display-values="displayValues"
          :active-base="activeBase"
          @button-click="handleButtonClick"
          @clear="handleClear"
          @base-change="handleBaseChange"
        />
      </div>
    </div>

    <history-panel
    ref="historyPanelRef"
      v-if="!isMobile"
      :is-open="isHistoryOpen"
      :is-mobile="isMobile"
      :mode="mode"
      class="w-1/4 min-w-[250px] max-w-[400px]"
      @select-history-item="selectHistoryItem"
      @delete-history-item="deleteHistoryItem"
      @clear-history="clearHistory"
    />
  </main>
</template>

<script setup>
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  inject,
} from "vue";
import db from "@/data/db";
import { BasicCalculator } from "@/utils/BasicCalculator";
import { ProgrammerCalculator } from "@/utils/ProgrammerCalculator";
import { StandardCalculator } from "@/utils/StandardCalculator";
import CalculatorButtons from "@/layouts/CalculatorButtons.vue";
import CalculatorDisplay from "@/layouts/CalculatorDisplay.vue";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import WelcomeModal from "@/layouts/modals/WelcomeModal.vue";

const asyncSetup = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated delay

  const calculatorState = ref({
    input: "0",
    error: "",
  });

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

  return {
    calculatorState,
    calculator,
  };
};

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
  isHistoryOpen: { type: Boolean, required: true },
});

const { calculatorState, calculator } = await asyncSetup();

const emit = defineEmits(["update:mode", "toggle-history", "update-history"]);

const currentInput = inject("currentInput");
const isAnimating = ref(false);
const animatedResult = ref("");
const historyPanelRef = ref(null);
const showWelcomeModal = ref(!localStorage.getItem("mathlly-welcome-shown"));
const isHistoryOpen = ref(false);

const closeWelcomeModal = () => {
  showWelcomeModal.value = false;
  localStorage.setItem("mathlly-welcome-shown", "true");
};

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
    return;
  }

  // Update calculator's internal state first
  calculator.value.input = item.expression;
  calculator.value.currentExpression = ""; // Reset currentExpression so handleNumber treats this as a new input

  // Then update the display state
  calculatorState.value = {
    input: item.expression,
    error: "",
  };

  // Update shared input state
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

const toggleHistory = () => {
    isHistoryOpen.value = !isHistoryOpen.value;
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

// Add this watch in your script setup
watch(
  currentInput,
  (newValue) => {
    if (newValue !== calculatorState.value.input) {
      // Update both the calculator state and the internal calculator instance
      calculatorState.value = {
        input: newValue,
        error: "",
      };

      // Reset the calculator's internal state with the new input
      calculator.value.input = newValue;
      calculator.value.currentExpression = "";
      calculator.value.error = "";

      if (props.mode === "Programmer") {
        updateDisplayState();
      }
    }
  },
  { immediate: true }
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
