<template>
  <div class="grid grid-cols-4 gap-2">
    <button
      class="btn special-btn-ac"
      @click="handleClick('C')"
    >
      AC
    </button>
    <button
      class="btn function-btn"
      @click="handleClick('CE')"
    >
      CE
    </button>
    <button
      class="btn function-btn flex justify-center items-center"
      @click="handleClick('backspace')"
    >
      <Delete class="h-5 w-5" />
    </button>
    <button
      class="btn operator-btn"
      @click="handleClick('÷')"
    >
      ÷
    </button>

    <button
      v-for="num in ['7', '8', '9']"
      :key="num"
      class="btn number-btn"
      @click="handleClick(num)"
    >
      {{ num }}
    </button>
    <button
      class="btn operator-btn"
      @click="handleClick('×')"
    >
      ×
    </button>

    <button
      v-for="num in ['4', '5', '6']"
      :key="num"
      class="btn number-btn"
      @click="handleClick(num)"
    >
      {{ num }}
    </button>
    <button
      class="btn operator-btn"
      @click="handleClick('-')"
    >
      −
    </button>

    <button
      v-for="num in ['1', '2', '3']"
      :key="num"
      class="btn number-btn"
      @click="handleClick(num)"
    >
      {{ num }}
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
      class="btn operator-btn equals-btn"
      @click="handleClick('=')"
    >
      =
    </button>
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
@import '../../assets/css/CalculatorButtons.css';

</style>