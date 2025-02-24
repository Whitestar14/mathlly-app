<template>
  <div class="flex items-center left-0 top-0 absolute z-10 opacity-30 transition-opacity hover:opacity-100 group">
    <div class="flex items-center m-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden">
      <button
        v-tippy="{ content: 'Open History Panel', placement: 'top' }"
        class="h-9 w-9 md:hidden p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer group-hover:bg-opacity-100"
        @click="toggleHistory"
      >
        <HistoryIcon
          size="20"
          class="text-gray-600 dark:text-gray-400"
        />
      </button>
      <div class="h-6 bg-gray-200 dark:bg-gray-600 w-px md:hidden group-hover:opacity-0 transition-opacity" />
      <button
        v-tippy="copyOptions"
        class="h-9 w-9 p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer group-hover:bg-opacity-100"
        @click="copyToClipboard"
      >
        <Copy
          size="20"
          class="text-gray-600 dark:text-gray-400"
        />
      </button>
    </div>
  </div>
</template>
  
  <script setup>
  import { Copy, History as HistoryIcon } from "lucide-vue-next";
  
  defineProps({
    copyOptions: { type: Object, default: () => ({}) },
  });
  
  const emit = defineEmits(["toggle-history", "copy-to-clipboard"]);
  
  const toggleHistory = () => emit("toggle-history");
  const copyToClipboard = () => emit("copy-to-clipboard");
  </script>