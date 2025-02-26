<!-- App.vue -->
<template>
  <div
    class="min-h-screen flex bg-background dark:bg-background-dark transition-colors duration-300"
    :class="{
      'animation-disabled': settings.animationDisabled
    }"
  >
    <sidebar-menu
      :is-open="isSidebarOpen"
      :is-mobile="deviceStore.isMobile"
      @update:isOpen="updateSidebarOpen"
      @openAbout="navigateToAbout"
      @openSettings="navigateToSettings"
    />

    <div
      class="flex flex-col flex-grow transition-all duration-300 ease-in-out"
      :class="[!deviceStore.isMobile && isSidebarOpen ? 'ml-64' : '']"
    >
      <calculator-header
        :is-sidebar-open="isSidebarOpen"
        :is-mobile="deviceStore.isMobile"
        @toggle-sidebar="toggleSidebar"
      />

      <router-view v-slot="{ Component }">
        <Transition
          name="fade"
          mode="out-in"
        >
          <calculator-loader v-if="displayStore.isLoading" />
          <component
            :is="Component"
            v-else
            :mode="mode"
            :settings="settings"
            :is-mobile="deviceStore.isMobile"
            :is-history-open="isHistoryOpen"
            @settings-change="updateSettings"
            @update:mode="updateMode"
            @select-history-item="selectHistoryItem"
            @update-history="updateHistory"
            @toggle-history="toggleHistory"
          />
        </Transition>
      </router-view>
    </div>

    <history-panel
      v-if="deviceStore.isMobile"
      :is-open="isHistoryOpen"
      :is-mobile="deviceStore.isMobile"
      :mode="mode"
      @select-history-item="selectHistoryItem"
      @delete-history-item="deleteHistoryItem"
      @clear-history="clearHistory"
      @close="closeHistory"
    />

    <Toast />
  </div>
</template>

<script setup>
import db from "@/data/db";
import { useRouter, RouterView } from "vue-router";
import { useFullscreen } from "@vueuse/core";
import { onMounted, onUnmounted, provide, ref, computed, watch } from "vue";
import { useDisplayStore } from "@/stores/display";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboardStore } from "@/stores/keyboard";
import { useDeviceStore } from '@/stores/device';
import { useKeyboard } from "@/composables/useKeyboard";
import { useSidebar } from '@/composables/useSidebar'
import Toast from "@/components/base/FeatureToast.vue";
import CalculatorLoader from "@/components/ui/CalculatorLoader.vue";
import CalculatorHeader from "@/layouts/CalculatorHeader.vue";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import SidebarMenu from "@/layouts/SidebarMenu.vue";

const currentInput = ref("0");
const isHistoryOpen = ref(false);
const deviceStore = useDeviceStore();
const router = useRouter();
const settingsStore = useSettingsStore(); // Use the store properly
const settings = settingsStore; // For compatibility with existing code
const displayStore = useDisplayStore();
const mode = computed(() => settingsStore.activeMode);
const {
  isOpen: isSidebarOpen,
  toggle: toggleSidebar,
  close: closeSidebar,
  handleResize: handleSidebarResize
} = useSidebar(deviceStore.isMobile)

provide("currentInput", currentInput);

const updateSidebarOpen = (value) => {
  isSidebarOpen.value = value;
};

const navigateToSettings = () => router.push("/settings");
const navigateToAbout = () => router.push("/about");

const updateMode = async (newMode) => {
  // Only update current mode, don't change default
  settingsStore.setCurrentMode(newMode);
};

const updateSettings = async (newSettings) => {
  // When updating from settings, use the new setDefaultMode for mode changes
  if (newSettings.mode !== settingsStore.mode) {
    await settingsStore.setDefaultMode(newSettings.mode);
  }
  // Save other settings
  const settingsToSave = { ...newSettings };
  delete settingsToSave.mode; 
  await settingsStore.saveSettings(settingsToSave);
};

const toggleHistory = () => {
  isHistoryOpen.value = !isHistoryOpen.value;
};

const closeHistory = () => {
  isHistoryOpen.value = false;
};

const clearHistory = async () => {
  await db.history.clear();
};

const selectHistoryItem = (item) => {
  try {
    currentInput.value = item.expression;
  } catch (err) {
    console.error("Error:", err);
  }
};

const deleteHistoryItem = async (id) => {
  await db.history.delete(id);
  updateHistory();
};

// Update sidebar state when device type changes
watch(() => deviceStore.isMobile, (newIsMobile) => {
  handleSidebarResize(newIsMobile)
  if (newIsMobile) isHistoryOpen.value = false;
});

// Close sidebar on mobile navigation
watch(router.currentRoute, () => {
  if (deviceStore.isMobile) {
    closeSidebar()
  }
});

const updateHistory = () => {
  // This function can be used to trigger any necessary updates
};

useKeyboard("global", {
  toggleHistory: () => {
    toggleHistory();
  },
  toggleSidebar: () => {
    toggleSidebar();
  },
  openSettings: () => {
    router.push("/settings");
  },
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle();
  },
});

onMounted(() => {
  deviceStore.initializeDeviceInfo();
  (async function () {
    await Promise.all([
      settingsStore.loadSettings(),
      new Promise(resolve => setTimeout(resolve, 800))
    ]);
    // Initialize current mode from default
    settingsStore.setCurrentMode(settingsStore.defaultMode);
    displayStore.updateState({ isLoading: false });
  })();
  const keyboardStore = useKeyboardStore();
  keyboardStore.debug = false;
});

onUnmounted(() => {
  deviceStore.destroyDeviceInfo();
});
</script>
