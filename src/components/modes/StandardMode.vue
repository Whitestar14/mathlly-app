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
      >
        1/x
      </button>
      <button
        class="btn function-btn"
        @click="handleClick('x²')"
      >
        x²
      </button>
      <button
        class="btn function-btn"
        @click="handleClick('√')"
      >
        √
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('÷')"
      >
        ÷
      </button>

      <button
        class="btn  number-btn"
        @click="handleClick('7')"
      >
        7
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('8')"
      >
        8
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('9')"
      >
        9
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('×')"
      >
        ×
      </button>

      <button
        class="btn number-btn"
        @click="handleClick('4')"
      >
        4
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('5')"
      >
        5
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('6')"
      >
        6
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('-')"
      >
        −
      </button>

      <button
        class="btn number-btn"
        @click="handleClick('1')"
      >
        1
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('2')"
      >
        2
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('3')"
      >
        3
      </button>
      <button
        class="btn operator-btn"
        @click="handleClick('+')"
      >
        +
      </button>

      <button
        class="btn number-btn"
        @click="handleClick('±')"
      >
        ±
      </button>
      <button
        class="btn number-btn"
        @click="handleClick('0')"
      >
        0
      </button>
      <button
        class="btn number-btn"
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
import { defineEmits } from 'vue';

const emit = defineEmits(['button-click', 'clear']);

const handleClick = (value) => {
  if (value === 'C') {
    emit('clear');
  } else {
    emit('button-click', value);
  }
};
</script>

<style scoped>
@import "../../assets/css/buttons.css";

</style>