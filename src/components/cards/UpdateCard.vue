<template>
  <div class="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium tracking-tight">
        {{ version }}
      </h3>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ date }}</span>
    </div>
    <ul class="space-y-3">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-center group/item"
      >
        <Dot class="h-3 w-3 text-indigo-500 dark:text-indigo-400 mt-1 mr-3 shrink-0 opacity-75 group-hover/item:opacity-100 transition-opacity" />
        <span class="text-sm text-gray-600 dark:text-gray-300">{{ feature }}</span>
      </li>
    </ul>
  </div>
</template>

  
  <script setup>
  import { Circle as Dot } from 'lucide-vue-next';
  
  defineProps({
    version: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    features: {
      type: Array,
      required: true
    }
  });
  </script>
  
  