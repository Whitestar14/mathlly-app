<template>
  <div 
    class="fixed z-30 bottom-4 right-4 h-auto w-72" 
    :class="{ '-translate-x-1/2 left-1/2 pointer-events-none right-auto': isMobile }"
  >
    <TransitionGroup 
      name="toast-transition" 
      tag="div"
      class="relative"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="origin-bottom-right duration-300 absolute transform-gpu"
        :class="[
          toastTypeClasses[toast.type] || toastTypeClasses.info,
          'rounded-lg shadow-lg border p-4 w-full'
        ]"
        :style="getToastStyle(toast, toasts.indexOf(toast))"
      >
        <div class="flex justify-between items-start">
          <div class="pr-3">
            <h3
              class="font-medium"
              :class="getTitleClass(toast.type)"
            >
              {{ toast.title || getDefaultTitle(toast.type) }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ toast.message || toast.description }}
            </p>
          </div>
          <div
            v-if="toast.dismissible !== false"
            class="absolute top-2 right-2 hidden md:block"
          >
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
import { XIcon } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';
import Button from "@/components/base/BaseButton.vue";

const props = defineProps({
  isMobile: {
    type: Boolean,
    required: true
  }
});

const { toasts, removeToast } = useToast();

/**
 * CSS classes for different toast types
 */
const toastTypeClasses = {
  info: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  success: 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800',
  warning: 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-800',
  error: 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-800'
};

/**
 * Get title text classes based on toast type
 */
const getTitleClass = (type) => {
  const classes = {
    info: 'text-gray-900 dark:text-gray-100',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  };
  
  return classes[type] || classes.info;
};

/**
 * Get default title based on toast type
 */
const getDefaultTitle = (type) => {
  const titles = {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    error: 'Error'
  };
  
  return titles[type] || titles.info;
};

/**
 * Calculate toast positioning style
 */
const getToastStyle = (toast, index) => {
  return {
    zIndex: toasts.value.length - index, // Newer toasts have higher z-index
    bottom: props.isMobile ? `${index * 4}px` : `${index * 8}px`,
    right: props.isMobile ? `${index * 2}px` : `${index * 4}px`,
    opacity: toast.visible === false ? 0 : 1,
  };
};
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
  transform: translateY(30px);
  opacity: 0;
  @apply md:translate-x-[30px] md:translate-y-0;
}
</style>
