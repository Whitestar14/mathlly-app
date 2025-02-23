<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 h-[64.75px]">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Sidebar Toggle -->
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
      <div class="flex-grow flex justify-center sm:justify-end items-center pb-1">
        <div class="w-full sm:w-auto flex justify-between sm:justify-end items-center space-x-4">
          <div />
          
          <!-- Mode Toggler using SelectBar -->
          <div v-if="currentRoute === '/'" class="relative w-[70%] sm:w-36">
            <Select
              v-model="selectedMode"
              :options="modes.map(mode => ({ value: mode, label: mode }))"
              placeholder="Select mode"
            />
          </div>

          <!-- GitHub ref icon -->
          <a
            href="https://github.com/Whitestar14/mathlly-app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Github Page Link"
            class="mr-4 inline-flex items-center justify-center"
          >
            <button
              v-tippy="{ content: 'Star on GitHub', placement: 'bottom' }"
              class="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 duration-300 transition-opacity"
            >
              <GithubIcon class="h-6 w-6" />
            </button>
          </a>
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
    <ShortcutGuide :open="isShortcutModalOpen" @update:open="isShortcutModalOpen = $event" />
  </header>
</template>

<script setup>
import { computed, watch, ref } from "vue";
import { Moon, PanelRightIcon, Command, Sun, GithubIcon } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { useDisplayStore } from "@/stores/display";
import { useTheme } from "@/composables/useTheme";
import ShortcutGuide from "@/layouts/modals/ShortcutGuide.vue";
import Select from "@/components/SelectBar.vue";

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
  },
  isMobile: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:mode", "toggle-sidebar", "update:open"]);

const settings = useSettingsStore();
const route = useRoute();
const currentRoute = ref(route.path);
const { modes } = useDisplayStore();
const isShortcutModalOpen = ref(false);

const { isDark, toggleTheme } = useTheme();

const selectedMode = computed({
  get: () => settings.currentMode || settings.defaultMode,
  set: (newMode) => {
    if (newMode !== settings.currentMode) {
      settings.setCurrentMode(newMode);
      emit('update:mode', newMode);
    }
  }
});

watch(
  () => route.path,
  (newPath) => {
    currentRoute.value = newPath;
  },
  { immediate: true }
);

const openShortcutModal = () => {
  isShortcutModalOpen.value = true;
};

useKeyboard("global", {
  openShortcutModal: () => openShortcutModal(),
  toggleTheme: () => toggleTheme(),
});
</script>

<style scoped>
.pointer-none {
  pointer-events: none;
}

.custom-transition {
  transition: opacity 0.3s ease;
}
</style>
