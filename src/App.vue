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
        v-model:mode="mode"
        :is-sidebar-open="isSidebarOpen"
        :is-mobile="isMobile"
        @toggle-sidebar="toggleSidebar"
      />

      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          :mode="mode"
          :settings="settings"
          :is-mobile="isMobile"
          :is-history-open="isHistoryOpen"
          @settings-change="updateSettings"
          @update:mode="updateMode"
          @select-history-item="selectHistoryItem"
          @toggle-history="toggleHistory"
          @update-history="updateHistory"
        />
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
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, provide, ref } from "vue";
import { useRouter } from "vue-router";
import CalculatorHeader from "./components/CalculatorHeader.vue";
import HistoryPanel from "./components/HistoryPanel.vue";
import SidebarMenu from "./components/SidebarMenu.vue";
import db from "./data/db";

const currentInput = ref("0"); // Ensure this is a string to hold expressions
provide("currentInput", currentInput);

const router = useRouter();
const mode = ref("Programmer");
const settings = ref({
  precision: 4,
  useFractions: false,
  useThousandsSeparator: true,
});

const isSidebarOpen = ref(false);
const isHistoryOpen = ref(false);
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
  settings.value = { ...newSettings };
  await saveSettings(newSettings);
};

const updateMode = (newMode) => {
  mode.value = newMode;
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

const loadSettings = async () => {
  const savedSettings = await db.settings.toArray();
  if (savedSettings.length > 0) {
    settings.value = savedSettings[0];
  }
};

const saveSettings = async (newSettings) => {
  const settingsToSave = {
    precision: newSettings.precision,
    useFractions: newSettings.useFractions,
    useThousandsSeparator: newSettings.useThousandsSeparator,
  };
  await db.settings.clear();
  await db.settings.add(settingsToSave);
};

onMounted(async () => {
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeyDown);
  handleResize();
  await loadSettings();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
