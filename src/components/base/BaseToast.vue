<template>
    <!-- Toast stack container - simplified for mobile -->
    <div class="fixed z-50 bottom-4 right-4 h-auto w-72 pointer-events-none" :class="{ '-translate-x-1/2 left-1/2 right-auto': isMobile }">
      <TransitionGroup 
        name="toast-transition" 
        tag="div"
        class="relative"
      >
        <div 
          v-for="(toast, index) in toasts" 
          :key="toast.id" 
          class="origin-bottom-right duration-300 absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-full transform-gpu"
          :style="{
            zIndex: toasts.length - index, // Newer toasts have higher z-index
            bottom: isMobile ? `${index * 4}px` : `${index * 8}px`,
            right: isMobile ? `${index * 2}px` : `${index * 4}px`,
          }"
        >
          <div class="flex justify-between items-start">
            <div class="pr-3"> <!-- Add padding to prevent text overlap with close button -->
              <h3 class="font-medium text-gray-900 dark:text-gray-100">
                {{ toast.title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ toast.description }}
              </p>
            </div>
            <div class="absolute top-2 right-2 hidden md:block">
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
</template>

<script setup>
import { useToast } from '@/composables/useToast'
import { XIcon } from 'lucide-vue-next'
import Button from "@/components/base/BaseButton.vue"
const { toasts } = useToast()
</script>

<style scoped>
/* Transition Styles */
.toast-transition-move,
.toast-transition-enter-active,
.toast-transition-leave-active {
  transition: all 0.3s ease;
}

.toast-transition-leave-to,
.toast-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-transition-leave-from,
.toast-transition-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>