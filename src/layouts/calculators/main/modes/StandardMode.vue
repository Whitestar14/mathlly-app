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
        @click="handleClick(btn.value)"
      />

      <!-- Second row -->
      <CalcButton 
        v-for="(btn, index) in secondRow" 
        :key="index"
        :value="btn.value"
        :disabled="isMaxLengthReached"
        :variant="btn.variant"
        @click="handleClick(btn.value)"
      />

      <!-- Number pad and operations -->
      <template v-for="(row, rowIndex) in numberRows">
        <CalcButton 
          v-for="(btn, btnIndex) in row" 
          :key="`row-${rowIndex}-btn-${btnIndex}`"
          :value="btn.value"
          :disabled="isMaxLengthReached"
          :variant="btn.variant"
          @click="handleClick(btn.value)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, markRaw } from "vue";
import { Delete } from 'lucide-vue-next';
import { numberRows } from './NumberRows'
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
  { value: 'backspace', variant: 'function', icon: Delete }
]);

const secondRow = markRaw([
  { value: '1/x', variant: 'function' },
  { value: 'x²', variant: 'function' },
  { value: '√', variant: 'function' },
  { value: '÷', variant: 'operator' }
]);

const handleClick = (value) => {
  if (value === 'C') {
    emit('clear');
  } else {
    emit('button-click', value);
  }
};
</script>