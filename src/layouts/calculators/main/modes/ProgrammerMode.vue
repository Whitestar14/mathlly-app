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

    <div class="grid grid-cols-5 gap-1 flex-grow">
      <!-- Hex letters column -->
      <div class="flex flex-col gap-1">
        <button
          v-for="letter in hexLetters"
          :key="letter"
          :disabled="!isButtonEnabled(letter) || isMaxLengthReached"
          :class="[
            'calc-btn calc-letter-btn calc-btn-grid',
            (!isButtonEnabled(letter) || isMaxLengthReached) ? 'calc-btn-disabled' : '',
          ]"
          @click="handleClick(letter)"
        >
          {{ letter }}
        </button>
      </div>

      <!-- Main calculator grid -->
      <div class="col-span-4 grid grid-cols-4 gap-1">
        <!-- Bit shift and clear row -->
        <CalcButton 
          v-for="(btn, index) in bitShiftRow" 
          :key="index"
          :value="btn.value"
          :icon="btn.icon"
          :disabled="btn.checkMaxLength ? isMaxLengthReached : false"
          :variant="btn.variant"
          @click="handleClick(btn.value)"
        />

        <!-- Parentheses and operators row -->
        <CalcButton 
          v-for="(btn, index) in parenthesesRow" 
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
            :disabled="!isButtonEnabled(btn.value) || isMaxLengthReached"
            :variant="btn.variant"
            @click="handleClick(btn.value)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, ChevronsRightIcon, ChevronsLeftIcon } from "lucide-vue-next";
import { computed, markRaw } from "vue";
import CalcButton from '@/components/ui/CalculatorButton.vue';
import { numberRows } from './NumberRows'
const props = defineProps({
  activeBase: {
    type: String,
    required: true,
  },
  inputLength: {
    type: Number,
    required: true,
  },
  maxLength: {
    type: Number,
    default: 29,
  },
  hasMemory: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(["button-click", "clear"]);

const isMaxLengthReached = computed(() => props.inputLength >= props.maxLength);

// Button configurations using markRaw for better performance
const memoryOperations = markRaw(['MC', 'MR', 'M+', 'M-', 'MS']);
const hexLetters = markRaw(['A', 'B', 'C', 'D', 'E', 'F']);

// Bit shift and clear row
const bitShiftRow = markRaw([
  { value: '<<', variant: 'function', icon: ChevronsLeftIcon, checkMaxLength: true },
  { value: '>>', variant: 'function', icon: ChevronsRightIcon, checkMaxLength: true },
  { value: 'CE', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: Delete }
]);

// Parentheses and operators row
const parenthesesRow = markRaw([
  { value: '(', variant: 'function' },
  { value: ')', variant: 'function' },
  { value: '%', variant: 'function' },
  { value: '÷', variant: 'operator' }
]);

const handleClick = (value) => {
  emit("button-click", value);
};

const isButtonEnabled = computed(() => (button) => {
  if (['×', '-', '+', '=', '±'].includes(button)) {
    return true;
  }
  
  if (isMaxLengthReached.value && /^[0-9A-F.]$/.test(button.toUpperCase())) {
    return false;
  }

  switch (props.activeBase) {
    case "HEX":
      return /^[0-9A-F]$/.test(button.toUpperCase());
    case "DEC":
      return /^[0-9]$/.test(button);
    case "OCT":
      return /^[0-7]$/.test(button);
    case "BIN":
      return /^[01]$/.test(button);
    default:
      return true;
  }
});
</script>
