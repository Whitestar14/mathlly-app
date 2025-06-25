<template>
  <div class="flex flex-col gap-1">
    <!-- Memory buttons row -->
    <div class="grid grid-cols-5 gap-1">
      <button
        v-for="op in memoryOperations"
        :key="op"
        class="calc-btn calc-memory-btn calc-btn-grid"
        :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
        @click="handleClick(op)"
      >
        {{ op }}
      </button>
    </div>
    
    <!-- Calculator buttons grid -->
    <div class="grid grid-cols-4 gap-1 flex-grow">
      <!-- First row -->
      <CalcButton 
        v-for="(btn, index) in firstRow" 
        :key="index"
        :value="btn.value"
        :icon="btn.icon"
        :disabled="btn.checkMaxLength ? isMaxLengthReached : false"
        :variant="btn.variant"
        @click="handleClick"
      >
        <span v-html="btn.display || btn.value"></span>
      </CalcButton>

      <!-- Second row -->
      <CalcButton 
        v-for="(btn, index) in secondRow" 
        :key="index"
        :value="btn.value"
        :disabled="isMaxLengthReached"
        :variant="btn.variant"
        @click="handleClick"
      >
        <span v-html="btn.display || btn.value"></span>
      </CalcButton>

      <!-- Number pad and operations -->
      <template v-for="(row, rowIndex) in numberRows" :key="`row-${rowIndex}`">
        <CalcButton 
          v-for="(btn, btnIndex) in row" 
          :key="`row-${rowIndex}-btn-${btnIndex}`"
          :value="btn.value"
          :disabled="isMaxLengthReached && btn.variant === 'number'"
          :variant="btn.variant"
          @click="handleClick"
        >
          <span v-html="btn.display || btn.value"></span>
        </CalcButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, markRaw } from "vue";
import { Delete } from 'lucide-vue-next';
import CalcButton from '@/components/ui/CalculatorButton.vue';

const props = defineProps({
  inputLength: {
    type: Number,
    required: true
  },
  maxLength: {
    type: Number,
    default: 29
  },
  hasMemory: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['button-click', 'clear']);

const isMaxLengthReached = computed(() => 
  props.inputLength >= props.maxLength
);

const memoryOperations = markRaw(['MC', 'MR', 'M+', 'M-', 'MS']);

const firstRow = markRaw([
  { value: '%', variant: 'function', checkMaxLength: true },
  { value: 'CE', variant: 'function' },
  { value: 'C', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: Delete, display: '⌫' }
]);

const secondRow = markRaw([
  { value: '1/x', variant: 'function', display: '¹⁄ₓ' },
  { value: 'x²', variant: 'function', display: 'x²' },
  { value: '√', variant: 'function', display: '√x' },
  { value: '÷', variant: 'operator' }
]);

const numberRows = markRaw([
  // Row 1: 7, 8, 9, ×
  [
    { value: '7', variant: 'number' },
    { value: '8', variant: 'number' },
    { value: '9', variant: 'number' },
    { value: '×', variant: 'operator' }
  ],
  // Row 2: 4, 5, 6, -
  [
    { value: '4', variant: 'number' },
    { value: '5', variant: 'number' },
    { value: '6', variant: 'number' },
    { value: '-', variant: 'operator' }
  ],
  // Row 3: 1, 2, 3, +
  [
    { value: '1', variant: 'number' },
    { value: '2', variant: 'number' },
    { value: '3', variant: 'number' },
    { value: '+', variant: 'operator' }
  ],
  // Row 4: ±, 0, ., =
  [
    { value: '±', variant: 'function' },
    { value: '0', variant: 'number' },
    { value: '.', variant: 'number' },
    { value: '=', variant: 'operator' }
  ]
]);

const handleClick = (value) => {
  if (value === 'C') {
    emit('clear');
  } else {
    emit('button-click', value);
  }
};
</script>
