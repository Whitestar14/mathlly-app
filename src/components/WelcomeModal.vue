<template>
  <DialogRoot :open="isOpen" @update:open="$emit('update:isOpen')">
    <!-- Backdrop -->
    <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

    <!-- Content -->
    <DialogContent
      class="fixed inset-0 flex items-center justify-center p-4 z-[100]"
      @close="closeModal"
    >
      <div
        class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
      >
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </button>

        <!-- Title -->
        <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Welcome to Mathlly Beta
        </DialogTitle>

        <!-- Content -->
        <div class="mt-4 space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            You're among the first to try out Mathlly, our experimental calculator app designed for modern computing needs.
          </p>

          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">What you should know:</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                This is a beta version and some features might be experimental
              </li>
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                Calculations are processed locally for your security
              </li>
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                Your feedback is invaluable in shaping Mathlly's future
              </li>
            </ul>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Found a bug or have a suggestion? 
              <a
                href="https://github.com/yourusername/mathlly/issues"
                target="_blank"
                class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                Open an issue on GitHub
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 flex justify-between items-center">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="dontShowAgain"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700"
            />
            <span class="text-sm text-gray-600 dark:text-gray-300">Don't show again</span>
          </label>

          <button
            type="button"
            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors duration-200"
            @click="handleClose"
          >
            Get Started
          </button>
        </div>
      </div>
    </DialogContent>
  </DialogRoot>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import {
  DialogRoot,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from 'radix-vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:isOpen', 'close']);

const dontShowAgain = ref(false);

const closeModal = () => {
  emit('update:isOpen', false);
  emit('close');
};

const handleClose = () => {
  if (dontShowAgain.value) {
    localStorage.setItem('mathlly-welcome-shown', 'true');
  }
  closeModal();
};
</script>