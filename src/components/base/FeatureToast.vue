<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup
      name="toast-transition"
      tag="div"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">
              {{ toast.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ toast.description }}
            </p>
          </div>
          <button
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            @click="toasts = toasts.filter(t => t.id !== toast.id)"
          >
            <XIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';
import { XIcon } from 'lucide-vue-next';

const { toasts } = useToast();
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