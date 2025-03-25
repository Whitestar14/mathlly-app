<template>
  <div v-show="toasts.length" class="fixed bottom-4 right-4 z-50">
    <!-- Container for all toasts with close all button -->
    <div v-if="toasts.length > 1">
      <Button 
        size="sm" 
        variant="secondary" 
        class="rounded-full p-1 h-auto bg-white dark:bg-gray-800 shadow-md"
        @click="clearAllToasts"
      >
        <XIcon class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- Toast stack container - simplified for mobile -->
    <div class="relative h-auto w-72 mt-8">
      <TransitionGroup 
        name="toast-transition" 
        tag="div"
        class="relative"
      >
        <div 
          v-for="(toast, index) in toasts" 
          :key="toast.id" 
          class="toast absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-full transform-gpu"
          :style="{
            zIndex: toasts.length - index, // Newer toasts have higher z-index
            bottom: isMobile ? `${index * 4}px` : `${index * 8}px`, // Reduced offset for mobile
            right: isMobile ? `${index * 2}px` : `${index * 4}px`, // Reduced offset for mobile
            opacity: getToastOpacity(index)
          }"
        >
          <div class="flex justify-between items-start">
            <div class="pr-6"> <!-- Add padding to prevent text overlap with close button -->
              <h3 class="font-medium text-gray-900 dark:text-gray-100">
                {{ toast.title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ toast.description }}
              </p>
            </div>
            <div class="absolute top-2 right-2">
              <Button 
                size="sm" 
                variant="secondary" 
                class="rounded-full p-1 h-auto"
                @click="removeToast(toast.id)"
              >
                <XIcon class="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useThrottleFn } from '@vueuse/core'
import { XIcon } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import Button from "@/components/base/BaseButton.vue"

const { toasts, removeToast } = useToast()
const isMobile = ref(false);

// Function to clear all toasts at once
const clearAllToasts = useThrottleFn(() => {
  toasts.value.forEach(toast => removeToast(toast.id));
}, 300);

// Calculate opacity based on position in stack (simplified for mobile)
const getToastOpacity = (index) => {
  if (index === 0) return 1; // Newest toast is fully opaque
  if (isMobile.value) {
    return Math.max(0.8, 1 - (index * 0.1)); // Less transparency on mobile
  }
  return Math.max(0.7, 1 - (index * 0.15));
}

// Detect if device is mobile
onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
  });
});
</script>

<style scoped>
/* Simplified transitions for better mobile performance */
.toast-transition-enter-active {
  transition: all 0.25s ease-out;
}

.toast-transition-leave-active {
  transition: all 0.2s ease-in;
}

.toast-transition-move {
  transition: all 0.3s ease;
}

.toast-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-transition-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Card stack effect - simplified for mobile */
.toast {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  transform-origin: bottom right;
}

/* Simplified hover effect for touch devices */
@media (hover: hover) {
  .toast:hover {
    transform: translateY(-2px) translateX(-1px) scale(1.01);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    z-index: 60 !important;
  }
}
</style>
