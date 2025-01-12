<!-- Calculator Page.vue -->
<template>
  <main class="flex-grow flex">
    <div
      class="flex-grow bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300"
    >
      <div class="p-6 mx-auto">
        <calculator-display
          :input="displayStore.input"
          :preview="preview"
          :error="displayStore.error"
          :is-animating="displayStore.isAnimating"
          :animated-preview="displayStore.animatedResult"
          :active-base="displayStore.activeBase"
          :settings="settings"
          @toggle-history="$emit('toggle-history')"
        />

        <calculator-buttons
          :mode="mode"
          :display-values="displayStore.displayValues"
          :active-base="displayStore.activeBase"
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
import { computed, nextTick, onMounted, watch, inject } from "vue";
import db from "@/data/db";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import WelcomeModal from "@/layouts/modals/WelcomeModal.vue";
import CalculatorDisplay from "@/layouts/CalculatorDisplay.vue";
import CalculatorButtons from "@/layouts/CalculatorButtons.vue";
import { useDisplayStore } from "@/stores/display";
import { onBeforeRouteLeave } from "vue-router";
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
useTitle(computed(() => `${props.mode} Calculator | Mathlly`));

const emit = defineEmits(["update:mode", "toggle-history", "update-history"]);

const { calculator, updateDisplayState } = useCalculator(
  props.mode,
  props.settings
);
const { historyPanelRef, addToHistory, clearHistory } = useHistory(() => {
  emit('update-history')
})

const displayStore = useDisplayStore();
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
        displayStore.input,
        displayStore.activeBase
      );
      displayStore.preview = result;
      return calculator.value.formatResult(result, displayStore.activeBase);
    } catch (err) {
      return "";
    }
  } else {
    try {
      const result = calculator.value.evaluateExpression(displayStore.input);
      displayStore.preview = result;
      return calculator.value.formatResult(result);
    } catch (err) {
      return "";
    }
  }
});

// Update the handleButtonClick method to use the new debounced function
const handleButtonClick = (btn) => {
  const result = calculator.value.handleButtonClick(btn);
  displayStore.updateState(result);

  if (props.mode === "Programmer") {
    updateDisplayState();
  }

  if (btn === "=") {
    displayStore.setAnimation(result.result);
    displayStore.isAnimating = true;

    setTimeout(() => {
      displayStore.isAnimating = false;
    }, 500);

    if (props.mode !== "Programmer") {
      addToHistory(result.expression, result.result);
    }
  }
};

const selectHistoryItem = (item) => {
  if (props.mode === "Programmer") {
    return;
  }

  // Update calculator's internal state first
  calculator.value.input = item.expression;
  calculator.value.currentExpression = ""; // Reset currentExpression so handleNumber treats this as a new input

  // Then update the display state
  displayStore.updateState({
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
  () => {
    displayStore.updateState({
      input: "0",
      error: "",
    });
    displayStore.setActiveBase("DEC");
  }
);

watch(
  () => props.settings,
  (newSettings) => {
    displayStore.setSettings(newSettings);
    displayStore.recalculateDisplay(calculator.value);
  },
  { immediate: true }
);

watch(
  currentInput,
  (newValue) => {
    if (newValue !== displayStore.input) {
      // Update both the calculator state and the internal calculator instance
      displayStore.updateState({
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
  () => displayStore.getCurrentDisplayValue.value,
  (newValue) => {
    if (newValue !== displayStore.input) {
      displayStore.updateState({
        input: newValue,
        error: "",
      });
    }
  }
);

const handleClear = () => {
  displayStore.updateState(calculator.value.handleButtonClick("AC"));
  if (props.mode === "Programmer") {
    updateDisplayState();
  }
};

const handleBaseChange = (newBase) => {
  if (props.mode === "Programmer") {
    displayStore.setActiveBase(newBase);
    const result = calculator.value.handleBaseChange(newBase);
    displayStore.updateState(result);
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

  if (
    props.mode === "Programmer" &&
    allowedKeys[displayStore.activeBase].test(key)
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

onBeforeRouteLeave(() => {
  if (displayStore.hasPendingOperation()) {
    const currentOp = displayStore.getCurrentOperation();
    const lastNum = displayStore.getLastNumber();

    if (currentOp) {
      displayStore.storePendingOperation(currentOp, lastNum);
    }
  }

  displayStore.lastMode = props.mode;
  displayStore.persistState();
});

useEventListener("keydown", handleKeyDown, window);
onMounted(() => {
  displayStore.initializeSession();
  displayStore.loadState();

  // Resume any pending calculations
  if (displayStore.getPendingCalculation) {
    nextTick(() => displayStore.resumeCalculation(calculator.value));
  }

  if (displayStore.input !== "0") {
    nextTick(() => displayStore.recalculateDisplay(calculator.value));
  }
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
