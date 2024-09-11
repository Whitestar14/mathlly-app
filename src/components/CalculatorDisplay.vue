<template>
  <div
    class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 transition-all duration-300"
  >
    <div class="h-20 relative overflow-hidden">
      <!-- Main display -->
      <div
        class="absolute w-full transition-all duration-500 ease-custom transform-gpu"
        :class="{ '-translate-y-full opacity-0': isAnimating, 'translate-y-0 opacity-100': !isAnimating }"
      >
        <!-- Display the current input value -->
        <div
          class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ input }}
        </div>

        <!-- Display the preview if there is no error and not animating -->
        <div
          v-if="!error && !isAnimating && preview"
          class="text-right text-xl text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ preview }}
        </div>

        <!-- Display the error message if an error exists -->
        <div
          v-if="error"
          class="text-right text-xl text-red-500 overflow-x-auto whitespace-nowrap"
          aria-live="assertive"
          aria-atomic="true"
        >
          {{ error }}
        </div>
      </div>

      <!-- Animated preview section (becomes the main display when animating) -->
      <div
        class="absolute w-full transition-all duration-500 ease-custom transform-gpu"
        :class="{ 'translate-y-0 opacity-100': isAnimating, 'translate-y-full opacity-0': !isAnimating }"
      >
        <div
          class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ animatedPreview }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// Define the props passed to this component
defineProps({
  input: String,             // The current input value
  preview: String,           // The preview of the evaluated result
  error: String,             // Error message (if any)
  isAnimating: Boolean,      // Boolean flag for animation state
  animatedPreview: String    // The animated result that appears after pressing '='
});
</script>

<style scoped>
/* Transitions for sliding the content vertically */
.translate-y-full {
  transform: translate3d(0, 100%, 0); /* Push down for hide */
}
.-translate-y-full {
  transform: translate3d(0, -100%, 0); /* Push up for hide */
}
.translate-y-0 {
  transform: translate3d(0, 0, 0); /* Stay in place for show */
}

/* Custom easing function for smoother transitions */
.ease-custom {
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Performance optimization for animations */
.transform-gpu {
  will-change: transform, opacity;
}
</style>
