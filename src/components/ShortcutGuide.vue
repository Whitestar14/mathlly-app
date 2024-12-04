<!-- ShortcutGuide.vue -->
<template>
  <DialogRoot :open="open" @update:open="$emit('update:open', $event)">
    <!-- Backdrop -->
    <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

    <!-- Content -->
    <DialogContent
      class="fixed inset-0 flex items-center justify-center p-4 z-[100]"
      @close="closeModal"
    >
      <div
        class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
      >
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute right-4 top-4 rounded-full p-2 opacity-70 ring-offset-background transition-opacity dark:text-gray-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </button>

        <!-- Title -->
        <DialogTitle
          as="h3"
          class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
        >
          Keyboard Shortcuts
        </DialogTitle>

        <!-- Shortcuts List -->
        <ul class="space-y-3">
          <li
            v-for="(shortcut, index) in shortcuts"
            :key="index"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <span class="text-sm text-gray-600 dark:text-gray-300 mb-1 sm:mb-0">
              {{ shortcut.description }}
            </span>
            <div
              class="flex items-center space-x-1 bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-md shadow-sm"
            >
              <template
                v-for="(modifier, modIndex) in shortcut.modifiers"
                :key="modIndex"
              >
                <kbd
                  class="bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded text-xs font-semibold text-indigo-800 dark:text-indigo-200 shadow"
                >
                  {{ modifier }}
                </kbd>
                <span
                  v-if="modIndex < shortcut.modifiers.length - 1"
                  class="text-indigo-500 dark:text-indigo-400"
                  >+</span
                >
              </template>
              <kbd
                class="bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded text-xs font-semibold text-indigo-800 dark:text-indigo-200 shadow"
              >
                {{ shortcut.key.toUpperCase() }}
              </kbd>
            </div>
          </li>
        </ul>
      </div>
    </DialogContent>
  </DialogRoot>
</template>

<script setup>
import { XIcon } from "lucide-vue-next";
import {
  DialogContent,
  DialogOverlay,
  DialogRoot,
  DialogTitle,
} from "radix-vue";
import { defineEmits, defineProps } from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:open"]);

const closeModal = () => {
  emit("update:open", false);
};

const shortcuts = [
  {
    modifiers: ["Ctrl"],
    key: "l",
    description: "Toggle Sidebar",
    action: "toggleSidebar",
  },
  {
    modifiers: ["Ctrl"],
    key: "h",
    description: "Toggle History",
    action: "toggleHistory",
  },
  {
    modifiers: ["Ctrl"],
    key: "s",
    description: "Navigate to Settings",
    action: "navigateSettings",
  },
  {
    modifiers: ["Ctrl"],
    key: "k",
    description: "Open Shortcut Guide",
    action: "openShortcutGuide",
  },
  {
    modifiers: ["Shift", "Ctrl"],
    key: "f",
    description: "Toggle Full Screen",
    action: "toggleFullScreen",
  },
];
</script>

<style scoped>
kbd {
  font-family: "Reddit mono", "Consolas", monospace;
}
</style>
