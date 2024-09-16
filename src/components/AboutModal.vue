<template>
  <DialogRoot :open="isOpen" @update:open="updateOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50 animate-fade-in" />
      <DialogContent class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full w-[80%] max-w-lg max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col animate-scale-in">
        <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white p-6 flex items-center border-b border-gray-200 dark:border-gray-700">
          About Mathlly
        </DialogTitle>
        <div class="flex-grow overflow-y-auto p-6">
          <div class="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Welcome to Mathlly, your friendly neighborhood calculator app!
            </p>
            <p>
            Mathlly was born out of a desire to create a powerful yet user-friendly calculator tailored for programmers and developers. 👨‍💻👩‍💻
          </p>
          <p>
            Our mission is to provide a seamless calculation experience with features that cater specifically to the needs of the coding community.
          </p>
          <h3 class="text-lg font-semibold mt-4 mb-2">Key Features:</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>Multiple calculation modes (Standard, Programmer, Scientific) </li>
            <li>Syntax highlighting for better readability </li>
            <li>History tracking and recall </li>
            <li>Customizable settings for precision and display options </li>
            <li>Dark mode for those late-night coding sessions </li>
          </ul>
          <p class="mt-4">
            Mathlly is constantly evolving, and we're always looking for ways to improve. Have a suggestion? We'd love to hear from you! 
          </p>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Version: 1.0.0 | Created with ❤️ by the Mathlly Team
          </p>
        </div>
        <DialogClose class="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <XIcon class="h-6 w-6" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'radix-vue';
import { XIcon } from 'lucide-vue-next';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['update:isOpen']);

const updateOpen = (open) => {
  emit('update:isOpen', open);
};
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

/* Add these styles for custom scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 20px;
  border: transparent;
}
</style>