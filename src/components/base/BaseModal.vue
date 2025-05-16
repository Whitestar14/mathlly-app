<template>
  <DialogRoot
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <Transition name="fade">
      <DialogOverlay
        v-if="open"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
        @click="closeModal"
        aria-hidden="true"
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
          class="relative w-full max-w-md max-h-[85vh] overflow-y-auto transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl"
          @click.stop
        >
          <!-- Close Button -->
          <Button
            variant="ghost"
            size="icon"
            class="absolute right-4 top-4 dark:text-gray-100 p-1"
            @click="closeModal"
            aria-label="Close dialog"
          >
            <XIcon class="h-4 w-4" />
            <span class="sr-only">Close</span>
          </Button>

          <!-- Title Slot -->
          <div :id="titleId">
          <DialogTitle
            as="h3"
            class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
          >
            <slot name="title" />
          </DialogTitle>
          </div>

          <!-- Content Slot -->
          <slot />
        </div>
      </DialogContent>
    </Transition>
  </DialogRoot>
</template>

<script setup>
import {
  DialogRoot,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "radix-vue"
import { useEventListener } from "@vueuse/core"
import Button from "@/components/base/BaseButton"
import { XIcon } from "lucide-vue-next"
import { computed } from 'vue'

const props = defineProps({
  open: Boolean,
})

const emit = defineEmits(["update:open"])

// Generate unique ID for accessibility
const titleId = computed(() => `modal-title-${Math.random().toString(36).substring(2, 9)}`)

// Function to close the modal
const closeModal = () => {
  emit("update:open", false)
}

// Close modal on escape key
useEventListener(document, 'keydown', (e) => {
  if (e.key === 'Escape' && props.open) {
    closeModal()
  }
})
</script>
