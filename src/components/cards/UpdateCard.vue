<template>
  <div class="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-colors">
    <!-- Version Badge -->
    <div class="absolute -top-3 right-4">
      <Badge :show-notch="true" type="version" :text="`v${version}`" />
    </div>
    
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-base font-mono font-medium tracking-tight flex items-center">
        <TagIcon class="h-4 w-4 mr-2 text-indigo-500 dark:text-indigo-400" />
        Release
      </h3>
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ date }}</span>
    </div>
    
    <ul class="space-y-3">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-start group/item"
      >
        <CheckCircle2 class="h-4 w-4 text-green-500 dark:text-green-400 mt-1 mr-3 shrink-0 opacity-75 group-hover/item:opacity-100 transition-opacity" />
        <span class="text-sm text-gray-600 dark:text-gray-300">{{ feature }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { TagIcon, CheckCircle2 } from 'lucide-vue-next';
import Badge from '@/components/base/BaseBadge'
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
