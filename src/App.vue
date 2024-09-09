<template>
  <div class="flex flex-col min-h-screen bg-white dark:bg-gray-900">
    <CalculatorHeader />
    <div class="flex-grow flex items-center justify-center p-4">
      <div class="w-80 bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <CalculatorDisplay :display="display" />
        <CalculatorButtons @button-click="handleButtonClick" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CalculatorDisplay from './components/CalculatorDisplay.vue'
import CalculatorButtons from './components/CalculatorButtons.vue'
import CalculatorHeader from './components/CalculatorHeader.vue'

const currentValue = ref("");
const previousValue = ref("");
const operation = ref("");
const shouldResetScreen = ref(false);

const display = computed(() => currentValue.value || "0");

function handleButtonClick(value) {
  if (isNaN(parseInt(value)) && value !== ".") {
    handleSymbol(value);
  } else {
    handleNumber(value);
  }
}

function handleNumber(num) {
  if (shouldResetScreen.value) {
    currentValue.value = "";
    shouldResetScreen.value = false;
  }
  currentValue.value += num;
}

function handleSymbol(symbol) {
  switch (symbol) {
    case "AC":
      currentValue.value = "";
      previousValue.value = "";
      operation.value = "";
      break;
    case "=":
      if (previousValue.value && currentValue.value) {
        currentValue.value = calculate();
        previousValue.value = "";
        operation.value = "";
        shouldResetScreen.value = true;
      }
      break;
    case "+":
    case "-":
    case "×":
    case "÷":
      handleOperation(symbol);
      break;
  }
}

function handleOperation(op) {
  if (currentValue.value === "") return;
  if (previousValue.value !== "") {
    currentValue.value = calculate();
  }
  operation.value = op;
  previousValue.value = currentValue.value;
  shouldResetScreen.value = true;
}

function calculate() {
  const prev = parseFloat(previousValue.value);
  const current = parseFloat(currentValue.value);
  if (isNaN(prev) || isNaN(current)) return "";
  let result = 0;
  switch (operation.value) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "×":
      result = prev * current;
      break;
    case "÷":
      result = prev / current;
      break;
  }
  return result.toString();
}
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
