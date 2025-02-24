<template>
  <div class="left-0 bottom-0 w-full absolute z-10">
    <div class="flex w-full justify-between items-center">
      <div class="opacity-30 hover:opacity-100 p-2 cursor-pointer transition-colors">
        <div
          v-if="showLeftChevron"
          :class="{ 'bg-gray-200 dark:bg-gray-600': activeChevron === 'left' }"
          class="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden h-9 w-9 p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
          @click="scrollToPrevious"
        >
          <ChevronLeft
            size="24"
            class="text-gray-600 dark:text-gray-400"
          />
        </div>
      </div>
  
      <div class="opacity-30 hover:opacity-100 p-2 cursor-pointer transition-colors">
        <div
          v-if="showRightChevron"
          class="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden h-9 w-9 p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
          @click="scrollToNext"
        >
          <ChevronRight
            size="24"
            class="text-gray-600 dark:text-gray-400"
          />
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ChevronLeft, ChevronRight } from "lucide-vue-next";
  
  defineProps({
    showLeftChevron: { type: Boolean, default: false },
    showRightChevron: { type: Boolean, default: false },
    activeChevron: { type: String, default: null },
  });
  
  const emit = defineEmits(["scroll-to-previous", "scroll-to-next"]);
  
  const scrollToPrevious = () => emit("scroll-to-previous");
  const scrollToNext = () => emit("scroll-to-next");
  </script>