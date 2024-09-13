<template>
  <DialogRoot :open="isOpen" @update:open="updateOpen">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-black/50 animate-fade-in transition-opacity duration-300 ease-in-out"
      />
      <DialogContent
        class="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out"
        :class="[
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'transform'
        ]"
      >
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white">Menu</DialogTitle>
            <DialogClose class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
              <XIcon class="h-6 w-6" />
            </DialogClose>
          </div>
          
          <nav class="flex-grow p-4">
            <ul class="space-y-2">
              <li>
                <button
                  @click="openAbout"
                  class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <InfoIcon class="h-5 w-5" />
                  <span>About</span>
                </button>
              </li>
              <li>
                <button
                  @click="openSettings"
                  class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <SettingsIcon class="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Mathlly v1.0.0
            </p>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'radix-vue';
import { XIcon, InfoIcon, SettingsIcon } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['update:isOpen', 'openAbout', 'openSettings']);

const updateOpen = (open) => {
  emit('update:isOpen', open);
};

const openAbout = () => {
  emit('openAbout');
  updateOpen(false);
};

const openSettings = () => {
  emit('openSettings');
  updateOpen(false);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>