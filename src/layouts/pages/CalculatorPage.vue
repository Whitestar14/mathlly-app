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
import { useTitle, useStorage } from "@vueuse/core";
import { useHistory } from "@/composables/useHistory";
import { useCalculator } from "@/composables/useCalculator";
import { useKeyboard } from "@/composables/useKeyboard";
import { useInputValidation } from '@/composables/useValidation'
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import WelcomeModal from "@/layouts/modals/WelcomeModal.vue";
import CalculatorDisplay from "@/layouts/CalculatorDisplay.vue";
import CalculatorButtons from "@/layouts/CalculatorButtons.vue";
import db from "@/data/db";

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
  isHistoryOpen: { type: Boolean, required: true },
});

const emit = defineEmits(["update:mode", "toggle-history", "update-history"]);

// Dynamic page title
useTitle(computed(() => `${props.mode} Calculator | Mathlly`));

const { isValidForBase } = useInputValidation()

// Core calculator setup
const {
  calculator,
  createCalculator,
  state,
  updateState,
  updateDisplayValues,
  setActiveBase,
  setAnimation,
  clearState,
  updateDisplayState,
} = useCalculator(props.mode, props.settings);

// Computed properties from state
const input = computed(() => state.value.input);
const error = computed(() => state.value.error);
const isAnimating = computed(() => state.value.isAnimating);
const animatedResult = computed(() => state.value.animatedResult);
const activeBase = computed(() => state.value.activeBase);
const displayValues = computed(() => state.value.displayValues);
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH);

// Preview computation for display
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

// History management
const { historyPanelRef, addToHistory, clearHistory } = useHistory(() => {
  emit("update-history");
});

// Other setup
const currentInput = inject("currentInput");
const showWelcomeModal = useStorage("mathlly-welcome-shown", true);

// Calculator operation handlers

const handleButtonClick = (btn) => {
  if (input.value === "Error") {
    handleClear();
    return;
  }

  const result = calculator.value.handleButtonClick(btn);

    // Add validation for Programmer mode
    if (props.mode === "Programmer" && !isValidForBase(btn, activeBase.value)) {
    return; // Silently ignore invalid inputs for the current base
  }

  if (btn === "=" && props.mode === "Programmer") {
    if (result.result && result.displayValues) {
      updateDisplayValues(result.displayValues);
      updateState({
        input: result.result,
        error: result.error || "",
      });
      setAnimation(result.result);
    }
  } else {
    updateState({
      input: result.input,
      error: result.error || "",
    });

    if (props.mode === "Programmer") {
      nextTick(() => {
        updateDisplayState();
      });
    }

    if (btn === "=" && props.mode !== "Programmer") {
      if (result.error) {
        setAnimation(result.result);
      } else {
        setAnimation(result.result);
        addToHistory(result.expression, result.result);
      }
    }
  }

  if (result.error) {
    setTimeout(() => {
      updateState({ error: "" });
    }, 2000);
  }
};

const handleClear = () => {
  const result = calculator.value.handleButtonClick("AC");
  updateState({
    input: result.input,
    error: "",
  });

  if (props.mode === "Programmer") {
    updateDisplayState();
  }
};

const handleBaseChange = (newBase) => {
  if (props.mode === "Programmer") {
    const result = calculator.value.handleBaseChange(newBase);
    nextTick(() => {
      setActiveBase(newBase);
      setBase(newBase);
      updateState({
        input: result.input,
        error: result.error || "",
        displayValues: result.displayValues
      });
    });
  }
};

const { setContext, clearContext, setBase } = useKeyboard('calculator', {
  clear: () => handleButtonClick('AC'),
  calculate: () => handleButtonClick('='),
  backspace: () => handleButtonClick('backspace'),
  input: (value) => {
    // Additional validation layer before handling input
    if (props.mode === "Programmer") {
      if (isValidForBase(value, activeBase.value)) {
        handleButtonClick(value);
      }
    } else {
      handleButtonClick(value);
    }
  },
  setBase: (base) => handleBaseChange(base),
});

// Mode change handling
watch(
  () => props.mode,
  (newMode) => {
    clearState();
    calculator.value = createCalculator(newMode);

    if (newMode === "Programmer") {
      setActiveBase("DEC");
      setContext("programmer");
    } else {
      clearContext("programmer");
    }
  },
  { immediate: true }
);

// Input synchronization
watch(
  currentInput,
  (newValue) => {
    if (newValue !== input.value && newValue !== "Error") {
      updateState({
        input: newValue,
        error: "",
      });
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

// Programmer mode display value updates
watch(
  () => input.value,
  (newInput) => {
    if (props.mode === "Programmer" && newInput !== "Error") {
      nextTick(() => {
        try {
          const updatedDisplayValues =
            calculator.value.updateDisplayValues(newInput);
          updateDisplayValues(updatedDisplayValues);
        } catch (error) {
          console.error("Error updating display values:", error);
        }
      });
    }
  },
  { deep: true }
);

// History operations
const selectHistoryItem = (item) => {
  if (props.mode === "Programmer") return;

  calculator.value.input = item.expression;
  calculator.value.currentExpression = "";

  updateState({
    input: item.expression,
    error: "",
  });

  currentInput.value = item.expression;
};

const deleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("update-history");
};

const closeWelcomeModal = () => {
  showWelcomeModal.value = false;
  localStorage.setItem("mathlly-welcome-shown", "true");
};
</script>

<style scoped>
@import url("../../assets/css/animation.css");
</style>
