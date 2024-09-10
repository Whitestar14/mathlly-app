<template>
  <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 transition-all duration-300">
    <div class="h-20 flex flex-col justify-between">
      <div 
        class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ input }}
      </div>
      <div 
        v-if="!error"
        class="text-right text-xl text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ preview }}
      </div>
      <div 
        v-else
        class="text-right text-xl text-red-500 overflow-x-auto whitespace-nowrap"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['input', 'preview', 'error'])
</script>