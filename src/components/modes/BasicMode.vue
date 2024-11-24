<template>
  <div class="grid grid-cols-4 gap-2">
    <button @click="handleClick('C')" class="btn special-btn-ac">AC</button>
    <button @click="handleClick('CE')" class="btn function-btn">CE</button>
    <button @click="handleClick('backspace')" class="btn function-btn flex justify-center items-center">
      <Delete class="h-5 w-5" />
    </button>
    <button @click="handleClick('÷')" class="btn operator-btn">÷</button>

    <button v-for="num in ['7', '8', '9']" :key="num" @click="handleClick(num)" class="btn number-btn">
      {{ num }}
    </button>
    <button @click="handleClick('×')" class="btn operator-btn">×</button>

    <button v-for="num in ['4', '5', '6']" :key="num" @click="handleClick(num)" class="btn number-btn">
      {{ num }}
    </button>
    <button @click="handleClick('-')" class="btn operator-btn">−</button>

    <button v-for="num in ['1', '2', '3']" :key="num" @click="handleClick(num)" class="btn number-btn">
      {{ num }}
    </button>
    <button @click="handleClick('+')" class="btn operator-btn">+</button>

    <button @click="handleClick('±')" class="btn number-btn">±</button>
    <button @click="handleClick('0')" class="btn number-btn">0</button>
    <button @click="handleClick('.')" class="btn number-btn">.</button>
    <button @click="handleClick('=')" class="btn operator-btn equals-btn">=</button>
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