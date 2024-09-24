<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50 z-50" />
      <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full z-50">
        <DialogTitle class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</DialogTitle>
        <ul class="space-y-3">
          <li v-for="shortcut in shortcuts" :key="shortcut.key" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span class="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md shadow-sm flex-grow">{{ shortcut.description }}</span>
            <div class="flex items-center space-x-1 bg-indigo-100 dark:bg-indigo-900 px-3 py-2 rounded-md shadow-sm">
              <template v-for="(modifier, index) in shortcut.modifiers" :key="index">
                <kbd class="bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded text-sm font-semibold text-indigo-800 dark:text-indigo-200 shadow">{{ modifier }}</kbd>
                <span class="text-indigo-500 dark:text-indigo-400">+</span>
              </template>
              <kbd class="bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded text-sm font-semibold text-indigo-800 dark:text-indigo-200 shadow">{{ shortcut.key.toUpperCase() }}</kbd>
            </div>
          </li>
        </ul>
        <DialogClose as="button" class="absolute top-2 right-2 p-1 m-3 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" @click="closeModal">
          <XIcon class="w-6 h-6"/>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from 'radix-vue';
import { defineProps, defineEmits } from 'vue';
import { XIcon } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

// Emit the `close` event when the modal is closed
const closeModal = () => {
  emit('update:open', false);
};

const shortcuts = [
  { modifiers: ['Ctrl'], key: 'l', description: 'Toggle Sidebar' },
  { modifiers: ['Ctrl'], key: 'h', description: 'Toggle History' },
  { modifiers: ['Ctrl'], key: 's', description: 'Navigate to Settings' },
  { modifiers: ['Ctrl'], key: 'k', description: 'Open Shortcut Guide' },
  { modifiers: ['Shift', 'Ctrl'], key: 'f', description: 'Toggle Full Screen' },
];
</script>

<style scoped>
kbd {
  font-family: 'Reddit mono', consolas, monospace;
}
</style>
