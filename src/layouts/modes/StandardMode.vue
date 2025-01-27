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
        @click="handleClick('%')"
        :disabled="isMaxLengthReached"
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
        @click="handleClick('1/x')"
        :disabled="isMaxLengthReached"
      >
        1/x
      </button>
      <button
        class="btn function-btn"
        @click="handleClick('x²')"
        :disabled="isMaxLengthReached"
      >
        x²
      </button>
      <button
        class="btn function-btn"
        @click="handleClick('√')"
        :disabled="isMaxLengthReached"
      >
        √
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('÷')"
        :disabled="isMaxLengthReached"
      >
        ÷
      </button>

      <button
        class="btn  number-btn"
        @click="handleClick('7')"
        :disabled="isMaxLengthReached"
      >
        7
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('8')"
        :disabled="isMaxLengthReached"
      >
        8
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('9')"
        :disabled="isMaxLengthReached"
      >
        9
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('×')"
        :disabled="isMaxLengthReached"
      >
        ×
      </button>

      <button
        class="btn number-btn"
        @click="handleClick('4')"
        :disabled="isMaxLengthReached"
      >
        4
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('5')"
        :disabled="isMaxLengthReached"
      >
        5
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('6')"
        :disabled="isMaxLengthReached"
      >
        6
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('-')"
        :disabled="isMaxLengthReached"
      >
        −
      </button>

      <button
        class="btn number-btn"
        @click="handleClick('1')"
        :disabled="isMaxLengthReached"
      >
        1
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('2')"
        :disabled="isMaxLengthReached"
      >
        2
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('3')"
        :disabled="isMaxLengthReached"
      >
        3
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('+')"
        :disabled="isMaxLengthReached"
      >
        +
      </button>

      <button
        class="btn number-btn"
        @click="handleClick('±')"
        :disabled="isMaxLengthReached"
      >
        ±
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('0')"
        :disabled="isMaxLengthReached"
      >
        0
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('.')"
        :disabled="isMaxLengthReached"
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
const emit = defineEmits(['button-click', 'clear']);

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