<template>
  <main class="flex-grow flex">
    <div class="flex-grow bg-white dark:bg-gray-800 shadow-xl overflow-hidden transition-colors duration-300">
      <div class="p-6 max-w-md mx-auto">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-4 md:hidden">
              <button @click="$emit('toggle-history')" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
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
        />
        <calculator-buttons
          :mode="mode"
          @button-click="handleButtonClick"
          @clear="handleClear"
        />
      </div>
    </div>
    <history-panel
      v-if="!isMobile"
      :isOpen="isHistoryOpen"
      :history="history"
      :clearHistory="clearHistory"
      :onSelectHistoryItem="selectHistoryItem"
      :deleteHistoryItem="deleteHistoryItem"
      class="w-1/4 min-w-[250px] max-w-[400px]"
    />
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { evaluate, format, fraction } from 'mathjs';
import { HistoryIcon } from 'lucide-vue-next';
import CalculatorDisplay from './CalculatorDisplay.vue';
import CalculatorButtons from './CalculatorButtons.vue';
import HistoryPanel from './HistoryPanel.vue';

const props = defineProps(['mode', 'settings', 'history', 'isMobile', 'isHistoryOpen']);
const emit = defineEmits(['update:mode', 'add-to-history', 'clear-history', 'select-history-item', 'delete-history-item', 'toggle-history']);

const input = ref('0');
const error = ref('');
const isAnimating = ref(false);
const animatedResult = ref('');
const lastOperator = ref('');
const lastNumber = ref('');
const MAX_INPUT_LENGTH = 50;

// Watch for changes to the settings prop and recalculate the preview.
watch(
  () => props.settings,  // Watching for changes in settings
  () => {
    if (input.value) {
      try {
        const result = evaluateExpression(input.value);
        animatedResult.value = formatResult(result);  // Update the displayed result
      } catch (err) {
        error.value = err.message;
      }
    }
  },
  { deep: true }
);

const preview = computed(() => {
  try {
    const result = evaluateExpression(input.value);
    return formatResult(result);
  } catch (err) {
    return '';
  }
});

const clearHistory = () => {
  emit('clear-history');
};

const selectHistoryItem = (item) => {
  input.value = item.expression;
  emit('select-history-item', item);
};

const deleteHistoryItem = (index) => {
  emit('delete-history-item', index);
};

const addToHistory = (expression, result) => {
  emit('add-to-history', expression, result);
};

const isOperator = (char) => ['+', '-', '×', '÷'].includes(char);
const isLastCharOperator = () => isOperator(input.value.trim().slice(-1));

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
  if (result === undefined) return '';

  const precision = props.settings.precision; 
  const useFractions = props.settings.useFractions;
  const useThousandsSeparator = props.settings.useThousandsSeparator;

  if (useFractions) {
    const frac = fraction(result);
    
    // If the denominator is 1, return the numerator as a whole number
    if (frac.d === 1) {
      return `${frac.n}`;
    } else {
      return `${frac.n}/${frac.d}`;
    }
  } else {
    let formattedResult = format(result, { precision: precision });
    if (useThousandsSeparator) {
      const [integerPart, decimalPart] = formattedResult.split('.');
      const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formattedResult = decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
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
    const formattedResult = formatResult(result);

    animatedResult.value = formattedResult;
    isAnimating.value = true;

    setTimeout(() => {
      input.value = formattedResult;
      lastOperator.value = '';
      lastNumber.value = formattedResult;
      isAnimating.value = false;
    }, 500);

    addToHistory(input.value, formattedResult);
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

const handleKeyDown = (event) => {
  const key = event.key;

  if (['+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace'].includes(key)) {
    event.preventDefault();
  }

  switch (key) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '.':
      handleButtonClick(key);
      break;
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
      handleButtonClick('AC');
      break;
    case 'Backspace':
      handleButtonClick('backspace');
      break;
    case '%':
      handleButtonClick('%');
      break;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
</style>