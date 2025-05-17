<template>
  <header
    class="flex justify-center items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 min-h-14"
  >
    <div class="container mx-auto flex justify-between items-center gap-2">
      <!-- Sidebar Toggle -->
      <div class="flex items-center justify-between gap-3">
        <Button
          v-tippy="{ content: isSidebarOpen ? 'Close Sidebar': 'Open Sidebar', placement: 'right' }"
          variant="ghost"
          size="icon"
          @click="$emit('toggle-sidebar')"
        >
          <component :is="isSidebarOpen ? PanelLeftCloseIcon : PanelLeftIcon" class="h-5 w-5" />
        </Button>
        <offline-indicator :is-mobile="isMobile" />
      </div>

      <!-- Mode Toggle and Theme Switch -->
      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full sm:w-auto flex justify-end items-center space-x-4">
          <!-- Mode Toggler using SelectBar - Lazy loaded when visible -->
          <Suspense v-if="isCalculatorRoute">
            <div class="relative w-full min-w-36">
              <Select
                :model-value="currentMode"
                :options="availableModes"
                position="popper"
                placeholder="Select mode"
                @update:model-value="onModeChange"
              />
            </div>
          </Suspense>

          <div class="flex items-center justify-between gap-2">
            <!-- Keyboard Shortcuts -->
            <Button
              v-if="!isMobile"
              v-tippy="{content: 'Keyboard Shortcuts'}"
              variant="ghost"
              size="icon"
              @click="openShortcutModal"
            >
              <Command class="h-5 w-5" />
              <span class="sr-only">Keyboard Shortcuts</span>
            </Button>

            <Button
              v-tippy="{ content: isMenubarOpen ? 'Close Menu': 'Open Menu', placement: 'left' }"
              variant="ghost"
              size="icon"
              @click="$emit('toggle-menubar')"
            >
              <component 
                :is="menuIcon" 
                class="h-5 w-5" 
                :class="{ 'rotate-180': !isMobile }"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
    <ShortcutGuide v-model="isShortcutModalOpen" />
  </header>
</template>

<script setup>
import { shallowRef, computed, defineAsyncComponent } from "vue";
import {
  Command,
  PanelLeftIcon,
  PanelLeftCloseIcon,
  MoreVerticalIcon
} from "lucide-vue-next";
import { useRoute } from "vue-router";
import { useSettingsStore } from '@/stores/settings';
import { useKeyboard } from "@/composables/useKeyboard";
import { useTheme } from "@/composables/useTheme";
import ShortcutGuide from "@/components/ui/ShortcutGuide.vue";
import Button from "@/components/base/BaseButton.vue";
import OfflineIndicator from '@/components/ui/OfflineIndicator.vue';

// Lazy load the Select component to improve initial load time
const Select = defineAsyncComponent(() => 
  import("@/components/ui/SelectBar.vue")
);

const props = defineProps({
  isMobile: {
    type: Boolean,
    required: true,
  },
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
  isMenubarOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:mode", "toggle-sidebar", "toggle-menubar"]);

const availableModes = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Scientific', label: 'Scientific' },
  { value: 'Programmer', label: 'Programmer' }
];

const route = useRoute();
const isShortcutModalOpen = shallowRef(false);
const { toggleTheme } = useTheme();
const settingsStore = useSettingsStore();
const currentMode = shallowRef(settingsStore.calculator.mode);

const isCalculatorRoute = computed(() => route.path === '/calculator');

const menuIcon = computed(() => {
  if (props.isMobile) {
    return MoreVerticalIcon;
  }
  return props.isMenubarOpen ? PanelLeftCloseIcon : PanelLeftIcon;
});

const onModeChange = (newMode) => {
  emit("update:mode", newMode);
  currentMode.value = newMode;
};

const openShortcutModal = () => {
  isShortcutModalOpen.value = true;
};

// Keyboard shortcuts
useKeyboard("global", {
  toggleTheme,
  openShortcutModal,
});
</script>
