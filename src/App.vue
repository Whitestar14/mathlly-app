<!-- src/App.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-background dark:bg-gray-900 transition-colors duration-300">
    <calculator-header v-model:mode="mode" @close-dropdown="closeDropdown" />
    <main class="flex-grow flex items-center justify-center p-4" @click="closeDropdown">
      <div class="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transition-colors duration-300">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Calculator</h1>
            <button @click="openSettings" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <SettingsIcon class="h-6 w-6" />
            </button>
          </div>
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
    <settings-modal
      :isOpen="isSettingsOpen"
      :settings="settings"
      @update:isOpen="updateSettingsOpen"
      @settings-change="updateSettings"
    />
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue';
import { evaluate, format, fraction } from 'mathjs';
import { SettingsIcon } from 'lucide-vue-next';
import CalculatorHeader from './components/CalculatorHeader.vue';
import CalculatorDisplay from './components/CalculatorDisplay.vue';
import CalculatorButtons from './components/CalculatorButtons.vue';
import SettingsModal from './components/SettingsModal.vue';

const input = ref('0');
const mode = ref('Standard');
const error = ref('');
const isAnimating = ref(false);
const animatedResult = ref('');
const lastOperator = ref('');
const lastNumber = ref('');
const MAX_INPUT_LENGTH = 50;

const settings = ref({
  precision: 4,
  useFractions: false,
  useThousandsSeparator: true,
});

const isSettingsOpen = ref(false);

const openSettings = () => {
  isSettingsOpen.value = true;
};

const updateSettingsOpen = (open) => {
  isSettingsOpen.value = open;
};

const updateSettings = (newSettings) => {
  settings.value = newSettings;
};

const isOperator = (char) => ['+', '-', '×', '÷'].includes(char);
const isLastCharOperator = () => isOperator(input.value.trim().slice(-1));

const closeDropdown = () => {
  console.log('Closing dropdown');
};
provide("closeDropdown", closeDropdown);

const preview = computed(() => {
  try {
    const result = evaluateExpression(input.value);
    return formatResult(result);
  } catch (err) {
    return '';
  }
});

const sanitizeInput = (expr) => {
  const sanitized = expr.replace(/[^0-9+\-×÷.]/g, '');
  return sanitized.replace(/^[+×÷]/, '');
};

const evaluateExpression = (expr) => {
  try {
    const sanitizedExpr = sanitizeInput(expr)
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    if (sanitizedExpr.includes('/0')) {
      throw new Error('Division by zero is not allowed');
    }

    if (sanitizedExpr.match(/[a-zA-Z_$]/)) {
      throw new Error('Invalid characters in expression');
    }

    const result = evaluate(sanitizedExpr);

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }

    return result;
  } catch (err) {
    throw new Error('Invalid expression: ' + err.message);
  }
};

const formatResult = (result) => {
  if (settings.value.useFractions) {
    const frac = fraction(result);
    return `${frac.n}/${frac.d}`;
  } else {
    let formattedResult = format(result, { precision: settings.value.precision });
    if (settings.value.useThousandsSeparator) {
      formattedResult = formattedResult.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return formattedResult;
  }
};

const handleButtonClick = (btn) => {
  if (input.value === 'Error') {
    handleClear();
  }

  if (input.value.length >= MAX_INPUT_LENGTH && btn !== '=' && btn !== 'AC') {
    error.value = 'Maximum input length reached';
    return;
  }

  switch (btn) {
    case '=':
      handleEquals();
      break;
    case '%':
      handlePercentage();
      break;
    case '±':
      handlePlusMinus();
      break;
    case 'AC':
    case 'C':
      handleClear();
      break;
    case 'CE':
      handleClearEntry();
      break;
    case 'backspace':
      handleBackspace();
      break;
    case '+':
    case '-':
    case '×':
    case '÷':
      handleOperator(btn);
      break;
    default:
      handleNumber(btn);
  }

  if (btn === '=') {
    lastOperator.value = '=';
  }
};

const handleOperator = (op) => {
  error.value = '';
  if (!isLastCharOperator()) {
    input.value += ` ${op} `;
  } else {
    input.value = input.value.slice(0, -3) + ` ${op} `;
  }
  lastOperator.value = op;
};

const handleNumber = (num) => {
  error.value = '';
  if (input.value === 'Error' || input.value === lastOperator.value) {
    input.value = num;
  } else if (input.value === '0' && num === '0') {
    return;
  } else if (input.value === '0' && num !== '.') {
    input.value = num;
  } else {
    if (input.value === '0' && num === '.') {
      input.value = '0.';
    } else {
      input.value += num;
    }
  }
  lastNumber.value = num;
};

const handlePercentage = () => {
  error.value = '';
  if (input.value !== 'Error' && !isLastCharOperator()) {
    try {
      const result = parseFloat(input.value) / 100;
      if (!isFinite(result)) {
        throw new Error('Invalid percentage calculation');
      }
      input.value = formatResult(result);
    } catch (err) {
      error.value = err.message;
    }
  }
};

const handlePlusMinus = () => {
  error.value = '';
  if (input.value !== 'Error' && !isLastCharOperator()) {
    try {
      const result = parseFloat(input.value) * -1;
      if (!isFinite(result)) {
        throw new Error('Invalid negation');
      }
      input.value = formatResult(result);
    } catch (err) {
      error.value = err.message;
    }
  }
};

const handleEquals = () => {
  error.value = '';
  try {
    const result = evaluateExpression(input.value);
    
    animatedResult.value = formatResult(result);
    isAnimating.value = true;
    
    setTimeout(() => {
      input.value = formatResult(result);
      lastOperator.value = '';
      lastNumber.value = formatResult(result);
      isAnimating.value = false;
    }, 500);
  } catch (err) {
    input.value = 'Error';
    error.value = err.message;
  }
};

const handleClear = () => {
  input.value = '0';
  error.value = '';
  isAnimating.value = false;
  lastOperator.value = '';
  lastNumber.value = '';
  animatedResult.value = '';
};

const handleClearEntry = () => {
  if (input.value !== '0' && input.value !== 'Error') {
    const parts = input.value.split(' ');
    parts.pop();
    input.value = parts.join(' ') || '0';
  } else {
    handleClear();
  }
};

const handleBackspace = () => {
  if (input.value !== '0' && input.value !== 'Error') {
    if (input.value.length === 1) {
      input.value = '0';
    } else {
      input.value = input.value.slice(0, -1);
    }
  }
};
</script>