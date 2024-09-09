<template>
  <div class="grid grid-cols-4 gap-3">
    <button
      v-for="button in buttons"
      :key="button"
      @click="$emit('button-click', button)"
      :class="[
        'rounded-full text-2xl font-semibold focus:outline-none',
        button === '0' ? 'col-span-2 w-36 h-16 text-left pl-7' : 'w-16 h-16',
        ['÷', '×', '-', '+', '='].includes(button)
          ? 'bg-orange-500 text-white'
          : ['AC', '+/-', '%'].includes(button)
          ? 'bg-gray-500 text-black'
          : 'bg-gray-800 text-white',
      ]"
    >
      {{ button }}
    </button>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";

defineEmits(["button-click"]);

const buttons = [
  "AC",
  "+/-",
  "%",
  "÷",
  "7",
  "8",
  "9",
  "×",
  "4",
  "5",
  "6",
  "-",
  "1",
  "2",
  "3",
  "+",
  "0",
  ".",
  "=",
];
</script>
