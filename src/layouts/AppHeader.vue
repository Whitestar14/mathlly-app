<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 h-[64.75px]">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Sidebar Toggle -->
      <div class="flex items-center justify-between">
        <Button
          v-tippy="{ content: 'Open Sidebar', placement: 'bottom' }"
          :class="{ 'hidden': isOpen }"
          variant="ghost"
          size="icon"
          @click="$emit('toggle-sidebar')"
        >
          <PanelRightIcon class="h-6 w-6" />
        </Button>
      </div>

      <!-- Mode Toggle and Theme Switch -->
      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full sm:w-auto flex justify-between sm:justify-end items-center space-x-4">
          <div />

          <!-- Mode Toggler using SelectBar -->
          <div
            v-if="currentRoute === '/'"
            class="relative w-[80%] sm:w-36"
          >
            <Select
              v-model="selectedMode"
              :options="modes.map((mode) => ({ value: mode, label: mode }))"
              label=""
              position="popper"
              placeholder="Select mode"
            />
          </div>

          <MainMenu
            :is-mobile="isMobile"
            :is-dark="isDark"
            @toggle-theme="toggleTheme"
            @open-shortcut-modal="openShortcutModal"
          />
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
import { computed, watch, ref } from "vue";
import {
  PanelRightIcon,
} from "lucide-vue-next";
import { useRoute } from "vue-router";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { useTheme } from "@/composables/useTheme";
import MainMenu from "@/components/ui/MainMenu.vue"
import ShortcutGuide from "@/layouts/modals/ShortcutGuide.vue";
import Select from "@/components/ui/SelectBar.vue";
import Button from "@/components/base/BaseButton.vue";

defineProps({
  isOpen: {
    type: Boolean,
  },
  isMobile: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:mode", "toggle-sidebar", "update:open"]);

const settings = useSettingsStore();
const route = useRoute();
const currentRoute = ref(route.path);
const modes = ['Standard', 'Scientific (soon)', 'Programmer'];
const isShortcutModalOpen = ref(false);

const { isDark, toggleTheme } = useTheme();

const selectedMode = computed({
  get: () => settings.currentMode || settings.defaultMode,
  set: (newMode) => {
    if (newMode !== settings.currentMode) {
      settings.setCurrentMode(newMode);
      emit("update:mode", newMode);
    }
  },
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