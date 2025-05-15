<template>
  <div 
    class="fixed z-30 bottom-4 right-4 h-auto w-80" 
    :class="{ '-translate-x-1/2 left-1/2 right-auto': isMobile }"
    >
    <TransitionGroup 
    name="toast-transition" 
    tag="div"
    class="relative"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="absolute overflow-hidden origin-bottom-right duration-300 transform-gpu flex items-start gap-2"
        :class="[
          toastTypeClasses[toast.type] || toastTypeClasses.info,
          'rounded-md shadow-lg border p-3 w-full'
        ]"
        :style="getToastStyle(toasts.indexOf(toast))"
      >
        <div class="flex-shrink-0 mt-0.5">
          <component 
            :is="getToastIcon(toast.type)" 
            :class="getIconClass(toast.type)"
            class="h-4 w-4" 
          />
        </div>
        <div class="flex-grow">
          <div class="flex justify-between items-start">
            <h3
              class="font-medium text-sm"
              :class="getTitleClass(toast.type)"
            >
              {{ toast.title || getDefaultTitle(toast.type) }}
            </h3>
          </div>
          <p class="text-xs mt-0.5" :class="getMessageClass(toast.type)">
            {{ toast.message || toast.description }}
          </p>
        </div>
        <div
          v-if="toast.dismissible !== false"
          class="flex-shrink-0"
        >
          <Button 
            size="sm" 
            variant="ghost" 
            class="rounded-full p-1 h-auto"
            @click="removeToast(toast.id)"
          >
            <XIcon class="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { XIcon, InfoIcon, CheckCircle2Icon, AlertTriangleIcon, CircleXIcon } from 'lucide-vue-next';
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
  info: 'bg-gray-50 dark:bg-gray-950/95 border-gray-200 dark:border-gray-800',
  success: 'bg-emerald-50 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-50 dark:bg-amber-950/95 border-amber-200 dark:border-amber-800',
  error: 'bg-rose-50 dark:bg-rose-950/95 border-rose-200 dark:border-rose-800'
};

/**
 * Get title text classes based on toast type
 */
const getTitleClass = (type) => {
  const classes = {
    info: 'text-gray-900 dark:text-gray-100',
    success: 'text-green-700 dark:text-green-400',
    warning: 'text-yellow-700 dark:text-yellow-400',
    error: 'text-red-700 dark:text-red-400'
  };
  
  return classes[type] || classes.info;
};

/**
 * Get message text classes based on toast type
 * @param type 
 */
const getMessageClass = (type) => {
  const classes = {
    info: 'text-gray-600 dark:text-gray-300',
    success: 'text-green-600 dark:text-green-300',
    warning: 'text-yellow-600 dark:text-yellow-300',
    error: 'text-red-600 dark:text-red-300'
  };

  return classes[type] || classes.info;
}

/**
 * Get icon class based on toast type
 */
  const getIconClass = (type) => {
    const classes = {
      info: 'text-gray-700 dark:text-gray-300',
      success: 'text-green-700 dark:text-green-400',
      warning: 'text-yellow-700 dark:text-yellow-400', 
      error: 'text-red-700 dark:text-red-400'
    };
  
  return classes[type] || classes.info;
};

/**
 * Get appropriate icon component based on toast type
 */
const getToastIcon = (type) => {
  const icons = {
    info: InfoIcon,
    success: CheckCircle2Icon,
    warning: AlertTriangleIcon,
    error: CircleXIcon
  };
  
  return icons[type] || icons.info;
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
const getToastStyle = (index) => {
  return {
    zIndex: toasts.value.length - index, // Newer toasts have higher z-index
    bottom: props.isMobile ? `${index * 4}px` : `${index * 8}px`,
    right: props.isMobile ? `${index * 2}px` : `${index * 4}px`,
  };
};
</script>

<style scoped>
/* Simplified transitions for better mobile performance */
.toast-transition-enter-active,
.toast-transition-leave-active,
.toast-transition-move {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-transition-enter-from,
.toast-transition-leave-to {
  transform: translateY(20px);
  opacity: 0;
  @apply md:translate-x-[20px] md:translate-y-0;
}
</style>
