<template>
  <div
    class="min-h-screen flex flex-col bg-background dark:bg-gray-900 transition-colors duration-300"
  >
    <calculator-header v-model:mode="mode" @close-dropdown="closeDropdown" />
    <main
      class="flex-grow flex items-center justify-center p-4"
      @click="closeDropdown"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transition-colors duration-300"
      >
        <div class="p-6">
          <calculator-display
            :input="input"
            :preview="preview"
            :error="error"
            :isAnimating="isAnimating"
            :animatedPreview="animatedPreview"
          />
          <calculator-buttons
            :mode="mode"
            @button-click="handleButtonClick"
            @clear="handleClear"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, provide, watch } from "vue";
import { evaluate, format } from "mathjs";
import CalculatorHeader from "./components/CalculatorHeader.vue";
import CalculatorDisplay from "./components/CalculatorDisplay.vue";
import CalculatorButtons from "./components/CalculatorButtons.vue";

const input = ref("0");
const preview = ref("");
const mode = ref("Standard");
const error = ref("");
const isAnimating = ref(false);
const animatedPreview = ref("");
const lastOperator = ref("");
const lastNumber = ref("");
const shouldClearPreview = ref(false);
const isOperator = (char) => ["+", "-", "×", "÷"].includes(char);
const isLastCharOperator = () => isOperator(input.value.trim().slice(-1));

const closeDropdown = () => {
  console.log("Closing dropdown");
};
provide("closeDropdown", closeDropdown);

// Updated evaluateExpression function (unchanged)
const evaluateExpression = (expr) => {
  try {
    const sanitizedExpr = expr.replace(/×/g, "*").replace(/÷/g, "/");
    const result = evaluate(sanitizedExpr);
    return format(result, { precision: 14 });
  } catch (err) {
    throw new Error("Invalid expression");
  }
};

// Updated updatePreview function
const updatePreview = () => {
  try {
    if (shouldClearPreview.value) {
      preview.value = "";
      error.value = "";
      shouldClearPreview.value = false;
      return;
    }

    if (!input.value || input.value === "Error") {
      preview.value = "";
      error.value = "";
      return;
    }

    if (isLastCharOperator() || input.value.trim().endsWith(".")) {
      preview.value = "";
      return;
    }

    preview.value = evaluateExpression(input.value).toString();
    error.value = "";
  } catch (err) {
    preview.value = "";
    error.value = err.message;
  }
};

// Watch the input field and update the preview
watch(input, () => updatePreview());

// Updated handleButtonClick function
const handleButtonClick = (btn) => {
  if (input.value === "Error") {
    handleClear();
  }

  if (lastOperator.value === "=" && !isOperator(btn)) {
    shouldClearPreview.value = true;
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
      handleClear();
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
};

// Updated handleOperator function
const handleOperator = (op) => {
  if (!isLastCharOperator()) {
    input.value += ` ${op} `;
  } else {
    input.value = input.value.slice(0, -3) + ` ${op} `;
  }
  lastOperator.value = op;
  shouldClearPreview.value = false;
};

// Updated handleNumber function
const handleNumber = (num) => {
  if (input.value === "Error" || input.value === lastOperator.value) {
    input.value = num;
  } else if (input.value === "0" && num === "0") {
    return;
  } else if (input.value === "0" && num !== ".") {
    input.value = num;
  } else {
    if (input.value === "0" && num === ".") {
      input.value = "0.";
    } else {
      input.value += num;
    }
  }
  lastNumber.value = num;
  shouldClearPreview.value = false;
};

// Updated handlePercentage function
const handlePercentage = () => {
  if (input.value !== "Error" && !isLastCharOperator()) {
    input.value = (parseFloat(input.value) / 100).toString();
    updatePreview();
  }
};

// Updated handlePlusMinus function
const handlePlusMinus = () => {
  if (input.value !== "Error" && !isLastCharOperator()) {
    input.value = (parseFloat(input.value) * -1).toString();
    updatePreview();
  }
};

// Updated handleEquals function
const handleEquals = () => {
  try {
    const result = evaluateExpression(input.value);
    
    animatedPreview.value = result.toString();
    isAnimating.value = true;
    
    setTimeout(() => {
      input.value = result.toString();
      shouldClearPreview.value = true;
      updatePreview();
      error.value = "";
      lastOperator.value = "";
      lastNumber.value = result.toString();
      isAnimating.value = false;
    }, 500);
  } catch (err) {
    input.value = "Error";
    shouldClearPreview.value = true;
    updatePreview();
    error.value = err.message;
  }
};

// Updated handleClear function
const handleClear = () => {
  input.value = "0";
  shouldClearPreview.value = true;
  updatePreview();
  error.value = "";
  isAnimating.value = false;
  lastOperator.value = "";
  lastNumber.value = "";
  animatedPreview.value = "";
};
</script>
