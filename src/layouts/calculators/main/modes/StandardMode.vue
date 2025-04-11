<template>
  <div class="flex flex-col gap-1">
    <div class="grid grid-cols-5 gap-1">
      <button
        v-for="op in ['MC', 'MR', 'M+', 'M-', 'MS']"
        :key="op"
        class="calc-btn calc-memory-btn calc-btn-grid"
        :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
        @click="handleClick(op)"
      >
        {{ op }}
      </button>
    </div>
    
    <div class="grid grid-cols-4 gap-1 flex-grow">
      <button
        class="calc-btn calc-function-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('%')"
      >
        %
      </button>
      <button
        class="calc-btn calc-function-btn calc-btn-grid"
        @click="handleClick('CE')"
      >
        CE
      </button>
      <button
        class="calc-btn calc-function-btn calc-btn-grid"
        @click="handleClick('C')"
      >
        C
      </button>
      <button
        class="calc-btn calc-function-btn calc-btn-grid"
        @click="handleClick('backspace')"
      >
        <Delete class="w-6 h-6 mx-auto" />
        <span class="sr-only">Backspace</span>
      </button>

      <button
        class="calc-btn calc-function-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('1/x')"
      >
        1/x
      </button>
      <button
        class="calc-btn calc-function-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('x²')"
      >
        x²
      </button>
      <button
        class="calc-btn calc-function-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('√')"
      >
        √
      </button>
      <button
        class="calc-btn calc-operator-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('÷')"
      >
        ÷
      </button>

      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('7')"
      >
        7
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('8')"
      >
        8
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('9')"
      >
        9
      </button>
      <button
        class="calc-btn calc-operator-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('×')"
      >
        ×
      </button>

      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('4')"
      >
        4
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('5')"
      >
        5
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('6')"
      >
        6
      </button>
      <button
        class="calc-btn calc-operator-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('-')"
      >
        −
      </button>

      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('1')"
      >
        1
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('2')"
      >
        2
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('3')"
      >
        3
      </button>
      <button
        class="calc-btn calc-operator-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('+')"
      >
        +
      </button>

      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('±')"
      >
        ±
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('0')"
      >
        0
      </button>
      <button
        class="calc-btn calc-number-btn calc-btn-grid"
        :disabled="isMaxLengthReached"
        @click="handleClick('.')"
      >
        .
      </button>
      <button
        class="calc-btn calc-operator-btn calc-btn-grid"
        @click="handleClick('=')"
      >
        =
      </button>
    </div>
  </div>
</template>

<script setup>
import { Delete } from 'lucide-vue-next';
import { computed } from "vue";
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