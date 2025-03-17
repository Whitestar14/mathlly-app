<template>
  <main class="flex-grow flex">
    <div
      class="flex-grow flex-initial bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300"
    >
      <div class="p-3 mx-auto">
        <calculator-display
          :input="input"
          :preview="preview"
          :error="error"
          :is-animating="isAnimating"
          :animated-result="animatedResult"
          :active-base="activeBase"
          :mode="mode"
          @toggle-history="toggleHistory"
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
      :mode="mode"
      :is-mobile="isMobile"
      :is-open="isHistoryOpen"
      @toggle-history="toggleHistory"
      @close-history="closeHistory"
      @select-item="selectHistoryItem"
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
import { computed, watch, inject, nextTick, onMounted, provide } from "vue";
import { useTitle, useStorage } from "@vueuse/core";
import { useHistory } from "@/composables/useHistory";
import { usePanel } from "@/composables/usePanel";
import { useCalculator } from "@/composables/useCalculator";
import { useKeyboard } from "@/composables/useKeyboard";
import { useInputValidation } from "@/composables/useValidation";
import HistoryPanel from "@/layouts/pages/calculators/main/HistoryPanel.vue";
import WelcomeModal from "@/layouts/modals/WelcomeModal.vue";
import CalculatorDisplay from "@/layouts/pages/calculators/main/CalculatorDisplay.vue";
import CalculatorButtons from "@/layouts/pages/calculators/main/CalculatorButtons.vue";
import { useSettingsStore } from "@/stores/settings";

const props = defineProps({
  mode: { type: String, required: true },
  settings: { type: Object, required: true },
  isMobile: { type: Boolean, required: true },
});

const emit = defineEmits(["update:mode"]);

useTitle(computed(() => `${props.mode} Calculator - Mathlly`));

const { isValidForBase } = useInputValidation();

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

provide(
  "calculator",
  computed(() => calculator.value)
);

const input = computed(() => state.value.input);
const error = computed(() => state.value.error);
const isAnimating = computed(() => state.value.isAnimating);
const animatedResult = computed(() => state.value.animatedResult);
const activeBase = computed(() => state.value.activeBase);
const displayValues = computed(() => state.value.displayValues);
const maxInputLength = computed(() => calculator.value.MAX_INPUT_LENGTH);

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

const { addToHistory } = useHistory();

const currentInput = inject("currentInput");
const showWelcomeModal = useStorage("mathlly-welcome-shown", true);

const { isOpen: isHistoryOpen, toggle: toggleHistory, close: closeHistory } = usePanel('history-panel', props.isMobile);
watch(
  () => props.isMobile,
  (newIsMobile) => {
    if (newIsMobile) {
      closeHistory();
    }
  },
  { immediate: true }
);

const handleButtonClick = (btn) => {
  try {
    const result = calculator.value.handleButtonClick(btn);

    updateState({
      input: result.input,
      error: result.error || "",
    });

    if (btn === "=" && props.mode === "Programmer") {
      if (result.displayValues) {
        updateDisplayValues(result.displayValues);
        setAnimation(result.result);
      }
    } else if (props.mode === "Programmer") {
      nextTick(() => updateDisplayState());
    }

    if (btn === "=" && props.mode !== "Programmer" && result.result) {
      addToHistory(result.expression, result.result);
      setAnimation(result.result);
    }
  } catch (err) {
    console.error("Calculator operation error:", err);
    updateState({
      input: "Error",
      error: "Operation failed",
    });
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
        displayValues: result.displayValues,
      });
    });
  }
};

const { setContext, clearContext, setBase } = useKeyboard("calculator", {
  clear: () => handleButtonClick("AC"),
  calculate: () => handleButtonClick("="),
  backspace: () => handleButtonClick("backspace"),
  input: (value) => {
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

const settingsStore = useSettingsStore();

onMounted(async () => {
  await settingsStore.loadSettings();

  settingsStore.setCurrentMode(settingsStore.defaultMode);
  emit("update:mode", settingsStore.defaultMode);
});

watch(
  () => props.mode,
  (newMode) => {
    clearState();
    calculator.value = createCalculator(newMode);
    settingsStore.setCurrentMode(newMode);

    if (newMode === "Programmer") {
      setActiveBase("DEC");
      setContext("programmer");
    } else {
      clearContext("programmer");
    }
  },
  { immediate: true }
);

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

const selectHistoryItem = ({ expression }) => {
  if (props.mode === "Programmer") return;

  updateState({ input: expression, error: "" });
  calculator.value.input = expression;
  calculator.value.currentExpression = "";
  currentInput.value = expression;
};

const closeWelcomeModal = () => {
  showWelcomeModal.value = false;
  localStorage.setItem("mathlly-welcome-shown", "true");
};
</script>
