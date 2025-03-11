<template>
  <div class="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
    <component
      :is="icon"
      class="h-10 w-10 text-indigo-500 dark:text-indigo-400 mb-4 opacity-75 group-hover:opacity-100 transition-opacity"
    />
    <h4
      class="text-lg font-medium tracking-tight mb-2"
      style="font-family:'Geist mono'"
    >
      {{ title }}
    </h4>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import * as LucideIcons from 'lucide-vue-next';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const icon = LucideIcons[props.icon];
</script>

