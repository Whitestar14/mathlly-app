<template>
  <div class="flex-grow flex items-center justify-center bg-white dark:bg-gray-800">
    <div class="space-y-8 w-full max-w-2xl px-6">
      <!-- Display skeleton -->
      <div class="animate-pulse">
        <!-- Result display skeleton -->
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
        
        <!-- Button grid skeleton -->
        <div class="grid grid-cols-4 gap-2">
          <div 
            v-for="n in 20" 
            :key="n" 
            class="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'CalculatorLoader'
});
</script>