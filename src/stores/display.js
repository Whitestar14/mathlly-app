import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useDisplayStore = defineStore("display", () => {
  // Core state
  const input = ref("0");
  const preview = ref("");
  const error = ref("");
  const isAnimating = ref(false);
  const animatedResult = ref("");
  const activeBase = ref("DEC");
  const settings = ref({});
  const isLoading = ref(true); // Add isLoading state
  
  // Programmer mode display values
  const displayValues = ref({
    HEX: { input: "0", display: "0" },
    DEC: { input: "0", display: "0" },
    OCT: { input: "0", display: "0" },
    BIN: { input: "0", display: "0" },
  });

  // Computed values
  const getCurrentDisplayValue = computed(() => {
    return displayValues.value[activeBase.value]?.input || "0";
  });

  // Actions
  const setSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const updateState = (newState) => {
    if (newState.input !== undefined) input.value = newState.input;
    if (newState.error !== undefined) error.value = newState.error;
    if (newState.preview !== undefined) preview.value = newState.preview;
    if (newState.displayValues !== undefined) displayValues.value = newState.displayValues;
    if (newState.isLoading !== undefined) isLoading.value = newState.isLoading; // Update isLoading state
  };
  

  const updateDisplayValues = (values) => {
    if (!values) return;
    Object.keys(values).forEach(base => {
      if (displayValues.value[base]) {
        displayValues.value[base] = {
          ...displayValues.value[base],
          ...values[base]
        };
      }
    });
  };

  const setActiveBase = (base) => {
    if (!["HEX", "DEC", "OCT", "BIN"].includes(base)) return;
    activeBase.value = base;
    const newInput = displayValues.value[base]?.input || "0";
    updateState({ input: newInput });
  };

  const setAnimation = (result) => {
    animatedResult.value = result;
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
      animatedResult.value = "";
    }, 500);
  };

  const clearState = () => {
    input.value = "0";
    preview.value = "";
    error.value = "";
    displayValues.value = {
      HEX: { input: "0", display: "0" },
      DEC: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
    };
    activeBase.value = "DEC";
  };

  const recalculateDisplay = (calculator, mode) => {
    if (!calculator || input.value === "0") return;

    try {
      if (mode === "Programmer") {
        const result = calculator.evaluateExpression(input.value, activeBase.value);
        updateState({
          input: calculator.formatResult(result, activeBase.value),
          error: ""
        });
        const values = calculator.updateDisplayValues();
        updateDisplayValues(values);
      } else {
        const result = calculator.evaluateExpression(input.value);
        updateState({
          input: calculator.formatResult(result),
          error: ""
        });
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  return {
    // State
    input,
    preview,
    error,
    isAnimating,
    animatedResult,
    displayValues,
    activeBase,
    settings,
    isLoading, // Export isLoading state
    
    // Getters
    getCurrentDisplayValue,
    
    // Actions
    setSettings,
    updateState,
    updateDisplayValues,
    setActiveBase,
    setAnimation,
    clearState,
    recalculateDisplay
  };
});