<template>
  <div class="flex flex-col gap-1">
    <!-- Memory buttons row -->
    <div class="grid grid-cols-5 gap-1">
      <CalcButton
        v-for="op in memoryOperations"
        :key="op"
        :value="op"
        variant="memory"
        :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
        @click="handleClick"
      >
        {{ op }}
      </CalcButton>
    </div>
    
    <!-- Calculator buttons grid -->
    <div class="grid grid-cols-4 gap-1 flex-grow">
      <!-- First row -->
      <CalcButton 
        v-for="(btn, index) in standardFirstRow" 
        :key="index"
        :value="btn.value"
        :icon="btn.icon"
        :disabled="btn.checkMaxLength ? isMaxLengthReached : false"
        :variant="btn.variant"
        @click="handleClick"
      />

      <!-- Second row -->
      <CalcButton 
        v-for="(btn, index) in standardSecondRow" 
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
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import CalcButton from '@/components/ui/CalculatorButton.vue';
import { 
  numberRows, 
  standardFirstRow, 
  standardSecondRow, 
  memoryOperations 
} from './NumberRows';

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

const handleClick = (value) => {
  if (value === 'C') {
    emit('clear');
  } else {
    emit('button-click', value);
  }
};
</script>
