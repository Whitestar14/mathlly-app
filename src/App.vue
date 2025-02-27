<template>
<div v-if="isLoadingApp">
    <base-loader variant="macro" />
  </div>
  <div
    v-else
    class="min-h-screen flex bg-background dark:bg-background-dark transition-colors duration-300"
    :class="{
      'animation-disabled': settings.animationDisabled,
    }"
  >
    <sidebar-menu
      :is-open="isOpen"
      :is-mobile="deviceStore.isMobile"
      @update:isOpen="close"
    />

    <div
      class="flex flex-col flex-grow transition-all duration-300 ease-in-out"
      :class="[!deviceStore.isMobile && isOpen ? 'ml-64' : '']"
    >
      <calculator-header
        :is-open="isOpen"
        :is-mobile="deviceStore.isMobile"
        @toggle-sidebar="toggle"
      />

      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
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
import { useDeviceStore } from "@/stores/device";
import { useKeyboard } from "@/composables/useKeyboard";
import { useSidebar } from "@/composables/useSidebar";
import Toast from "@/components/base/FeatureToast.vue";
import CalculatorLoader from "@/components/ui/CalculatorLoader.vue";
import CalculatorHeader from "@/layouts/AppHeader.vue";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import SidebarMenu from "@/layouts/SidebarMenu.vue";
import { useLoader } from "@/composables/useLoader"; // Import useLoader
import BaseLoader from "@/components/base/BaseLoader.vue"; // Import BaseLoader

const currentInput = ref("0");
const isHistoryOpen = ref(false);
const deviceStore = useDeviceStore();
const router = useRouter();
const settingsStore = useSettingsStore();
const settings = settingsStore;
const displayStore = useDisplayStore();
const mode = computed(() => settingsStore.activeMode);
const { isOpen, toggle, close, handleResize } = useSidebar(
  deviceStore.isMobile
);

provide("currentInput", currentInput);

const updateMode = async (newMode) => {
  settingsStore.setCurrentMode(newMode);
};

const updateSettings = async (newSettings) => {
  if (newSettings.mode !== settingsStore.mode) {
    await settingsStore.setDefaultMode(newSettings.mode);
  }
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

watch(() => deviceStore.isMobile, (newIsMobile) => {
  handleResize(newIsMobile);
  if (newIsMobile) isHistoryOpen.value = false;
});

watch(router.currentRoute, () => {
  if (deviceStore.isMobile) {
    close();
  }
});

const updateHistory = () => {};

useKeyboard("global", {
  toggleHistory: () => {
    toggleHistory();
  },
  toggleSidebar: () => {
    toggle();
  },
  openSettings: () => {
    router.push("/settings");
  },
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle();
  },
});

const isLoadingApp = ref(true);
const { showLoader, hideLoader } = useLoader(); // use the loader composable

onMounted(async () => {
  deviceStore.initializeDeviceInfo();
  try {
    showLoader('macro'); // show macro loader
    await Promise.all([
      settingsStore.loadSettings(),
      router.isReady(),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
    settingsStore.setCurrentMode(settingsStore.defaultMode);
    displayStore.updateState({ isLoading: false });
  } finally {
    isLoadingApp.value = false;
    hideLoader(); // hide the loader
  }
  const keyboardStore = useKeyboardStore();
  keyboardStore.debug = false;
});

onUnmounted(() => {
  deviceStore.destroyDeviceInfo();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>