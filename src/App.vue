<template>
  <div
    class="min-h-screen flex bg-background dark:bg-gray-900 transition-colors duration-300"
  >
    <sidebar-menu
      :isOpen="isSidebarOpen"
      :isMobile="isMobile"
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
        @toggle-sidebar="toggleSidebar"
        :isSidebarOpen="isSidebarOpen"
        :isMobile="isMobile"
      />

      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          :mode="mode"
          :settings="settings"
          :isMobile="isMobile"
          :isHistoryOpen="isHistoryOpen"
          @settings-change="updateSettings"
          @update:mode="updateMode"
          @add-to-history="addToHistory"
          @clear-history="clearHistory"
          @select-history-item="selectHistoryItem"
          @delete-history-item="deleteHistoryItem"
          @toggle-history="toggleHistory"
          @update-history="updateHistory"
        />
      </router-view>
    </div>

    <history-panel
      v-if="isMobile"
      :isOpen="isHistoryOpen"
      :isMobile="isMobile"
      @selectHistoryItem="selectHistoryItem"
      @deleteHistoryItem="deleteHistoryItem"
      @clearHistory="clearHistory"
      @close="closeHistory"
    />
  </div>

  <shortcut-guide v-model:open="isShortcutGuideOpen" />
</template>

<script setup>
import { onMounted, onUnmounted, provide, ref } from "vue";
import { useRouter } from "vue-router";
import CalculatorHeader from "./components/CalculatorHeader.vue";
import HistoryPanel from "./components/HistoryPanel.vue";
import SidebarMenu from "./components/SidebarMenu.vue";
import ShortcutGuide from './components/ShortcutGuide.vue';
import db from "./data/db";

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
const currentInput = ref("");
const isShortcutGuideOpen = ref(false);

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
  currentInput.value = item.expression;
  if (isMobile.value) closeHistory();
};

const deleteHistoryItem = async (id) => {
  await db.history.delete(id);
};

const addToHistory = async (expression, result) => {
  const timestamp = new Date().getTime();
  await db.history.add({ expression, result, timestamp });
};

const updateHistory = () => {
  // This function can be used to trigger any necessary updates
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  isSidebarOpen.value = !isMobile.value;
};

const openShortcutGuide = () => {
  isShortcutGuideOpen.value = true;
};

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
    toggleFullScreen();
    e.preventDefault();
  } else if (e.ctrlKey) {
    switch (e.key) {
      case 'l':
        toggleSidebar();
        e.preventDefault();
        break;
      case 'h':
        toggleHistory();
        e.preventDefault();
        break;
      case 's':
        navigateToSettings();
        e.preventDefault();
        break;
      case 'k':
        openShortcutGuide();
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
}
 
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
