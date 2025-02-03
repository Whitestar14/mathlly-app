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
import { useFullscreen } from "@vueuse/core";
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
import { useSidebar } from '@/composables/useSidebar'

const currentInput = ref("0"); 
const isHistoryOpen = ref(false);
const deviceStore = useDeviceStore();
const router = useRouter();
const settings = useSettingsStore();
const displayStore = useDisplayStore(); 
const mode = computed(() => settings.mode);
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

watch(() => deviceStore.isMobile, (newIsMobile) => {
  handleSidebarResize(newIsMobile)
  if (newIsMobile) isHistoryOpen.value = false;
});

watch(router.currentRoute, () => {
  if (deviceStore.isMobile) {
    closeSidebar()
  }
});

const updateHistory = () => {
  // This function can be used to trigger any necessary updates
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

onMounted(() => {
  deviceStore.initializeDeviceInfo();
  const init = async () => {
    await Promise.all([
      settings.loadSettings(),
      new Promise(resolve => setTimeout(resolve, 800))
    ])
    displayStore.updateState({ isLoading: false })
  }
  const keyboardStore = useKeyboardStore();
  keyboardStore.debug = false;
  init();
});

onUnmounted(() => {
  deviceStore.destroyDeviceInfo();
});
</script>

<style scoped>
@import url("./assets/css/animation.css")
</style>
