<!-- App.vue -->
<template>
  <div
    class="min-h-screen flex bg-background dark:bg-gray-900 transition-colors duration-300"
    :class="{ 'borders-transparent': settings.borderless }"
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
import { useEventListener, useFullscreen } from "@vueuse/core";
import { onMounted, onUnmounted, provide, ref, computed, watch } from "vue";
import { useDisplayStore } from "@/stores/display"; 
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { useDeviceStore } from '@/stores/device';
import Toast from "@/components/FeatureToast.vue";
import CalculatorLoader from "@/components/CalculatorLoader.vue";
import CalculatorHeader from "@/layouts/CalculatorHeader.vue";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import SidebarMenu from "@/layouts/SidebarMenu.vue";
import { useKeyboardStore } from "./stores/keyboard";

const currentInput = ref("0"); 
const isHistoryOpen = ref(false);
const isSidebarOpen = ref(false);
const deviceStore = useDeviceStore();
const router = useRouter();
const settings = useSettingsStore();
const displayStore = useDisplayStore(); 
const mode = computed(() => settings.mode);

provide("currentInput", currentInput);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const updateSidebarOpen = (value) => {
  isSidebarOpen.value = value;
};

const navigateToSettings = () => router.push("/settings");
const navigateToAbout = () => router.push("/about");

const updateSettings = async (newSettings) => {
  await settings.saveSettings(newSettings);
};

const updateMode = async (newMode) => {
  await settings.updateMode(newMode);
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

watch(() => deviceStore.isMobile, (newVal) => {
  if (newVal) isHistoryOpen.value = false;
});

const updateHistory = () => {
  // This function can be used to trigger any necessary updates
};

const handleResize = () => {
  deviceStore.updateDeviceInfo();
  isSidebarOpen.value = !deviceStore.isMobile;
};

// Then use the composable
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

useEventListener(window, "resize", handleResize);


onMounted(() => {
  deviceStore.initializeDeviceInfo();
  const init = async () => {
  const minLoadTime = new Promise((resolve) => setTimeout(resolve, 800));
  await Promise.all([settings.loadSettings(), minLoadTime]);
  displayStore.updateState({ isLoading: false });
  const keyboardStore = useKeyboardStore();
  keyboardStore.debug = false;
};
init();
});

onUnmounted(() => {
  deviceStore.destroyDeviceInfo();
});
</script>

<style scoped>
@import url("./assets/css/animation.css")
</style>
