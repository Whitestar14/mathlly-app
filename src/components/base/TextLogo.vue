<template>
  <kbd
    :class="[
      'font-medium monospace pointer-events-none',
      'bg-gray-100 dark:bg-gray-800',
      'text-gray-800 dark:text-gray-200',
      'border border-gray-200 dark:border-gray-700 rounded-md shadow-sm',
      sizeClasses[size],
    ]"
    :aria-hidden="hideFromScreenReaders"
  >
    <span v-if="!clipped">
      {math<span
        class="dark:text-indigo-400 font-black text-indigo-600 inline-block mx-0.5"
      >//</span>y}
    </span>
    <span v-else>
      {<span
        class="dark:text-indigo-400 font-black text-indigo-600 inline-block mx-0.5"
      >//</span>}
    </span>
  </kbd>
</template>
  
<script setup>
import { computed } from 'vue';

defineProps({
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "xl"].includes(value),
  },
  clipped: {
    type: Boolean,
    default: false
  },
  hideFromScreenReaders: {
    type: Boolean,
    default: false
  }
});

// Size classes for the text logo - use computed to avoid re-creating on each render
const sizeClasses = computed(() => ({
  sm: "text-xl px-2 py-1",
  md: "text-2xl px-2.5 py-1.5",
  lg: "text-4xl px-5 py-3",
  xl: "text-6xl px-6 py-4"
}));
</script>