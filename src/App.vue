<!-- App.vue -->
<template>
  <div
    class="min-h-screen flex bg-background dark:bg-gray-900 transition-colors duration-300"
    :class="{ 'borders-transparent': settings.borderless }"
  >
    <sidebar-menu
      :is-open="isSidebarOpen"
      :is-mobile="isMobile"
      @update:isOpen="updateSidebarOpen"
      @openAbout="navigateToAbout"
      @openSettings="navigateToSettings"
    />

    <div
      class="flex flex-col flex-grow transition-all duration-300 ease-in-out"
      :class="[!isMobile && isSidebarOpen ? 'ml-64' : '']"
    >
      <calculator-header
        :is-sidebar-open="isSidebarOpen"
        :is-mobile="isMobile"
        @toggle-sidebar="toggleSidebar"
      />

      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <calculator-loader v-if="displayStore.isLoading" />
          <component
            v-else
            :is="Component"
            :mode="mode"
            :settings="settings"
            :is-mobile="isMobile"
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
      v-if="isMobile"
      :is-open="isHistoryOpen"
      :is-mobile="isMobile"
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
import { useRouter } from "vue-router";
import { useEventListener } from "@vueuse/core";
import { useSettingsStore } from "@/stores/settings";
import { useDisplayStore } from "@/stores/display"; // Import display store
import { onMounted, provide, ref, computed } from "vue";
import Toast from "@/components/FeatureToast.vue";
import CalculatorLoader from "@/components/CalculatorLoader.vue";
import CalculatorHeader from "@/layouts/CalculatorHeader.vue";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import SidebarMenu from "@/layouts/SidebarMenu.vue";
import { useFullscreen } from "@vueuse/core";

const currentInput = ref("0"); // Ensure this is a string to hold expressions
provide("currentInput", currentInput);

const router = useRouter();
const settings = useSettingsStore();
const displayStore = useDisplayStore(); // Use display store
const mode = computed(() => settings.mode);

const isHistoryOpen = ref(false);
const isSidebarOpen = ref(false);
const isMobile = ref(window.innerWidth < 768);

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

const updateHistory = () => {
  // This function can be used to trigger any necessary updates
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  isSidebarOpen.value = !isMobile.value;
};

const toggleFullScreen = useFullscreen(document.documentElement);

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
    toggleFullScreen.toggle();
    e.preventDefault();
  } else if (e.ctrlKey) {
    switch (e.key) {
      case "l":
        toggleSidebar();
        e.preventDefault();
        break;
      case "h":
        toggleHistory();
        e.preventDefault();
        break;
      case "s":
        navigateToSettings();
        e.preventDefault();
        break;
    }
  }
};

useEventListener(window, "resize", handleResize);
useEventListener(window, "keydown", handleKeyDown);

onMounted(async () => {
  handleResize();
  const minLoadTime = new Promise((resolve) => setTimeout(resolve, 800));
  await Promise.all([settings.loadSettings(), minLoadTime]);
  displayStore.updateState({ isLoading: false }); // Update isLoading state in display store
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>