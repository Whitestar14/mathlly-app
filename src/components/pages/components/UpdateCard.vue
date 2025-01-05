<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">{{ version }}</h3>
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ date }}</span>
      </div>
      <ul class="space-y-2">
        <li v-for="(feature, index) in features" :key="index" class="flex items-start">
          <CheckCircleIcon class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
          <span>{{ feature }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { CheckCircleIcon } from 'lucide-vue-next';
  
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
  
  