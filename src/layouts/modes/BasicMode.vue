<template>
  <div class="grid grid-cols-4 gap-2">
    <button
      class="calc-btn calc-special-btn-ac calc-c"
      @click="handleClick('C')"
    >
      AC
    </button>
    <button
      class="calc-btn calc-function-btn"
      @click="handleClick('CE')"
    >
      CE
    </button>
    <button
      class="calc-btn calc-function-btn flex justify-center items-center"
      @click="handleClick('backspace')"
    >
      <Delete class="h-6 w-6" />
    </button>
    <button
      class="calc-btn calc-operator-btn"
      @click="handleClick('÷')"
    >
      ÷
    </button>

    <button
      v-for="num in ['7', '8', '9']"
      :key="num"
      class="calc-btn calc-number-btn"
      @click="handleClick(num)"
    >
      {{ num }}
    </button>
    <button
      class="calc-btn calc-operator-btn"
      @click="handleClick('×')"
    >
      ×
    </button>

    <button
      v-for="num in ['4', '5', '6']"
      :key="num"
      class="calc-btn calc-number-btn"
      @click="handleClick(num)"
    >
      {{ num }}
    </button>
    <button
      class="calc-btn calc-operator-btn"
      @click="handleClick('-')"
    >
      −
    </button>

    <button
      v-for="num in ['1', '2', '3']"
      :key="num"
      class="calc-btn calc-number-btn"
      @click="handleClick(num)"
    >
      {{ num }}
    </button>
    <button
      class="calc-btn calc-operator-btn"
      @click="handleClick('+')"
    >
      +
    </button>

    <button
      class="calc-btn calc-number-btn"
      @click="handleClick('±')"
    >
      ±
    </button>
    <button
      class="calc-btn calc-number-btn"
      @click="handleClick('0')"
    >
      0
    </button>
    <button
      class="calc-btn calc-number-btn"
      @click="handleClick('.')"
    >
      .
    </button>
    <button
      class="calc-btn calc-operator-btn calc-equals-btn"
      @click="handleClick('=')"
    >
      =
    </button>
  </div>
</template>

<script setup>
import { Delete } from 'lucide-vue-next';

const emit = defineEmits(['button-click', 'clear']);

const handleClick = (value) => {
  if (value === 'C') {
    emit('clear');
  } else {
    emit('button-click', value);
  }
};
</script>

<style lang="css" scoped>
@import url('../../assets/css/buttons.css');
</style>