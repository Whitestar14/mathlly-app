<template>
  <BaseModal 
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <template #title>
      Keyboard Shortcuts 
    </template>

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
          class="flex items-center space-x-1 bg-indigo-100 dark:bg-indigo-900 px-3 py-2 rounded-md shadow-sm"
        >
          <div
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
            >+</span>
          </div>
          <kbd
            class="bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded text-xs font-semibold text-indigo-800 dark:text-indigo-200 shadow"
          >
            {{ shortcut.key.toUpperCase() }}
          </kbd>
        </div>
      </li>
    </ul>
  </BaseModal>
</template>

<script setup>
import BaseModal from "@/components/BaseModal.vue";

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:open"]);

const shortcuts = [
  {
    modifiers: ["Ctrl"],
    key: "l",
    description: "Toggle Sidebar",
  },
  {
    modifiers: ["Ctrl"],
    key: "h",
    description: "Toggle History",
  },
  {
    modifiers: ["Ctrl"],
    key: "s",
    description: "Navigate to Settings",
  },
  {
    modifiers: ["Ctrl"],
    key: "k",
    description: "Open Shortcut Guide",
  },
  {
    modifiers: ["Shift", "Ctrl"],
    key: "f",
    description: "Toggle Full Screen",
  },
];
</script>
