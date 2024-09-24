<template>
  <div class="flex flex-col h-full">
    <div class="grid grid-cols-5 gap-1 mb-1">
      <button v-for="op in ['MC', 'MR', 'M+', 'M-', 'MS']" :key="op" @click="handleClick(op)" class="btn memory-btn">
        {{ op }}
      </button>
    </div>
    <div class="grid grid-cols-4 gap-1 flex-grow">
      <button @click="handleClick('%')" class="btn function-btn">%</button>
      <button @click="handleClick('CE')" class="btn function-btn">CE</button>
      <button @click="handleClick('C')" class="btn function-btn">C</button>
      <button @click="handleClick('backspace')" class="btn function-btn">
        <Delete class="w-6 h-6 mx-auto" />
      </button>

      <button @click="handleClick('1/x')" class="btn function-btn">1/x</button>
      <button @click="handleClick('x²')" class="btn function-btn">x²</button>
      <button @click="handleClick('√')" class="btn function-btn">√</button>
      <button @click="handleClick('÷')" class="btn operator-btn">÷</button>

      <button @click="handleClick('7')" class="btn  number-btn">7</button>
      <button @click="handleClick('8')" class="btn number-btn">8</button>
      <button @click="handleClick('9')" class="btn number-btn">9</button>
      <button @click="handleClick('×')" class="btn operator-btn">×</button>

      <button @click="handleClick('4')" class="btn number-btn">4</button>
      <button @click="handleClick('5')" class="btn number-btn">5</button>
      <button @click="handleClick('6')" class="btn number-btn">6</button>
      <button @click="handleClick('-')" class="btn operator-btn">−</button>

      <button @click="handleClick('1')" class="btn number-btn">1</button>
      <button @click="handleClick('2')" class="btn number-btn">2</button>
      <button @click="handleClick('3')" class="btn number-btn">3</button>
      <button @click="handleClick('+')" class="btn operator-btn">+</button>

      <button @click="handleClick('±')" class="btn number-btn">±</button>
      <button @click="handleClick('0')" class="btn number-btn">0</button>
      <button @click="handleClick('.')" class="btn number-btn">.</button>
      <button @click="handleClick('=')" class="btn operator-btn">=</button>
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
@import "../../assets/css/CalculatorButtons.css";

</style>