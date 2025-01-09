<template>
  <DialogRoot
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade" />
  
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <DialogContent class="fixed inset-0 flex items-center justify-center p-4 z-[100]">
        <div class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl">
          <!-- Close Button -->
          <button
            class="absolute right-4 top-4 rounded-full p-2 opacity-70 ring-offset-background transition-opacity dark:text-gray-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
            @click="$emit('update:open', false)"
          >
            <XIcon class="h-4 w-4" />
            <span class="sr-only">Close</span>
          </button>
  
          <!-- Title Slot -->
          <DialogTitle
            as="h3"
            class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
          >
            <slot name="title" />
          </DialogTitle>
  
          <!-- Content Slot -->
          <slot />
        </div>
      </DialogContent>
    </Transition>
  </DialogRoot>
</template>
  
  <script setup>
  import { DialogRoot, DialogOverlay, DialogContent, DialogTitle } from 'radix-vue'
  import { XIcon } from 'lucide-vue-next'
  
  defineProps({
    open: Boolean
  })
  
  defineEmits(['update:open'])
  </script>
  