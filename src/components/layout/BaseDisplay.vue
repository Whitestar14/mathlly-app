<template>
  <div class="grid grid-cols-4 gap-1 text-xs mt-1">
    <button
      v-for="base in ['HEX', 'DEC', 'OCT', 'BIN']"
      :key="base"
      :class="[
        'flex justify-between items-center p-2 rounded transition-colors duration-200',
        activeBase === base
          ? 'bg-indigo-50 dark:bg-gray-700/70 text-gray-500 border border-indigo-300 dark:border-indigo-300/25 dark:text-gray-200'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30',
      ]"
      @click="$emit('base-change', base)"
    >
      <span
        :class="[
          activeBase === base
            ? 'text-indigo-600 dark:text-indigo-300'
            : 'text-gray-600 dark:text-gray-400',
        ]"
      >{{ base }}</span>
      <span
        :class="[
          'monospace',
          activeBase === base
            ? 'text-indigo-500 dark:text-indigo-300 font-medium'
            : 'text-gray-800 dark:text-gray-300',
        ]"
      >{{ DisplayFormatter.formatDisplayValue(displayValues[base]?.display, base) }}</span>
    </button>
  </div>
</template>

<script setup>
import { DisplayFormatter } from "@/services/display/DisplayFormatter"

defineProps({
  displayValues: {
    type: Object,
    required: true,
  },
  activeBase: {
    type: String,
    required: true,
  },
});

defineEmits(['base-change']);
</script>
