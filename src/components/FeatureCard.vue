<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <component
      :is="icon"
      class="h-12 w-12 text-indigo-500 mb-4"
    />
    <h4
      class="text-xl font-semibold mb-2"
      style="font-family:'Geist mono'"
    >
      {{ title }}
    </h4>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
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

