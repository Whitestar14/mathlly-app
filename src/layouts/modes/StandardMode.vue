<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-5 gap-1 mb-1">
      <button
        v-for="op in ['MC', 'MR', 'M+', 'M-', 'MS']"
        :key="op"
        class="btn memory-btn"
        @click="handleClick(op)"
      >
        {{ op }}
      </button>
    </div>
    <div class="grid grid-cols-4 gap-1 flex-grow">
      <button
        class="btn function-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('%')"
      >
        %
      </button>
      <button
        class="btn function-btn"
        @click="handleClick('CE')"
      >
        CE
      </button>
      <button
        class="btn function-btn"
        @click="handleClick('C')"
      >
        C
      </button>
      <button
        class="btn function-btn"
        @click="handleClick('backspace')"
      >
        <Delete class="w-6 h-6 mx-auto" />
      </button>

      <button
        class="btn function-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('1/x')"
      >
        1/x
      </button>
      <button
        class="btn function-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('x²')"
      >
        x²
      </button>
      <button
        class="btn function-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('√')"
      >
        √
      </button>
      <button
        class="btn operator-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('÷')"
      >
        ÷
      </button>

      <button
        class="btn  number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('7')"
      >
        7
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('8')"
      >
        8
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('9')"
      >
        9
      </button>
      <button
        class="btn operator-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('×')"
      >
        ×
      </button>

      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('4')"
      >
        4
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('5')"
      >
        5
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('6')"
      >
        6
      </button>
      <button
        class="btn operator-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('-')"
      >
        −
      </button>

      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('1')"
      >
        1
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('2')"
      >
        2
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('3')"
      >
        3
      </button>
      <button
        class="btn operator-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('+')"
      >
        +
      </button>

      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('±')"
      >
        ±
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('0')"
      >
        0
      </button>
      <button
        class="btn number-btn"
        :disabled="isMaxLengthReached"
        @click="handleClick('.')"
      >
        .
      </button>
      <button
        class="btn operator-btn"
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

<style scoped>
@import url('@/assets/css/buttons.css');

.btn {
  font-family: 'Geist Mono', monospace; 
  @apply text-xl font-semibold rounded-lg transition-all duration-100 ease-in-out p-3
         active:scale-95 active:opacity-80;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed scale-100 active:scale-100;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
}
</style>