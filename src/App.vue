<!-- App.vue -->
<template>
  <div
    class="min-h-screen flex bg-background dark:bg-gray-900 transition-colors duration-300"
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


      <Suspense>
        <template #default>
          <router-view
            :mode="mode"
            :settings="settings"
            :is-mobile="isMobile"
            :is-history-open="isHistoryOpen"
            @settings-change="updateSettings"
            @update:mode="updateMode"
            @select-history-item="selectHistoryItem"
            @update-history="updateHistory"
          />
        </template>
        <template #fallback>
          <calculator-loader />
        </template>
      </Suspense>
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
import { useSettingsStore } from '@/stores/settings'
import { onMounted, onUnmounted, provide, ref, computed } from "vue";
import Toast from "@/components/FeatureToast.vue"
import CalculatorLoader from '@/components/CalculatorLoader.vue'
import CalculatorHeader from "@/layouts/CalculatorHeader.vue";
import HistoryPanel from "@/layouts/HistoryPanel.vue";
import SidebarMenu from "@/layouts/SidebarMenu.vue";

const currentInput = ref("0"); // Ensure this is a string to hold expressions
provide("currentInput", currentInput);

const router = useRouter();
const settings = useSettingsStore()
const mode = computed(() => settings.mode)

const isHistoryOpen = ref(false)
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
  await settings.saveSettings(newSettings)
};

const updateMode = async (newMode) => {
  await settings.updateMode(newMode);
};

const toggleHistory = () => {  // <--- Keep toggleHistory here!
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

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
    toggleFullScreen();
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

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

onMounted(async () => {
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeyDown);
  handleResize();
  await settings.loadSettings()
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
