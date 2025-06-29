<template>
  <DialogRoot
    :open="open"
    @update:open="handleOpenChange"
  >
    <!-- Backdrop -->
    <Transition name="backdrop">
      <DialogOverlay
        v-if="open"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        @click="closeModal"
      />
    </Transition>

    <!-- Modal Container -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <DialogContent
          :class="[
            'relative flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-h-[90vh]',
            sizeClasses
          ]"
          :aria-labelledby="titleId"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Sticky Header -->
          <div class="sticky top-0 z-10 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-xl">
            <div class="flex items-center justify-between p-3 pb-2">
              <!-- Title Section -->
              <div
                :id="titleId"
                class="flex-1 min-w-0 pr-4"
              >
                <DialogTitle
                  as="h2"
                  class="text-lg font-medium text-gray-900 dark:text-white leading-tight"
                >
                  <slot name="title">
                    {{ title }}
                  </slot>
                </DialogTitle>
              </div>

              <!-- Close Button -->
              <BaseButton
                variant="ghost"
                size="icon"
                :aria-label="closeButtonLabel"
                @click="closeModal"
              >
                <XIcon class="h-4 w-4" />
                <span class="sr-only">{{ closeButtonLabel }}</span>
              </BaseButton>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto min-h-0">
            <div class="p-6 pt-4">
              <slot />
            </div>
          </div>

          <!-- Sticky Footer -->
          <div
            v-if="$slots.footer"
            class="sticky bottom-0 z-10 flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl"
          >
            <div class="p-6 pt-4">
              <slot name="footer" />
            </div>
          </div>
        </DialogContent>
      </div>
    </Transition>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import {
  DialogRoot,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "radix-vue";
import { useEventListener } from "@vueuse/core";
import BaseButton from '@/components/base/BaseButton.vue'
import { XIcon } from "lucide-vue-next";

/**
 * Modal size options
 */
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';

/**
 * Component props interface
 */
interface Props {
  /** Whether the modal is open */
  open?: boolean;
  /** Modal title (can also use title slot) */
  title?: string;
  /** Modal size */
  size?: ModalSize;
  /** Whether clicking outside closes the modal */
  closeOnClickOutside?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Custom close button label for accessibility */
  closeButtonLabel?: string;
}

/**
 * Component emits interface
 */
interface Emits {
  /** Emitted when the modal open state changes */
  (e: 'update:open', value: boolean): void;
  /** Emitted when the modal is closed */
  (e: 'close'): void;
  /** Emitted when the modal is opened */
  (e: 'open'): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '',
  size: 'md',
  closeOnClickOutside: true,
  closeOnEscape: true,
  closeButtonLabel: 'Close dialog',
});

const emit = defineEmits<Emits>();

/**
 * Generate unique title ID for accessibility
 */
const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Size classes mapping for different modal sizes
 */
const sizeClassMap: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-[95vw]',
};

/**
 * Computed size classes based on the size prop
 */
const sizeClasses: ComputedRef<string> = computed(() => {
  return sizeClassMap[props.size] || sizeClassMap.md;
});

/**
 * Handle modal open state changes
 */
const handleOpenChange = (isOpen: boolean): void => {
  emit('update:open', isOpen);
  
  if (isOpen) {
    emit('open');
  } else {
    emit('close');
  }
};

/**
 * Close the modal
 */
const closeModal = (): void => {
  if (props.closeOnClickOutside) {
    handleOpenChange(false);
  }
};

/**
 * Handle escape key press
 */
const handleEscapeKey = (event: KeyboardEvent): void => {
  if (props.closeOnEscape && event.key === 'Escape' && props.open) {
    event.preventDefault();
    event.stopPropagation();
    handleOpenChange(false);
  }
};

// Listen for escape key when modal is open
useEventListener(document, 'keydown', handleEscapeKey, {
  passive: false,
});
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Custom scrollbar for content area */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.4);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.6);
}

/* Ensure proper focus management */
[role="dialog"]:focus {
  outline: none;
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .p-6 {
    @apply p-4;
  }
  
  .pb-4 {
    @apply pb-3;
  }
  
  .pt-4 {
    @apply pt-3;
  }
}

/* Prevent content from jumping when scrollbar appears */
.overflow-y-auto {
  scrollbar-gutter: stable;
}
</style>
