<template>
  <div class="grid grid-cols-4 gap-2">
    <!-- Special Functions (Top Row) -->
    <button @click="$emit('clear')" class="special-btn-ac">AC</button>
    <button @click="$emit('button-click', '±')" class="special-btn">±</button>
    <button @click="$emit('button-click', '%')" class="special-btn">%</button>
    <button @click="$emit('button-click', '÷')" class="operator-btn">÷</button>

    <!-- Numbers and Decimal -->
    <button
      v-for="num in ['7', '8', '9']"
      :key="num"
      @click="$emit('button-click', num)"
      class="number-btn"
    >
      {{ num }}
    </button>
    <button @click="$emit('button-click', '×')" class="operator-btn">×</button>

    <button
      v-for="num in ['4', '5', '6']"
      :key="num"
      @click="$emit('button-click', num)"
      class="number-btn"
    >
      {{ num }}
    </button>
    <button @click="$emit('button-click', '-')" class="operator-btn">−</button>

    <button
      v-for="num in ['1', '2', '3']"
      :key="num"
      @click="$emit('button-click', num)"
      class="number-btn"
    >
      {{ num }}
    </button>
    <button @click="$emit('button-click', '+')" class="operator-btn">+</button>

    <!-- Zero and Decimal -->
    <button @click="$emit('button-click', '0')" class="col-span-2 number-btn">
      0
    </button>
    <button @click="$emit('button-click', '.')" class="number-btn">.</button>
    <button @click="$emit('button-click', '=')" class="operator-btn">=</button>

    <!-- Programmer Mode Buttons (conditionally rendered) -->
    <template v-if="mode === 'Programmer'">
      <button
        v-for="op in ['AND', 'OR', 'NOT', 'XOR']"
        :key="op"
        @click="$emit('button-click', op)"
        class="col-span-2 programmer-btn"
      >
        {{ op }}
      </button>
    </template>
  </div>
</template>

<script setup>
import defineProps from "vue";
import defineEmits from "vue";
defineProps(["mode"]);
defineEmits(["button-click", "clear"]);
</script>

<style scoped>
/* Number Button Styling */
.number-btn {
  @apply text-xl font-semibold rounded-lg transition-all duration-300 ease-in-out p-3
         bg-gray-200 text-gray-800 hover:bg-gray-300 
         dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600;
}

/* Operator Button Styling */
.operator-btn {
  @apply text-xl font-semibold rounded-lg transition-all duration-300 ease-in-out p-3
         bg-indigo-500 text-white hover:bg-indigo-600;
}

/* Special Button Styling */
.special-btn {
  @apply text-xl font-semibold rounded-lg transition-all duration-300 ease-in-out p-3
         bg-gray-300 text-gray-900 hover:bg-gray-400;
}

/* AC Button Styling (Orangish-red) */
.special-btn-ac {
  @apply text-xl font-semibold rounded-lg transition-all duration-300 ease-in-out p-3
         bg-red-500 text-white hover:bg-red-600;
}

/* Programmer Mode Button Styling */
.programmer-btn {
  @apply text-xl font-semibold rounded-lg transition-all duration-300 ease-in-out p-3
         bg-purple-500 text-white hover:bg-purple-600;
}
</style>
