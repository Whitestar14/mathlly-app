<!-- Calculator Page.vue -->
<template>
  <main class="flex-grow flex">
    <div
      class="flex-grow bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300"
    >
      <div class="p-6 mx-auto">
        <calculator-display
          :input="input"
          :preview="preview"
          :error="error"
          :is-animating="isAnimating"
          :animated-preview="animatedResult"
          :active-base="activeBase"
          :settings="settings"
          :mode="mode"
          @toggle-history="$emit('toggle-history')"
        />

        <calculator-buttons
          :mode="mode"
          :display-values="displayValues"
          :active-base="activeBase"
          :input-length="input.length"
          :max-length="maxInputLength"
          @button-click="handleButtonClick"
          @clear="handleClear"
          @base-change="handleBaseChange"
        />
      </div>
    </div>

    <history-panel
      v-if="!isMobile"
      ref="historyPanelRef"
      :is-open="isHistoryOpen"
      :is-mobile="isMobile"
      :mode="mode"
      class="w-1/4 min-w-[250px] max-w-[400px]"
      @select-history-item="selectHistoryItem"
      @delete-history-item="deleteHistoryItem"
      @clear-history="clearHistory"
    />

    <!-- Welcome Modal -->
    <welcome-modal
      :is-open="showWelcomeModal"
      @update:is-open="showWelcomeModal = $event"
      @close="closeWelcomeModal"
    />
  </main>
</template>

<script setup>
import { computed, watch, inject, nextTick } from "vue";
import db from "@/data/db";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import WelcomeModal from "@/layouts/modals/WelcomeModal.vue";
import CalculatorDisplay from "@/layouts/CalculatorDisplay.vue";
import CalculatorButtons from "@/layouts/CalculatorButtons.vue";
import { useHistory } from "@/composables/useHistory";
import { useCalculator } from "@/composables/useCalculator";
import { useTitle, useStorage, useEventListener } from "@vueuse/core";

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
  isHistoryOpen: { type: Boolean, required: true },
});

// Dynamic page title
useTitle(computed(() => `${ props.mode } Calculator | Mathlly`));

const emit = defineEmits(["update:mode", "toggle-history", "update-history"]);

const {
  calculator,
  createCalculator, // Add this to destructuring
  state,
  updateState,
  updateDisplayValues,
  setActiveBase,
  setAnimation,
  clearState,
  updateDisplayState
} = useCalculator(props.mode, props.settings);

// Replace all refs with computed properties based on state
const input = computed(() => state.value.input);
const error = computed(() => state.value.error);
const isAnimating = computed(() => state.value.isAnimating);
const animatedResult = computed(() => state.value.animatedResult);
const activeBase = computed(() => state.value.activeBase);
const displayValues = computed(() => state.value.displayValues);
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH);

const { historyPanelRef, addToHistory, clearHistory } = useHistory(() => {
  emit("update-history");
});

const currentInput = inject("currentInput");
const showWelcomeModal = useStorage("mathlly-welcome-shown", true);

const closeWelcomeModal = () => {
  showWelcomeModal.value = false;
  localStorage.setItem("mathlly-welcome-shown", "true");
};

const preview = computed(() => {
  if (props.mode === "Programmer") {
    try {
      const result = calculator.value.evaluateExpression(
        input.value,
        activeBase.value
      );
      return calculator.value.formatResult(result, activeBase.value);
    } catch (err) {
      return "";
    }
  } else {
    try {
      const result = calculator.value.evaluateExpression(input.value);
      return calculator.value.formatResult(result);
    } catch (err) {
      return "";
    }
  }
});

// First, update the handleButtonClick in CalculatorPage.vue
const handleButtonClick = (btn) => {
  if (input.value === "Error") {
    handleClear();
    return;
  }

  const result = calculator.value.handleButtonClick(btn);

  // For equals operation in Programmer mode
  if (btn === "=" && props.mode === "Programmer") {
    if (result.result && result.displayValues) {
      // Update display values first
      updateDisplayValues(result.displayValues);

      // Then update the input state to match the result
      updateState({
        input: result.result,
        error: result.error || "",
      });

      setAnimation(result.result);
    }
  } else {
    // For non-equals operations
    updateState({
      input: result.input,
      error: result.error || ""
    });

    if (props.mode === "Programmer") {
      nextTick(() => {
        updateDisplayState();
      });
    }

    if (btn === "=" && props.mode !== "Programmer") {
      if (result.error) {
        // If there's an error, don't add to history
        setAnimation(result.result);
      } else {
        setAnimation(result.result);
        addToHistory(result.expression, result.result);
      }
    }
  }
    // Clear the error after a short delay
    if (result.error) {
        setTimeout(() => {
            updateState({ error: "" });
        }, 2000); // Adjust the delay as needed
    }
};

const selectHistoryItem = (item) => {
  if (props.mode === "Programmer") {
    return;
  }

  calculator.value.input = item.expression;
  calculator.value.currentExpression = ""; // Reset currentExpression so handleNumber treats this as a new input

  // Update calculator's internal state first
  updateState({
    input: item.expression,
    error: "",
  });

  // Update shared input state
  currentInput.value = item.expression;
};

const deleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("update-history");
};

watch(
  () => props.mode,
  (newMode) => {
    clearState();
    calculator.value = createCalculator(newMode); // Now createCalculator is available

    if (newMode === 'Programmer') {
      setActiveBase("DEC");
    }
  },
  { immediate: true }
);

watch(
  currentInput,
  (newValue) => {
    if (newValue !== input.value && newValue !== "Error") { // Check if the new value is an error
      // Update both the calculator state and the internal calculator instance
      updateState({
        input: newValue,
        error: "",
      });

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
  () => input.value,
  (newInput) => {
    if (props.mode === "Programmer" && newInput !== "Error") { // Check if the new input is an error
      nextTick(() => {
        try {
          const updatedDisplayValues = calculator.value.updateDisplayValues(newInput);
          updateDisplayValues(updatedDisplayValues);
        } catch (error) {
          console.error("Error updating display values:", error);
        }
      });
    }
  },
  { deep: true }
);

const handleClear = () => {
  const result = calculator.value.handleButtonClick("AC");
  updateState({
    input: result.input,
    error: "" // Clear the error here
  });

  if (props.mode === "Programmer") {
    updateDisplayState();
  }
};

const handleBaseChange = (newBase) => {
  if (props.mode === "Programmer") {
    const result = calculator.value.handleBaseChange(newBase);

    // Update the state after base change
    nextTick(() => {
      setActiveBase(newBase);
      updateState({
        input: result.input,
        error: result.error || "",
        displayValues: result.displayValues
      });
    });
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

  if (
    props.mode === "Programmer" &&
    allowedKeys[activeBase.value].test(key)
  ) {
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

useEventListener("keydown", handleKeyDown, window);
</script>

<style scoped>
@import url("@/assets/css/animation.css");
</style>