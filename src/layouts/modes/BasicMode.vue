<template>
  <div class="grid grid-cols-4 gap-2">
    <button
      class="btn special-btn-ac c"
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
      <Delete class="h-6 w-6" />
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
@import url('@/assets/css/buttons.css');

.btn {
  font-family: 'Geist Mono', monospace; 
  @apply text-xl font-semibold rounded-lg transition-all duration-100 ease-in-out p-3
         active:scale-95 active:opacity-80;
}
</style>