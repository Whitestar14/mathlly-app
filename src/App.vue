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
import { ref, provide } from "vue";
import { evaluate, format } from "mathjs";
import CalculatorHeader from "./components/CalculatorHeader.vue";
import CalculatorDisplay from "./components/CalculatorDisplay.vue";
import CalculatorButtons from "./components/CalculatorButtons.vue";

const input = ref("0");
const mode = ref("Standard");
const error = ref("");
const isAnimating = ref(false);
const animatedResult = ref("");
const lastOperator = ref("");
const lastNumber = ref("");
const MAX_INPUT_LENGTH = 50; // Maximum allowed input length

const isOperator = (char) => ["+", "-", "×", "÷"].includes(char);
const isLastCharOperator = () => isOperator(input.value.trim().slice(-1));

const closeDropdown = () => {
  console.log("Closing dropdown");
};
provide("closeDropdown", closeDropdown);

// Function to sanitize and validate input
const sanitizeInput = (expr) => {
  // Remove any characters that are not numbers, operators, or decimal points
  const sanitized = expr.replace(/[^0-9+\-×÷.]/g, "");
  
  // Ensure the expression doesn't start with an operator (except minus)
  return sanitized.replace(/^[+×÷]/, "");
};

// Function to evaluate the mathematical expression with improved error handling
const evaluateExpression = (expr) => {
  try {
    const sanitizedExpr = sanitizeInput(expr)
      .replace(/×/g, "*")
      .replace(/÷/g, "/");

    // Check for division by zero
    if (sanitizedExpr.includes("/0")) {
      throw new Error("Division by zero is not allowed");
    }

    // Use a regular expression to check for potentially harmful expressions
    if (sanitizedExpr.match(/[a-zA-Z_$]/)) {
      throw new Error("Invalid characters in expression");
    }

    const result = evaluate(sanitizedExpr);

    // Check if the result is a valid number
    if (typeof result !== "number" || !isFinite(result)) {
      throw new Error("Invalid result");
    }

    return format(result, { precision: 14 });
  } catch (err) {
    throw new Error("Invalid expression: " + err.message);
  }
};

// Button click handlers
const handleButtonClick = (btn) => {
  if (input.value === "Error") {
    handleClear();
  }

  if (input.value.length >= MAX_INPUT_LENGTH && btn !== "=" && btn !== "AC") {
    error.value = "Maximum input length reached";
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
};

const handleOperator = (op) => {
  error.value = ""; // Clear any previous errors
  if (!isLastCharOperator()) {
    input.value += ` ${op} `;
  } else {
    input.value = input.value.slice(0, -3) + ` ${op} `;
  }
  lastOperator.value = op;
};

const handleNumber = (num) => {
  error.value = ""; // Clear any previous errors
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
};

const handlePercentage = () => {
  error.value = ""; // Clear any previous errors
  if (input.value !== "Error" && !isLastCharOperator()) {
    try {
      const result = parseFloat(input.value) / 100;
      if (!isFinite(result)) {
        throw new Error("Invalid percentage calculation");
      }
      input.value = result.toString();
    } catch (err) {
      error.value = err.message;
    }
  }
};

const handlePlusMinus = () => {
  error.value = ""; // Clear any previous errors
  if (input.value !== "Error" && !isLastCharOperator()) {
    try {
      const result = parseFloat(input.value) * -1;
      if (!isFinite(result)) {
        throw new Error("Invalid negation");
      }
      input.value = result.toString();
    } catch (err) {
      error.value = err.message;
    }
  }
};

const handleEquals = () => {
  error.value = ""; // Clear any previous errors
  try {
    const result = evaluateExpression(input.value);
    
    animatedResult.value = result.toString();
    isAnimating.value = true;
    
    setTimeout(() => {
      input.value = result.toString();
      lastOperator.value = "";
      lastNumber.value = result.toString();
      isAnimating.value = false;
    }, 500);
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
</script>