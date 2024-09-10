<template>
  <div class="min-h-screen flex flex-col bg-background dark:bg-gray-900 transition-colors duration-300">
    <calculator-header v-model:mode="mode" @close-dropdown="closeDropdown" />
    <main class="flex-grow flex items-center justify-center p-4" @click="closeDropdown">
      <div class="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transition-colors duration-300">
        <div class="p-6">
          <calculator-display :input="input" :preview="preview" :error="error" />
          <calculator-buttons :mode="mode" @button-click="handleButtonClick" @clear="handleClear" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import CalculatorHeader from './components/CalculatorHeader.vue'
import CalculatorDisplay from './components/CalculatorDisplay.vue'
import CalculatorButtons from './components/CalculatorButtons.vue'

const input = ref('0')
const preview = ref('')
const mode = ref('Standard')
const error = ref('')

const closeDropdown = () => {
  console.log('Closing dropdown')
}
provide('closeDropdown', closeDropdown)

const updatePreview = () => {
  try {
    if (input.value.trim() === '' || input.value === 'Error') {
      preview.value = ''
      error.value = ''
      return
    }
    const result = evaluateExpression(input.value)
    preview.value = result.toString()
    error.value = ''
  } catch (err) {
    preview.value = ''
    if (err instanceof SyntaxError) {
      error.value = `SyntaxError: ${err.message}`
    } else if (err instanceof TypeError) {
      error.value = `TypeError: ${err.message}`
    } else if (err instanceof ReferenceError) {
      error.value = `ReferenceError: ${err.message}`
    } else {
      error.value = `Error: ${err.message}`
    }
  }
}

const handleButtonClick = (btn) => {
  switch (btn) {
    case '=':
      handleEquals()
      break
    case '±':
      toggleSign()
      break
    case '%':
      handlePercentage()
      break
    case '÷':
    case '×':
    case '-':
    case '+':
      handleOperator(btn)
      break
    case '.':
      handleDecimal()
      break
    case 'OR':
    case 'AND':
    case 'NOT':
    case 'XOR':
      alert(`${btn} is not implemented yet`)
      handleClear()
      break
    default:
      handleNumber(btn)
  }
  if (btn !== '=') {
    updatePreview()
  }
}

const handleNumber = (num) => {
  if (input.value === '0' || input.value === 'Error') {
    input.value = num
  } else {
    input.value += num
  }
}

const handleOperator = (op) => {
  if (input.value !== 'Error') {
    input.value += ` ${op} `
  }
}

const handleDecimal = () => {
  const parts = input.value.split(/[-+×÷]/)
  const lastPart = parts[parts.length - 1]
  if (!lastPart.includes('.')) {
    input.value += '.'
  }
}

const handleEquals = () => {
  try {
    const result = evaluateExpression(input.value)
    input.value = result.toString()
    preview.value = ''
    error.value = ''
  } catch (err) {
    input.value = 'Error'
    preview.value = ''
    if (err instanceof SyntaxError) {
      error.value = `SyntaxError: ${err.message}`
    } else if (err instanceof TypeError) {
      error.value = `TypeError: ${err.message}`
    } else if (err instanceof ReferenceError) {
      error.value = `ReferenceError: ${err.message}`
    } else {
      error.value = `Error: ${err.message}`
    }
  }
}

const handleClear = () => {
  input.value = '0'
  preview.value = ''
  error.value = ''
}

const toggleSign = () => {
  if (input.value !== '0' && input.value !== 'Error') {
    input.value = input.value.startsWith('-') ? input.value.slice(1) : '-' + input.value
  }
}

const handlePercentage = () => {
  try {
    const result = evaluateExpression(input.value) / 100
    input.value = result.toString()
    error.value = ''
  } catch (err) {
    input.value = 'Error'
    preview.value = ''
    if (err instanceof SyntaxError) {
      error.value = `SyntaxError: ${err.message}`
    } else if (err instanceof TypeError) {
      error.value = `TypeError: ${err.message}`
    } else if (err instanceof ReferenceError) {
      error.value = `ReferenceError: ${err.message}`
    } else {
      error.value = `Error: ${err.message}`
    }
  }
}

const evaluateExpression = (expr) => {
  const sanitizedExpr = expr.replace(/×/g, '*').replace(/÷/g, '/')
  return Function(`'use strict'; return (${sanitizedExpr})`)()
}
</script>