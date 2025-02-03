<template>
  <header
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 h-[64.75px]"
  >
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo and Sidebar Toggle Section -->
      <div class="flex items-center justify-between pb-1">
        <button
          v-tippy="{ content: 'Open Sidebar', placement: 'bottom' }"
          class="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 custom-transition"
          :class="[isSidebarOpen ? 'opacity-0 pointer-none' : '']"
          @click="$emit('toggle-sidebar')"
        >
          <PanelRightIcon class="h-6 w-6" />
        </button>
      </div>
      <!-- Mode Toggle and Theme Switch -->
      <div
        class="flex-grow flex justify-center sm:justify-end items-center pb-1"
      >
        <div
          class="w-full sm:w-auto flex justify-between sm:justify-end items-center space-x-4"
        >
          <!-- Spacer for left alignment on mobile -->
          <div />

          <!-- Mode Toggler -->
          <div
            v-if="currentRoute === '/'"
            class="relative w-[70%] sm:w-36"
          >
            <SelectRoot
              v-model="selectedMode"
              class="w-full"
            >
              <SelectTrigger
                class="w-full px-3 py-2 text-sm font-medium sm:w-36 text-gray-700 bg-gray-100 rounded-md transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-between"
              >
                <SelectValue :placeholder="selectedMode" />
                <SelectIcon>
                  <ChevronDown class="w-4 h-4 ml-1" />
                </SelectIcon>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent
                  class="bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <SelectViewport class="p-1 rounded-lg">
                    <SelectItem
                      v-for="option in ['Basic', 'Standard', 'Programmer']"
                      :key="option"
                      :value="option"
                      class="px-3 py-2 text-sm text-gray-700 rounded-sm dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none"
                    >
                      <SelectItemText>{{ option }}</SelectItemText>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>

          <!-- GitHub ref icon -->
          <button
            v-tippy="{ content: 'Star on GitHub', placement: 'bottom' }"
            class="mr-4 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 duration-300 transition-opacity"
          >
            <a
              href="https://github.com/Whitestar14/mathlly-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon class="h-6 w-6" />
            </a>
          </button>
          <!-- Keyboard shortcuts button -->
          <button
            v-if="!isMobile"
            v-tippy="{ content: 'Keyboard Shortcuts', placement: 'bottom' }"
            class="mr-4 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 duration-300 transition-opacity"
            @click="openShortcutModal"
          >
            <Command class="h-6 w-6" />
          </button>
          <!-- Theme Toggle Button -->
          <button
            v-tippy="{ content: 'Toggle theme', placement: 'bottom' }"
            class="p-2 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 custom-transition"
            @click="toggleTheme"
          >
            <Sun
              v-if="isDark"
              class="h-6 w-6"
            />
            <Moon
              v-else
              class="h-6 w-6"
            />
          </button>
        </div>
      </div>
    </div>
    <ShortcutGuide 
      :open="isShortcutModalOpen"
      @update:open="isShortcutModalOpen = $event"
    />
  </header>
</template>

<script setup>
import { useDark } from "@vueuse/core";
import {
  ChevronDown,
  Moon,
  PanelRightIcon,
  Command,
  Sun,
  GithubIcon
} from "lucide-vue-next";
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "radix-vue";
import { computed, watch, ref } from "vue";
import { useRoute } from "vue-router";
import { useSettingsStore } from "@/stores/settings";
import ShortcutGuide from "@/layouts/modals/ShortcutGuide.vue";
import { useKeyboard } from "@/composables/useKeyboard"
defineProps({
  isSidebarOpen: {
    type: Boolean,
  },
  isMobile: {
    type: Boolean,
  },
});

defineEmits(["update:mode", "toggle-sidebar", "update:open"]);
const settings = useSettingsStore();
const route = useRoute();
const currentRoute = ref(route.path);

const isShortcutModalOpen = ref(false);

const isDark = useDark();
const selectedMode = computed({
  get: () => settings.mode,
  set: async (newMode) => {
    await settings.updateMode(newMode);
  },
});

// Sync theme changes between settings and VueUse dark mode
const selectedTheme = computed(() => settings.theme);

watch(selectedTheme, (newTheme) => {
  if (newTheme === "dark") {
    isDark.value = true;
  } else if (newTheme === "light") {
    isDark.value = false;
  } else if (newTheme === "system") {
    isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
});

watch(
  () => route.path,
  (newPath) => {
    currentRoute.value = newPath;
  },
  { immediate: true }
);

const toggleTheme = async () => {
  const newTheme = isDark.value ? "light" : "dark";
  await settings.saveSettings({
    ...settings.$state,
    theme: newTheme,
  });
};

const openShortcutModal = () => {
  isShortcutModalOpen.value = true;
};

useKeyboard("global", {
  openShortcutModal: () => openShortcutModal(),
  toggleTheme: () => toggleTheme(),
})
</script>

<style scoped>
:root {
  --select-content-width: 144px;
}

.select-content {
  width: var(--select-content-width);
}

@media (min-width: 640px) {
  .select-content {
    width: var(--select-content-width);
  }
}

.pointer-none {
  pointer-events: none;
}

.custom-transition {
  transition: opacity 0.3s ease;
}
</style>
