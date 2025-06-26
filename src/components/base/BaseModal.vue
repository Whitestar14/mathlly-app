<template>
  <DialogRoot
    :open="open"
    @update:open="handleOpenChange"
  >
    <Transition name="fade">
      <DialogOverlay
        v-if="open"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
        aria-hidden="true"
        @click="closeModal"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <DialogContent
        v-if="open"
        class="fixed inset-0 flex items-center justify-center p-4 z-30"
        :aria-labelledby="titleId"
        role="dialog"
        aria-modal="true"
        @click.self="closeModal"
      >
        <div
          :class="[
            'relative w-full max-h-[85vh] overflow-y-auto transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl',
            sizeClasses
          ]"
          @click.stop
        >
          <!-- Close Button -->
          <BaseButton
            variant="ghost"
            size="icon"
            class="absolute right-4 top-4 dark:text-gray-100 p-1"
            :aria-label="closeButtonLabel"
            @click="closeModal"
          >
            <XIcon class="h-4 w-4" />
            <span class="sr-only">{{ closeButtonLabel }}</span>
          </BaseButton>

          <!-- Title Slot -->
          <div :id="titleId">
            <DialogTitle
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
            >
              <slot name="title">
                {{ title }}
              </slot>
            </DialogTitle>
          </div>

          <!-- Content Slot -->
          <div class="modal-content">
            <slot />
          </div>

          <!-- Footer Slot -->
          <div
            v-if="$slots.footer"
            class="modal-footer mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <slot name="footer" />
          </div>
        </div>
      </DialogContent>
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
import BaseButton from "@/components/base/BaseButton.vue";
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
  showCloseButton: true,
  zIndex: 30,
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
  full: 'max-w-full mx-4',
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

// Listen for escape key when modal is open - Fixed parameter order
useEventListener(document, 'keydown', handleEscapeKey, {
  passive: false,
});
</script>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure modal content is scrollable */
.modal-content {
  max-height: calc(85vh - 8rem); /* Account for header and footer */
  overflow-y: auto;
}

/* Custom scrollbar for modal content */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

.dark .modal-content::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .modal-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

/* Focus trap styling */
.modal-content:focus {
  outline: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .modal-content {
    max-height: calc(90vh - 6rem);
  }
}
</style>
