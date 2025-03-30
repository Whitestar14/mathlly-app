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
import { XIcon } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import Button from "@/components/base/BaseButton.vue"

defineProps({
  isMobile: {
    type: Boolean,
    required: true
  }
})
const { toasts, removeToast } = useToast()
</script>

<style scoped>
/* Simplified transitions for better mobile performance */
.toast-transition-enter-active {
  transition: all 0.3s ease-out;
}

.toast-transition-leave-active {
  transition: all 0.3s ease-in;
}

.toast-transition-move {
  transition: all 0.3s ease;
}

.toast-transition-enter-from {
  transform: translateY(30px);
  opacity: 0;
}

.toast-transition-leave-to {
@apply translate-y-[30px] md:translate-x-[30px] md:translate-y-0 opacity-0;
}
</style>
