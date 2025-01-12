// DisplayStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useDisplayStore = defineStore("display", () => {
  // State using refs for better reactivity
  const input = ref("0");
  const preview = ref("");
  const error = ref("");
  const isAnimating = ref(false);
  const animatedResult = ref("");
  const displayValues = ref({
    HEX: { input: "0", display: "0" },
    DEC: { input: "0", display: "0" },
    OCT: { input: "0", display: "0" },
    BIN: { input: "0", display: "0" },
  });
  const activeBase = ref("DEC");
  const settings = ref({});
  const lastMode = ref("Basic");
  const currentExpression = ref("");
  const lastOperation = ref(null);
  const calculationHistory = ref([]);

  // Extended state for persisting calculations
  const persistentState = ref({
    pendingOperation: null,
    lastNumber: null,
    accumulator: null,
    lastEquals: false
  });

  // Getters
  const formattedPreview = computed(() => {
    return preview.value;
  });

  const getCurrentDisplayValue = computed(() => {
    return displayValues.value[activeBase.value]?.input || "0";
  });

  const getPendingCalculation = computed(() => {
    if (!persistentState.value.pendingOperation) return null;
    return {
      operation: persistentState.value.pendingOperation,
      value: persistentState.value.lastNumber
    };
  });

  // Actions
  const setSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const updateState = (newState) => {
    if (newState.input !== undefined) input.value = newState.input;
    if (newState.error !== undefined) error.value = newState.error;
    if (newState.currentExpression !== undefined) {
      currentExpression.value = newState.currentExpression;
    }
    if (newState.preview !== undefined) {
      preview.value = newState.preview;
    }
    if (newState.pendingOperation !== undefined) {
      persistentState.value.pendingOperation = newState.pendingOperation;
    }
    if (newState.lastNumber !== undefined) {
      persistentState.value.lastNumber = newState.lastNumber;
    }
    if (newState.accumulator !== undefined) {
      persistentState.value.accumulator = newState.accumulator;
    }
    if (newState.lastEquals !== undefined) {
      persistentState.value.lastEquals = newState.lastEquals;
    }
  };

  const storePendingOperation = (operation, number) => {
    persistentState.value.pendingOperation = operation;
    persistentState.value.lastNumber = number;
    persistentState.value.lastEquals = false;
  };

  const clearPendingOperation = () => {
    persistentState.value.pendingOperation = null;
    persistentState.value.lastNumber = null;
    persistentState.value.lastEquals = false;
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

  const persistState = () => {
    const stateToSave = {
      input: input.value,
      activeBase: activeBase.value,
      displayValues: displayValues.value,
      lastMode: lastMode.value,
      currentExpression: currentExpression.value,
      settings: settings.value,
      persistentState: persistentState.value,
      calculationHistory: calculationHistory.value,
      lastOperation: lastOperation.value
    };
    
    try {
      localStorage.setItem("calculator-state", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to persist calculator state:", error);
    }
  };

  const loadState = () => {
    try {
      const saved = localStorage.getItem("calculator-state");
      if (!saved) return;

      const state = JSON.parse(saved);
      
      // Only restore state if we're in the same session
      const sessionId = localStorage.getItem("calculator-session");
      if (!sessionId || sessionId !== window.sessionStorage.getItem("calculator-session")) {
        clearState();
        return;
      }

      updateState({
        input: state.input || "0",
        currentExpression: state.currentExpression || "",
        pendingOperation: state.persistentState?.pendingOperation || null,
        lastNumber: state.persistentState?.lastNumber || null,
        accumulator: state.persistentState?.accumulator || null,
        lastEquals: state.persistentState?.lastEquals || false
      });
      
      activeBase.value = state.activeBase || "DEC";
      displayValues.value = state.displayValues || getDefaultDisplayValues();
      lastMode.value = state.lastMode || "Basic";
      lastOperation.value = state.lastOperation || null;
      calculationHistory.value = state.calculationHistory || [];
      
      if (state.settings) {
        settings.value = state.settings;
      }
      if (state.persistentState) {
        persistentState.value = state.persistentState;
      }
    } catch (error) {
      console.error("Failed to load calculator state:", error);
      clearState();
    }
  };

  const addToCalculationHistory = (calculation) => {
    calculationHistory.value.push({
      ...calculation,
      timestamp: Date.now()
    });
    if (calculationHistory.value.length > 100) {
      calculationHistory.value.shift();
    }
  };

  const resumeCalculation = (calculator) => {
    if (!persistentState.value.pendingOperation) return;

    const { pendingOperation, lastNumber } = persistentState.value;
    try {
      const result = calculator.evaluateExpression(
        `${lastNumber} ${pendingOperation} ${input.value}`
      );
      
      updateState({
        input: calculator.formatResult(result),
        error: "",
        lastNumber: result,
        pendingOperation: null
      });

      addToCalculationHistory({
        expression: `${lastNumber} ${pendingOperation} ${input.value}`,
        result
      });
    } catch (err) {
      error.value = err.message;
    }
  };

  const initializeSession = () => {
    const sessionId = crypto.randomUUID();
    window.sessionStorage.setItem("calculator-session", sessionId);
    localStorage.setItem("calculator-session", sessionId);
  };

  const recalculateDisplay = (calculator) => {
    if (!calculator || input.value === "0") return;

    try {
      if (lastMode.value === "Programmer") {
        const result = calculator.evaluateExpression(
          input.value,
          activeBase.value
        );
        
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

  const getDefaultDisplayValues = () => ({
    HEX: { input: "0", display: "0" },
    DEC: { input: "0", display: "0" },
    OCT: { input: "0", display: "0" },
    BIN: { input: "0", display: "0" },
  });

  const clearState = () => {
    input.value = "0";
    preview.value = "";
    error.value = "";
    currentExpression.value = "";
    displayValues.value = getDefaultDisplayValues();
    persistentState.value = {
      pendingOperation: null,
      lastNumber: null,
      accumulator: null,
      lastEquals: false
    };
    lastOperation.value = null;
  };

  const hasPendingOperation = () => {
    const expression = currentExpression.value;
    
    // Check if expression exists and is a string
    if (!expression || typeof expression !== 'string') {
      return false;
    }

    const trimmedExpression = expression.trim();
    const operators = ['+', '-', '×', '÷'];
    
    return operators.some(op => trimmedExpression.includes(op));
  };

  const getCurrentOperation = () => {
    const expression = currentExpression.value;
    
    if (!expression || typeof expression !== 'string') {
      return null;
    }

    const operators = ['+', '-', '×', '÷'];
    const tokens = expression.trim().split(' ');
    
    // Find the last operator in the expression
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (operators.includes(tokens[i])) {
        return tokens[i];
      }
    }
    
    return null;
  };

  const getLastNumber = () => {
    const inputVal = input.value;
    return inputVal && typeof inputVal === 'string' ? inputVal : '0';
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
    lastMode,
    currentExpression,
    lastOperation,
    calculationHistory,
    
    // Getters
    formattedPreview,
    getCurrentDisplayValue,
    getPendingCalculation,
    
    // Actions
    setSettings,
    updateState,
    updateDisplayValues,
    setActiveBase,
    setAnimation,
    persistState,
    loadState,
    hasPendingOperation,
    getCurrentOperation,
    getLastNumber,
    initializeSession,
    recalculateDisplay,
    clearState,
    storePendingOperation,
    clearPendingOperation,
    resumeCalculation,
    addToCalculationHistory
  };
});