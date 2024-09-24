<!-- CalculatorPage.vue -->
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
          :input="input"
          :preview="preview"
          :error="error"
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
        @click="openShortcutModal" v-tippy="{content:'Keyboard Shortcuts'}"
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

const props = defineProps(["mode", "settings", "isMobile", "isHistoryOpen"]);

const emit = defineEmits(["update:mode", "toggle-history", "update-history"]);

const currentInput = inject("currentInput");
const input = ref(currentInput.value || "0");
const error = ref("");
const isAnimating = ref(false);
const animatedResult = ref("");
const lastOperator = ref("");
const lastNumber = ref("");
const MAX_INPUT_LENGTH = 50;
const historyPanelRef = ref(null);
const isOperator = (char) => ["+", "-", "×", "÷"].includes(char);
const isLastCharOperator = () => isOperator(input.value.trim().slice(-1));
const isShortcutModalOpen = ref(false);

// Methods to open/close the modal
const openShortcutModal = () => {
  isShortcutModalOpen.value = true;
};

// Watch for changes in currentInput
watch(currentInput, (newValue) => {
  input.value = newValue;
});

// Watch for changes in local input and update currentInput
watch(input, (newValue) => {
  currentInput.value = newValue;
});

// Watch for changes to the settings prop and recalculate the preview.
watch(
  () => props.settings,
  () => {
    if (input.value) {
      try {
        const result = evaluateExpression(input.value);
        animatedResult.value = formatResult(result);
      } catch (err) {
        error.value = err.message;
      }
    }
  },
  { deep: true }
);

// Watch for changes in input and update displayValue
watch(input, (newValue) => {
  if (newValue !== "Error") {
    try {
      const result = evaluateExpression(newValue);
      updateDisplayValue(result);
    } catch (err) {
      console.error("Error updating display value:", err);
    }
  }
});

const preview = computed(() => {
  try {
    const result = evaluateExpression(input.value);
    return formatResult(result);
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
  input.value = item.expression;
};

const deleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("update-history");
};

const clearHistory = async () => {
  await db.history.clear();
  emit("update-history");
};

const activeBase = ref("DEC");
const displayValue = ref({
  hex: "0",
  dec: "0",
  oct: "0",
  bin: "0",
});

const formatBinary = (binString) => {
  // Remove any existing spaces and leading zeros
  binString = binString.replace(/\s/g, '').replace(/^0+/, '');
  
  // If the string is empty after removing leading zeros, return '0'
  if (binString === '') return '0';

  // Pad the string to make its length a multiple of 4
  const padding = 4 - (binString.length % 4);
  if (padding < 4) {
    binString = '0'.repeat(padding) + binString;
  }

  // Insert a space every 4 digits
  return binString.match(/.{1,4}/g).join(' ');
};

const updateDisplayValue = (value) => {
  try {
    const decValue = bignumber(value);
    displayValue.value = {
      hex: format(decValue, { notation: 'hex' }).toUpperCase().replace(/^0X/, ''),
      dec: format(decValue, { notation: 'fixed' }),
      oct: format(decValue, { notation: 'oct' }).replace(/^0O/, ''),
      bin: formatBinary(format(decValue, { notation: 'bin' }).replace(/^0B/, ''))
    };
  } catch (err) {
    console.error("Error updating display value:", err);
    displayValue.value = { hex: '0', dec: '0', oct: '0', bin: '0' };
  }
};

const handleBaseChange = (newBase) => {
  activeBase.value = newBase;
  try {
    const decValue = bignumber(input.value);
    switch (newBase) {
      case "HEX":
        input.value = format(decValue, { notation: "hex" }).toUpperCase().replace(/^0X/, '');
        break;
      case "DEC":
        input.value = format(decValue, { notation: "fixed" });
        break;
      case "OCT":
        input.value = format(decValue, { notation: "oct" }).replace(/^0O/, '');
        break;
      case "BIN":
        input.value = formatBinary(format(decValue, { notation: "bin" }).replace(/^0B/, ''));
        break;
    }
    updateDisplayValue(decValue);
  } catch (err) {
    console.error("Error changing base:", err);
    error.value = "Invalid input for base conversion";
  }
};

const sanitizeInput = (expr) => {
  // Allow hexadecimal characters when in HEX mode
  const allowedChars =
    activeBase.value === "HEX" ? /[^0-9A-Fa-f+\-×÷.]/g : /[^0-9+\-×÷.]/g;
  const sanitized = expr.replace(allowedChars, "");
  return sanitized.replace(/^[+×÷]/, "");
};

const evaluateExpression = (expr) => {
  try {
    let sanitizedExpr = sanitizeInput(expr)
      .replace(/×/g, "*")
      .replace(/÷/g, "/");

    // Convert the expression to decimal if not already in decimal
    if (activeBase.value !== "DEC") {
      const parts = sanitizedExpr.split(/([+\-*/])/);
      sanitizedExpr = parts
        .map((part) => {
          if (!["+", "-", "*", "/"].includes(part)) {
            return bignumber(part).toString(); // This converts to decimal
          }
          return part;
        })
        .join("");
    }

    if (sanitizedExpr.includes("/0")) {
      throw new Error("Division by zero is not allowed");
    }

    const result = evaluate(sanitizedExpr);

    if (typeof result !== "number" && !result.isBigNumber) {
      throw new Error("Invalid result");
    }

    return result;
  } catch (err) {
    throw new Error("Invalid expression: " + err.message);
  }
};

const formatResult = (result) => {
  if (result === undefined) return "";

  const precision = props.settings.precision;
  const useFractions = props.settings.useFractions;
  const useThousandsSeparator = props.settings.useThousandsSeparator;

  if (useFractions) {
    const frac = fraction(result);
    return frac.d === 1 ? `${frac.n}` : `${frac.n}/${frac.d}`;
  } else {
    let formattedResult = format(result, { precision: precision });
    if (useThousandsSeparator) {
      const [integerPart, decimalPart] = formattedResult.split(".");
      const formattedIntegerPart = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
      );
      formattedResult = decimalPart
        ? `${formattedIntegerPart}.${decimalPart}`
        : formattedIntegerPart;
    }
    return formattedResult;
  }
};

const handleButtonClick = (btn) => {
  if (input.value === "Error") {
    handleClear();
  }

  if (
    input.value.length >= MAX_INPUT_LENGTH &&
    btn !== "=" &&
    btn !== "AC" &&
    btn !== "backspace"
  ) {
    error.value = "Maximum input length reached";
    setTimeout(() => {
      error.value = "";
    }, 1000);
    return;
  }

  switch (btn) {
    case "=":
      handleEquals();
      break;
    case "%":
      handlePercentage();
      break;
    case "±":
      handlePlusMinus();
      break;
    case "AC":
    case "C":
      handleClear();
      break;
    case "CE":
      handleClearEntry();
      break;
    case "backspace":
      handleBackspace();
      break;
    case "+":
    case "-":
    case "×":
    case "÷":
      handleOperator(btn);
      break;
    default:
      handleNumber(btn);
  }

  if (btn === "=") {
    lastOperator.value = "=";
  }

  if (input.value !== "Error") {
    try {
      const result = evaluateExpression(input.value);
      updateDisplayValue(result);
    } catch (err) {
      console.error("Error updating display value:", err);
    }
  }
};

const handleOperator = (op) => {
  error.value = "";
  if (!isLastCharOperator()) {
    input.value += ` ${op} `;
  } else {
    input.value = input.value.slice(0, -3) + ` ${op} `;
  }
  lastOperator.value = op;
};

const handleNumber = (num) => {
  error.value = "";
  if (input.value === "Error" || input.value === lastOperator.value) {
    input.value = num;
  } else if (input.value === "0" && num === "0") {
    return;
  } else if (input.value === "0" && num !== ".") {
    input.value = num;
  } else {
    if (num === ".") {
      if (!input.value.includes(".")) {
        input.value += num;
      }
    } else {
      if (!(input.value === "0" && num === "0")) {
        input.value += num;
      }
    }
  }
  lastNumber.value = num;
};

const handlePercentage = () => {
  error.value = "";
  if (input.value !== "Error" && !isLastCharOperator()) {
    try {
      const result = parseFloat(input.value) / 100;
      if (!isFinite(result)) {
        throw new Error("Invalid percentage calculation");
      }
      input.value = formatResult(result);
    } catch (err) {
      error.value = err.message;
    }
  }
};

const handlePlusMinus = () => {
  error.value = "";
  if (input.value !== "Error" && !isLastCharOperator()) {
    try {
      const result = parseFloat(input.value) * -1;
      if (!isFinite(result)) {
        throw new Error("Invalid negation");
      }
      input.value = formatResult(result);
    } catch (err) {
      error.value = err.message;
    }
  }
};

const handleEquals = () => {
  error.value = "";
  try {
    const result = evaluateExpression(input.value);
    const formattedResult = formatResult(result);
    animatedResult.value = formattedResult;
    isAnimating.value = true;

    setTimeout(() => {
      input.value = formattedResult;
      lastOperator.value = "";
      lastNumber.value = formattedResult;
      isAnimating.value = false;
    }, 500);

    addToHistory(input.value, formattedResult);
  } catch (err) {
    input.value = "Error";
    error.value = err.message;
  }
};

const handleClear = () => {
  input.value = "0";
  error.value = "";
  isAnimating.value = false;
  lastOperator.value = "";
  lastNumber.value = "";
  animatedResult.value = "";
};

const handleClearEntry = () => {
  if (input.value !== "0" && input.value !== "Error") {
    const parts = input.value.split(" ");
    parts.pop();
    input.value = parts.join(" ") || "0";
  } else {
    handleClear();
  }
};

const handleBackspace = () => {
  if (input.value !== "0" && input.value !== "Error") {
    if (input.value.length === 1) {
      input.value = "0";
    } else {
      input.value = input.value.slice(0, -1);
    }
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

  if (allowedKeys[activeBase.value].test(key)) {
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
  } else {
    event.preventDefault();
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
