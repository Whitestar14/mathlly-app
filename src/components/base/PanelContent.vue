<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      v-show="showHeader"
      class="flex-shrink-0 h-14 px-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
    >
      <h2 class="text-base font-medium text-gray-800 dark:text-gray-200">
        {{ title }}
      </h2>
      <div class="flex items-center gap-2 justify-between">
        <slot name="header-actions" />
        <Button
          class="md:hidden rounded-full"
          variant="ghost"
          size="icon"
          @click="$emit('close')"
        >
          <XIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
      
    <!-- Main Content -->
    <div
      class="flex-1 overflow-y-auto"
      :class="contentClass"
    >
      <slot />
    </div>
      
    <!-- Footer -->
    <div
      v-if="showFooter && $slots.footer"
      class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 lg:min-h-14"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
  
  <script setup>
  import { XIcon } from "lucide-vue-next"
  import Button from "@/components/base/BaseButton.vue"
  
  defineProps({
    title: { type: String, default: "" },
    contentClass: { type: String, default: "" },
    showHeader: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true },
  })
  
  defineEmits(['close'])
  </script>
  