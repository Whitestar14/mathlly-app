<template>
  <div class="grid grid-cols-4 gap-2">
    <!-- Basic Mode -->
    <template v-if="mode === 'Basic'">
      <button @click="handleClick('CE')" class="special-btn">CE</button>
      <button @click="handleClick('C')" class="special-btn">C</button>
      <button @click="handleClick('backspace')" class="special-btn flex justify-center items-center">
        <Delete class="h-5 w-5" />
      </button>
      <button @click="handleClick('÷')" class="operator-btn">÷</button>

      <button v-for="num in ['7', '8', '9']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('×')" class="operator-btn">×</button>

      <button v-for="num in ['4', '5', '6']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('-')" class="operator-btn">−</button>

      <button v-for="num in ['1', '2', '3']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('+')" class="operator-btn">+</button>

      <button @click="handleClick('±')" class="number-btn">±</button>
      <button @click="handleClick('0')" class="number-btn">0</button>
      <button @click="handleClick('.')" class="number-btn">.</button>
      <button @click="handleClick('=')" class="operator-btn equals-btn">=</button>
    </template>

    <!-- Standard Mode -->
    <template v-if="mode === 'Standard'">
      <button @click="handleClick('AC')" class="special-btn-ac">AC</button>
      <button @click="handleClick('±')" class="special-btn">±</button>
      <button @click="handleClick('%')" class="special-btn">%</button>
      <button @click="handleClick('÷')" class="operator-btn">÷</button>

      <button v-for="num in ['7', '8', '9']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('×')" class="operator-btn">×</button>

      <button v-for="num in ['4', '5', '6']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('-')" class="operator-btn">−</button>

      <button v-for="num in ['1', '2', '3']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('+')" class="operator-btn">+</button>

      <button @click="handleClick('0')" class="number-btn col-span-2">0</button>
      <button @click="handleClick('.')" class="number-btn">.</button>
      <button @click="handleClick('=')" class="operator-btn">=</button>
    </template>

    <!-- Programmer Mode -->
    <template v-if="mode === 'Programmer'">
      <button @click="handleClick('AC')" class="special-btn-ac">AC</button>
      <button @click="handleClick('±')" class="special-btn">±</button>
      <button @click="handleClick('%')" class="special-btn">%</button>
      <button @click="handleClick('÷')" class="operator-btn">÷</button>

      <button v-for="num in ['7', '8', '9']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('×')" class="operator-btn">×</button>

      <button v-for="num in ['4', '5', '6']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('-')" class="operator-btn">−</button>

      <button v-for="num in ['1', '2', '3']" :key="num" @click="handleClick(num)" class="number-btn">
        {{ num }}
      </button>
      <button @click="handleClick('+')" class="operator-btn">+</button>

      <button @click="handleClick('0')" class="number-btn col-span-2">0</button>
      <button @click="handleClick('.')" class="number-btn">.</button>
      <button @click="handleClick('=')" class="operator-btn">=</button>

      <div class="col-span-4 grid grid-cols-4 gap-2 mt-2">
        <button v-for="op in ['AND', 'OR', 'NOT', 'XOR']" :key="op" @click="handleClick(op)" class="programmer-btn">
          {{ op }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Delete } from 'lucide-vue-next';
import { defineEmits, defineProps } from "vue";

defineProps(["mode"]);
const emit = defineEmits(["button-click", "clear"]);

const handleClick = (value) => {
  if (value === 'C' || value === 'AC') {
    emit('clear');
  } else {
    emit('button-click', value);
  }
};
</script>

<style scoped>
.number-btn,
.operator-btn,
.special-btn,
.special-btn-ac,
.programmer-btn,
.equals-btn {
  @apply text-xl font-semibold rounded-lg transition-all duration-100 ease-in-out p-3
         active:scale-95 active:opacity-80;
}

.number-btn {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300 
         dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600;
}

.operator-btn {
  @apply bg-indigo-500 text-white hover:bg-indigo-600;
}

.special-btn {
  @apply bg-gray-300 text-gray-900 hover:bg-gray-400;
}

.special-btn-ac {
  @apply bg-red-500 text-white hover:bg-red-600;
}

.programmer-btn {
  @apply text-sm bg-purple-500 text-white hover:bg-purple-600;
}

.equals-btn {
  @apply bg-gray-500 text-white hover:bg-gray-900;
}
</style>