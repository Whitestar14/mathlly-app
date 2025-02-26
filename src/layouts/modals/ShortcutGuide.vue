<template>
  <BaseModal
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <template #title>
      <div class="flex items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quick access to available shortcuts
          </p>
        </div>
      </div>
    </template>

    <div class="mt-4">
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button
          v-for="category in Object.keys(shortcutGroups)"
          :key="category"
          class="px-4 py-3 text-sm font-medium transition-colors relative"
          :class="[
            activeCategory === category 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          ]"
          @click="activeCategory = category"
        >
          {{ category }}
          <div
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-transform"
            :class="activeCategory === category ? 'scale-x-100' : 'scale-x-0'"
          />
        </button>
      </div>

      <div class="relative overflow-hidden">
        <TransitionGroup
          mode="out-in"
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-4"
        >
          <div
            v-for="(group, category) in shortcutGroups"
            v-show="activeCategory === category"
            :key="category"
            class="p-4 space-y-2"
          >
            <div
              v-for="(shortcut, key) in group"
              :key="key"
              class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50"
            >
              <span class="text-sm text-gray-700 dark:text-gray-400">
                {{ shortcut.description }}
              </span>

              <div class="flex items-center gap-1.5">
                <template v-if="key.includes('+')">
                  <div
                    v-for="(part, index) in key.split('+')"
                    :key="index"
                  >
                    <kbd
                      class="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 text-primary dark:text-primary-light rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      {{ part }}
                    </kbd>
                    <span
                      v-if="index < key.split('+').length - 1"
                      class="text-gray-400 dark:text-gray-500"
                    >+</span>
                  </div>
                </template>
                <kbd
                  v-else
                  class="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 text-primary dark:text-primary-light rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  {{ key }}
                </kbd>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";

defineProps({
  open: Boolean,
});

defineEmits(["update:open"]);

const activeCategory = ref('Global');

const shortcutGroups = {
  Global: {
    "ctrl+shift+f": { description: "Toggle Fullscreen" },
    "ctrl+l": { description: "Toggle Sidebar" },
    "ctrl+h": { description: "Toggle History" },
    "ctrl+s": { description: "Open Settings" },
    "ctrl+space" : { description: "Open the Keyboard Shortcuts"},
    "ctrl+shift+m": { description: "Toggle Theme" },
  },
  Calculator: {
    escape: { description: "Clear Input" },
    enter: { description: "Calculate Result" },
    backspace: { description: "Delete Last Character" },
  },
  Programmer: {
    "ctrl+1": { description: "Switch to Decimal" },
    "ctrl+2": { description: "Switch to Hexadecimal" },
    "ctrl+3": { description: "Switch to Octal" },
    "ctrl+4": { description: "Switch to Binary" },
  },
  Tools: {
    "ctrl+enter": { description: "Process Current Input" },
    "ctrl+v": { description: "Paste from Clipboard" },
    "ctrl+c": { description: "Copy Result" },
    "ctrl+s": { description: "Swap Input/Output" },
  },
};
</script>

<style scoped>
.shortcut-key {
  @apply px-2 py-1 min-w-[1.8rem] text-center rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono shadow-sm;
}

/* Add tab transition styles */
.scale-x-100 {
  transform: scaleX(1);
  transition: transform 0.2s ease;
}

.scale-x-0 {
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

/* Add smoother transitions for content */
.transition-all {
  will-change: transform, opacity;
}
</style>
