<template>
  <BaseModal
    :open="show"
    @update:open="handleModalUpdate"
  >
    <template #title>
      <div class="flex items-center">
        <div>
          <h2 class="text-xl font-medium text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quick access to available shortcuts
          </p>
        </div>
      </div>
    </template>

    <div class="mt-4">
      <div class="flex border-b border-gray-200 dark:border-gray-800 relative">
        <Indicator :position="indicatorStyle" />
        <button
          v-for="category in Object.keys(shortcutGroups)"
          :key="category"
          ref="tabElements"
          :data-path="category"
          class="px-4 py-3 text-sm font-medium transition-colors relative"
          :class="[
            currentPill === category
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300',
          ]"
          @click="handleTabChange(category, $event.target as HTMLElement)"
        >
          {{ category }}
        </button>
      </div>

      <div class="relative overflow-hidden h-[250px] overflow-y-auto">
        <TransitionGroup
          enter-active-class="transition-transform duration-200 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-4"
        >
          <div
            v-for="(group, category) in shortcutGroups"
            v-show="currentPill === category"
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
                    class="inline-flex items-center"
                  >
                    <kbd
                      class="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-primary dark:text-primary-light rounded border border-gray-200 dark:border-gray-700 shadow-sm"
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
                  class="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-primary dark:text-primary-light rounded border border-gray-200 dark:border-gray-700 shadow-sm"
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

<script setup lang="ts">
import { shallowRef, type ShallowRef } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { usePills } from "@/composables/usePills";
import Indicator from "@/components/ui/PillIndicator.vue";

interface Shortcut {
  description: string;
}

type ShortcutGroup = Record<string, Shortcut>;

interface ShortcutGroups {
  [category: string]: ShortcutGroup;
}

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'close'): void;
}>();

const tabElements: ShallowRef<HTMLElement[]> = shallowRef([]);

const shortcutGroups: ShortcutGroups = {
  Global: {
    "ctrl+alt+f": { description: "Toggle Fullscreen" },
    "ctrl+l": { description: "Toggle Sidebar" },
    "ctrl+h": { description: "Toggle Activity" },
    "ctrl+,(comma)": { description: "Toggle Menubar" },
    "ctrl+space": { description: "Open the Keyboard Shortcuts" },
    "ctrl+shift+m": { description: "Toggle Theme" },
  },
  Calculator: {
    escape: { description: "Clear Input" },
    enter: { description: "Calculate Result" },
    backspace: { description: "Delete Last Character" },
  },
  Programmer: {
    "ctrl+1": { description: "Switch to Hexadecimal" },
    "ctrl+2": { description: "Switch to Decimal" },
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

function handleModalUpdate(isOpen: boolean): void {
  emit('update:show', isOpen);
  if (!isOpen) {
    emit('close');
  }
}

const {
  currentPill,
  indicatorStyle,
  handleNavigation
} = usePills({
  position: "bottom",
  updateRoute: false,
  defaultPill: "Global",
  containerRef: tabElements
});

function handleTabChange(category: string, tabElement: HTMLElement): void {
  handleNavigation(category, tabElement);
}
</script>
